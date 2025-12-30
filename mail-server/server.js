import { SMTPServer } from 'smtp-server'
import { User } from './models/users.js'
import mongoose from 'mongoose'
import { simpleParser } from 'mailparser'
import Email from './models/emailSchema.js'
import env from 'dotenv'
import Mailbox from './models/mailboxSchema.js'

env.config()

await mongoose.connect(process.env.MONGO_DB_URL)

const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  banner: 'Welcome to ' + process.env.DOMAIN_NAME,
  onConnect(session, cb) {
    cb()
  },

  onMailFrom(address, session, cb) {
    if (!address.address.endsWith(session.hostNameAppearsAs)) {
      return cb(new Error('Address doesnot belong to the domain as introduced'))
    }
    cb()
  },

  async onRcptTo(address, session, cb) {
    const domain = process.env.DOMAIN_NAME
    const domainEmailPattern = new RegExp(
      `^[a-zA-Z0-9.]+@${domain.replace('.', '\\.')}$`
    )

    if (!domainEmailPattern.test(address.address)) {
      return cb(new Error('Doesnot belong to this domain'))
    }
    const user = await User.findOne(
      {
        emailAddress: address.address,
      },
      { _id: 1 }
    )

    if (!user) {
      return cb(new Error('User doesnot exist'))
    }
    cb()
  },

  async onData(stream, session, cb) {
    try {
      const parsedMail = await simpleParser(stream)
      const user = await User.findOne(
        {
          emailAddress: parsedMail.to.text,
        },
        { _id: 1 }
      )
      const email = await Email.create({
        to: parsedMail.to?.text,
        from: parsedMail.from?.text,
        subject: parsedMail.subject,
        body: parsedMail.text,
      })

      await Mailbox.create({
        userId: user._id,
        emailId: email._id,
        labels: ['INBOX'],
      })

      cb()
    } catch (error) {
      console.log(error)
      cb(error)
    }
  },
})

server.listen(25, () => console.log('Server listening on port 25'))
