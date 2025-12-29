import { SMTPServer } from 'smtp-server'
import { User } from './models/users.js'
import mongoose from 'mongoose'
import { simpleParser } from 'mailparser'
import { Email } from './models/email.js'

await mongoose.connect('mongodb://127.0.0.1:27017/mailserver')

const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  banner: 'Welcome to neerajan mail server',
  onConnect(session, cb) {
    console.log('Onconnect', session)
    cb()
  },

  onMailFrom(address, session, cb) {
    if (!address.address.endsWith(session.hostNameAppearsAs)) {
      return cb(new Error('Address doesnot belong to the domain as introduced'))
    }
    console.log('OnMailFrom', session, address)
    cb()
  },

  async onRcptTo(address, session, cb) {
    if (!address.address.endsWith('inboxify.app')) {
      return cb(new Error('Doesnot belong to this domain'))
    }
    const user = await User.findOne({
      email: address.address,
    })
    if (!user) {
      console.log('Email not found:', address)
      return cb(new Error('User doesnot exist'))
    }
    console.log('OnRcptTo:', address, session)
    cb()
  },

  async onData(stream, session, cb) {
    try {
      const parsedMail = await simpleParser(stream)
      console.log(parsedMail)
      const userId = await User.findOne({
        email: parsedMail.to.text,
      })
      const mail = new Email({
        userId: userId._id,
        to: parsedMail.to?.text,
        from: parsedMail.from?.text,
        subject: parsedMail.subject,
        body: {
          text: parsedMail.text,
          html: parsedMail.textAsHtml,
        },
        flags: {
          seen: false,
        },
        receivedAt: new Date(),
      })
      await mail.save()
      cb()
    } catch (error) {
      console.log(error)
      cb(error)
    }
  },
})
server.listen(25, () => console.log('Server listening on port 25'))
