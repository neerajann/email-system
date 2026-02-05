import './config/env.js'
import { SMTPServer } from 'smtp-server'
import { simpleParser } from 'mailparser'
import { authenticate, dmarc } from 'mailauth'
import { User } from '@email-system/core/models'
import connectDB from '@email-system/core/config'
import { domainEmailPattern, emailPattern } from '@email-system/core/utils'
import { inboundEmailQueue } from '@email-system/core/queues'

await connectDB()

const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  size: 17 * 1024 * 1024,
  banner: 'Welcome to ' + process.env.DOMAIN_NAME,

  onConnect(session, cb) {
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
    try {
      let raw = await readStream(stream)
      if (process.env.SECURE === 'true') {
        const result = await authenticate(raw, {
          ip: session.remoteAddress,
          sender: session.envelope.mailFrom.address,
        })
        if (result?.dmarc?.status?.result === 'pass') {
          const parsedMail = await simpleParser(raw)
          addToInboundQueue(session.envelope, parsedMail)
          raw = null
          return cb()
        }
        raw = null
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
        addToInboundQueue(session.envelope, parsedMail)
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

server.listen(25, () => console.log('Server listening on port 25'))
