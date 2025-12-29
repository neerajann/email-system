import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'inboxify.app',
  port: 25,
  secure: false,
  ignoreTLS: true,
  name: 'gmail.com',
})

await transporter.sendMail({
  from: 'neerajan.vfx@gmail.com',
  to: 'neerajan.vfx@inboxify.app',
  subject: 'Hello SMTP',
  text: 'This is a test email',
})
