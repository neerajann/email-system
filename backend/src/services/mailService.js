import Email from '../models/emailSchema.js'
import Mailbox from '../models/mailboxSchema.js'
import User from '../models/userSchema.js'
import nodemailer from 'nodemailer'
import { emailPattern, domainEmailPattern } from '../utils/pattern.js'

const getMailService = async (userId, label) => {
  {
    const emails = await Mailbox.find(
      {
        userId,
        labels: label,
        isDeleted: label === 'TRASH',
      },
      {
        // Mailbox fields to EXCLUDE
        userId: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      }
    )
      .populate({
        path: 'emailId',
        select: {
          // Exclude unwanted email fields
          _id: 0,
          threadId: 0,
          attachments: 0,
          updatedAt: 0,
          __v: 0,
        },
      })
      .sort({ receivedAt: -1 })
    if (emails.length == 0) return null
    return emails
  }
}

const deliverMail = async (userId, sender, recipient, subject, body) => {
  if (!emailPattern.test(recipient)) throw new Error('INVALID_EMAIL')

  const email = await Email.create({
    from: sender,
    to: recipient,
    subject,
    body,
  })
  await Mailbox.create({
    userId,
    emailId: email._id,
    labels: ['SENT'],
  })

  const transporter = nodemailer.createTransport({
    name: process.env.DOMAIN_NAME,
    direct: true,
    logger: true,
    debug: true,
  })
  try {
    await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: subject,
      text: body,
    })
    return true
  } catch (error) {
    console.log(error)

    throw new Error('MAIL_DELIVERY_ERROR')
  }
}
export default { getMailService, deliverMail }
