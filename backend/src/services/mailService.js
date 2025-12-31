import Email from '../models/emailSchema.js'
import Mailbox from '../models/mailboxSchema.js'
import User from '../models/userSchema.js'
import { emailPattern, domainEmailPattern } from '../utils/pattern.js'
import { htmlToText } from 'html-to-text'
import emailQueue from '../queues/emailQueue.js'

const getMails = async (userId, label) => {
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

  const content = htmlToText(body, {
    wordwrap: 80,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' },
    ],
  })

  const email = await Email.create({
    from: sender,
    to: recipient,
    subject,
    body: content,
  })

  await Mailbox.create({
    userId,
    emailId: email._id,
    labels: ['SENT'],
  })

  await emailQueue.add(
    'sendEmail',
    {
      from: sender,
      to: recipient,
      subject,
      body: content,
    },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: {
        age: 3600,
      },
      removeOnFail: {
        age: 24 * 3600,
      },
    }
  )

  return true
}

const moveToTrash = async (mailboxId, userId) => {
  const result = await Mailbox.updateOne(
    {
      _id: mailboxId,
      userId: userId,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
      },
      $addToSet: {
        labels: 'TRASH',
      },
    }
  )
  if (result.modifiedCount == 0) throw new Error('EMAIL_NOT_FOUND')
  return true
}

const restoreMail = async (mailboxId, userId) => {
  const result = await Mailbox.updateOne(
    {
      _id: mailboxId,
      userId: userId,
      isDeleted: true,
    },
    {
      $set: {
        isDeleted: false,
      },
      $pull: {
        labels: 'TRASH',
      },
    }
  )
  if (result.modifiedCount == 0) throw new Error('EMAIL_NOT_FOUND')
  return true
}

const getMail = async (userId, mailboxId) => {
  const result = await Mailbox.find(
    {
      _id: mailboxId,
      userId: userId,
    },
    {
      userId: 0,
      isDeleted: 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    }
  ).populate({
    path: 'emailId',
    select: {
      _id: 0,
      threadId: 0,
      updatedAt: 0,
      __v: 0,
    },
  })
  if (result.length === 0) {
    throw new Error('EMAIL_NOT_FOUND')
  }
  return result
}
export default { getMails, deliverMail, moveToTrash, restoreMail, getMail }
