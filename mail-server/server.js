import { SMTPServer } from 'smtp-server'
import { User } from './models/users.js'
import mongoose from 'mongoose'
import { simpleParser } from 'mailparser'
import Email from './models/emailSchema.js'
import env from 'dotenv'
import Mailbox from './models/mailboxSchema.js'
import sanitizeHtml from 'sanitize-html'

env.config({ quiet: true })

await mongoose.connect(process.env.MONGO_DB_URL)

const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  size: 10 * 1024 * 1024,
  banner: 'Welcome to ' + process.env.DOMAIN_NAME,
  onConnect(session, cb) {
    cb()
  },

  onMailFrom(address, session, cb) {
    if (!isValidEmail(address.address)) {
      return cb(
        new Error('553 5.1.7 Sender address rejected: invalid address syntax')
      )
    }
    cb()
  },

  async onRcptTo(address, session, cb) {
    if (!isValidDomainEmail(address.address, process.env.DOMAIN_NAME)) {
      return cb(new Error('550 Doesnot belong to this domain'))
    }

    const user = await User.findOne(
      {
        emailAddress: address.address,
      },
      { _id: 1 }
    )

    if (!user) {
      return cb(new Error('550 User doesnot exist'))
    }
    cb()
  },

  async onData(stream, session, cb) {
    try {
      const parsedMail = await simpleParser(stream)
      console.log(parsedMail)
      const sender = parsedMail?.from?.text?.trim()?.toLowerCase()
      const recipient = parsedMail?.to?.text?.trim()?.toLowerCase()

      if (!sender || !recipient) {
        return cb(new Error('550 Missing headers'))
      }

      if (
        !isValidDomainEmail(recipient, process.env.DOMAIN_NAME) ||
        !isValidEmail(sender)
      ) {
        return cb(new Error('550 Invalid sender or recipient'))
      }

      const user = await User.findOne(
        {
          emailAddress: recipient,
        },
        { _id: 1 }
      )
      if (!user) {
        return cb(new Error('550 User does not exist'))
      }

      let emailBody = parsedMail.html
        ? sanitizeHtml(parsedMail.html, SANITIZE_CONFIG)
        : parsedMail.textAsHtml

      const email = await Email.create({
        to: parsedMail.to.text,
        from: parsedMail.from.text,
        subject: parsedMail.subject,
        body: emailBody,
      })

      await Mailbox.create({
        userId: user._id,
        emailId: email._id,
        labels: ['INBOX'],
      })
      return cb()
    } catch (error) {
      console.log(error)
      cb(new Error('451 Temporary processing error'))
    }
  },
})

const SANITIZE_CONFIG = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'b',
    'strong',
    'i',
    'em',
    'ul',
    'ol',
    'li',
    'br',
    'span',
    'div',
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
    'img',
    'a',
  ],

  allowedAttributes: {
    a: ['href', 'target'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['style'],
  },

  allowedSchemes: ['http', 'https', 'mailto', 'cid'],

  allowedStyles: {
    '*': {
      color: [/^#[0-9a-fA-F]{3,6}$/],
      'background-color': [/^#[0-9a-fA-F]{3,6}$/],
      'font-size': [/^\d+(px|em|%)$/],
      'font-weight': [/^(normal|bold|[1-9]00)$/],
      'text-align': [/^(left|right|center|justify)$/],
      'text-decoration': [/^(none|underline|line-through)$/],
    },
  },
}

const isValidEmail = (email) => {
  const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  return emailPattern.test(email)
}

const isValidDomainEmail = (email, domain) => {
  const domainEmailPattern = new RegExp(
    `^[a-zA-Z0-9.]+@${domain.replace('.', '\\.')}$`
  )
  return domainEmailPattern.test(email)
}
server.listen(25, () => console.log('Server listening on port 25'))
