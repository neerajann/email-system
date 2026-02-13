import './config/env.js'
import { SMTPServer } from 'smtp-server'
import { simpleParser } from 'mailparser'
import { authenticate } from 'mailauth'
import { User } from '@email-system/core/models'
import connectDB from '@email-system/core/config'
import { domainEmailPattern, emailPattern } from '@email-system/core/utils'
import { createInboundEmailQueue } from '@email-system/core/queues'
import { createRedisClient } from '@email-system/core/redis'

const redis = createRedisClient()
const inboundEmailQueue = await createInboundEmailQueue(redis)
await connectDB()

// Customizable constants via env
const PORT = process.env.PORT || 25
const MAX_CONN_PER_MIN = Number(process.env.MAX_CONN_PER_MIN ?? 3)
const MAX_RCPT_COUNT = Number(process.env.MAX_RCPT_COUNT ?? 30)
const MAX_MSG_PER_CONN = Number(process.env.MAX_MSG_PER_CONN ?? 50)
const MAX_MAIL_AUTH_FAILS = Number(process.env.MAX_MAIL_AUTH_FAILS ?? 5)

// Create a server
const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  size: 17 * 1024 * 1024, // Maximum size of a mail 17MB
  banner: 'Welcome to ' + process.env.DOMAIN_NAME,

  // Runs when someone tries to connect to the server
  async onConnect(session, cb) {
    // If specified secure and no PTR record exist for the connecting ip reject the connection
    if (
      process.env.SECURE === 'true' &&
      session.clientHostname.startsWith('[') &&
      session.clientHostname.endsWith(']')
    ) {
      return cb(
        new Error(
          '550 5.7.1 Client does not have a PTR record, refusing connection',
        ),
      )
    }

    // Check grey list from redis
    const isGreyListed = await redis.get(`greylist:${session.remoteAddress}`)
    if (isGreyListed) {
      return cb(new Error('421 Temporary failure, try again later'))
    }

    // Only allows limited number of connection from same ip per minute to prevent against connection flooding
    const key = `smtp:conn:${session.remoteAddress}`
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, 60)
    }
    if (count > MAX_CONN_PER_MIN) {
      return cb(new Error('421 Too many connections, try later'))
    }
    // If all checks pass accept connection
    cb()
  },

  // Handles MAIL FROM command
  onMailFrom(address, session, cb) {
    // Reject if not a valid email pattern
    if (!emailPattern.test(address.address)) {
      return cb(
        new Error('553 5.1.7 Sender address rejected: invalid address syntax'),
      )
    }
    // Reject if it is from local domain as smtp submission for the local domain is only handled via backend
    if (domainEmailPattern.test(address.address)) {
      return cb(
        new Error(
          '553 5.7.1 Sender address rejected: This domain does not permit SMTP submission. Please use the authorized application.',
        ),
      )
    }

    // Normal case accept the Mail from
    cb()
  },

  // Handles MAIL FROM command
  async onRcptTo(address, session, cb) {
    // Limt excessive RCPT TO commands to prevent against SMTP enumeration
    session.rcptCount = (session.rcptCount || 0) + 1
    if (session.rcptCount > MAX_RCPT_COUNT) {
      return cb(new Error('452 Too many recipients'))
    }

    // Reject recipients that doesnot belong to the domain
    if (!domainEmailPattern.test(address.address)) {
      return cb(new Error('550 Doesnot belong to this domain'))
    }

    // Check if user exist in the database
    const user = await User.findOne(
      {
        emailAddress: address.address,
      },
      { _id: 1 },
    )

    if (!user) {
      return cb(new Error('550 User doesnot exist'))
    }
    // Accept RCPT if all conditions pass
    cb()
  },

  async onData(stream, session, cb) {
    // Log to console for debugging
    console.log(
      'Sessionn id',
      session.id,
      'Received new mail:',
      session.remoteAddress,
      'Mail from',
      session.envelope.mailFrom.address,
      'Mail to',
      session.envelope.rcptTo,
    )

    // Connection-level message rate limiting to reduce spam and resource abuse
    session.msgCount = (session.msgCount || 0) + 1

    if (session.msgCount > MAX_MSG_PER_CONN) {
      return cb(new Error('452 Too many messages'))
    }

    try {
      let raw = await readStream(stream)

      if (process.env.SECURE === 'true') {
        // Perfrom email security checks
        const result = await authenticate(raw, {
          ip: session.remoteAddress,
          sender: session.envelope.mailFrom.address,
        })

        const spfPass = result?.spf?.status?.result === 'pass'
        const dkimPass = result?.dkim?.results?.some(
          (r) => r.status?.result === 'pass',
        )

        // Accept if at least one checks pass
        if (spfPass || dkimPass) {
          const parsedMail = await simpleParser(raw)
          //Add to inbound queue
          addToInboundQueue(session.envelope, parsedMail)
          return cb()
        }

        const key = `dmarc:failures:ip:${session.remoteAddress}`
        const count = await redis.incr(key)
        if (count === 1) await redis.expire(key, 10 * 60)
        // Add to grey list after multiple failed security checks
        if (count > MAX_MAIL_AUTH_FAILS) {
          await redis.set(
            `greylist:${session.remoteAddress}`,
            true,
            'EX',
            60 * 60,
          )
          return cb(new Error('421 Temporary failure, try again later'))
        }

        // Notify the sender server about what went wrong
        const domain = result?.dmarc?.domain ?? result?.spf?.domain
        if (domain)
          return cb(
            new Error(
              `550 5.7.1 DMARC fail: SPF and DKIM failed or were not aligned for domain ${domain}`,
            ),
          )
        return cb(
          new Error(
            '550 5.7.1 Authentication required: DMARC validation failed or missing',
          ),
        )
      }
      // Accept if not specified secure in env
      else {
        const parsedMail = await simpleParser(raw)
        await addToInboundQueue(session.envelope, parsedMail)
        console.log('Session id:', session.id, 'Mail added to queue')
        raw = null
        return cb()
      }
    } catch (error) {
      console.error('SMTP Data Error:', error)
      return cb(new Error('Message rejected due to processing error'))
    }
  },
})

// Converts stream to buffer
const readStream = async (stream) => {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

// Adds to incoming mail queue
const addToInboundQueue = async (envelope, parsedMail) => {
  await inboundEmailQueue.add(
    'inboundEmailQeue',
    {
      envelope,
      mail: parsedMail,
    },
    {
      attempts: 1,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: {
        age: 3600,
      },
      removeOnFail: {
        age: 24 * 3600,
      },
    },
  )
  return true
}

server.on('error', (error) => {
  console.log(error)
})

//Listen on specified port
server.listen(PORT, () => console.log(`SMTP server listening on port ${PORT}`))
