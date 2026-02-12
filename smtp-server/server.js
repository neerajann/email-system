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

const PORT = process.env.PORT || 25
const MAX_CONN_PER_MIN = Number(process.env.MAX_CONN_PER_MIN ?? 3)
const MAX_RCPT_COUNT = Number(process.env.MAX_RCPT_COUNT ?? 30)
const MAX_MSG_PER_CONN = Number(process.env.MAX_MSG_PER_CONN ?? 50)
const MAX_DMRAC_FAILURE = Number(process.env.MAX_DMRAC_FAILURE ?? 5)

const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  size: 17 * 1024 * 1024,
  banner: 'Welcome to ' + process.env.DOMAIN_NAME,

  async onConnect(session, cb) {
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

    const isGreyListed = await redis.get(`greylist:${session.remoteAddress}`)
    if (isGreyListed) {
      return cb(new Error('421 Temporary failure, try again later'))
    }

    const key = `smtp:conn:${session.remoteAddress}`
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, 60)
    }
    if (count > MAX_CONN_PER_MIN) {
      return cb(new Error('421 Too many connections, try later'))
    }
    cb()
  },

  onMailFrom(address, session, cb) {
    if (!emailPattern.test(address.address)) {
      return cb(
        new Error('553 5.1.7 Sender address rejected: invalid address syntax'),
      )
    }
    if (domainEmailPattern.test(address.address)) {
      return cb(
        new Error(
          '553 5.7.1 Sender address rejected: This domain does not permit SMTP submission. Please use the authorized application.',
        ),
      )
    }
    cb()
  },

  async onRcptTo(address, session, cb) {
    session.rcptCount = (session.rcptCount || 0) + 1
    if (session.rcptCount > MAX_RCPT_COUNT) {
      return cb(new Error('452 Too many recipients'))
    }

    if (!domainEmailPattern.test(address.address)) {
      return cb(new Error('550 Doesnot belong to this domain'))
    }

    const user = await User.findOne(
      {
        emailAddress: address.address,
      },
      { _id: 1 },
    )

    if (!user) {
      return cb(new Error('550 User doesnot exist'))
    }

    cb()
  },

  async onData(stream, session, cb) {
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

    session.msgCount = (session.msgCount || 0) + 1

    if (session.msgCount > MAX_MSG_PER_CONN) {
      return cb(new Error('452 Too many messages'))
    }
    try {
      let raw = await readStream(stream)

      if (process.env.SECURE === 'true') {
        const result = await authenticate(raw, {
          ip: session.remoteAddress,
          sender: session.envelope.mailFrom.address,
        })

        const spfPass = result?.spf?.status?.result === 'pass'
        const dkimPass = result?.dkim?.results?.some(
          (r) => r.status?.result === 'pass',
        )

        if (spfPass || dkimPass) {
          const parsedMail = await simpleParser(raw)
          addToInboundQueue(session.envelope, parsedMail)
          return cb()
        }

        const key = `dmarc:failures:ip:${session.remoteAddress}`
        const count = await redis.incr(key)
        if (count === 1) await redis.expire(key, 10 * 60)
        if (count > MAX_DMRAC_FAILURE) {
          await redis.set(
            `greylist:${session.remoteAddress}`,
            true,
            'EX',
            60 * 60,
          )
          return cb(new Error('421 Temporary failure, try again later'))
        }

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
      } else {
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

const readStream = async (stream) => {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

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

server.listen(PORT, () => console.log(`SMTP server listening on port ${PORT}`))
