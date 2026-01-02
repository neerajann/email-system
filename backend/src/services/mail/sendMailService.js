import { htmlToText } from 'html-to-text'
import emailQueue from '../../queues/emailQueue.js'
import Thread from '../../models/threadSchema.js'
import Mailbox from '../../models/mailboxSchema.js'
import Email from '../../models/emailSchema.js'
import convertToArray from '../../utils/convertToArray.js'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { emailPattern } from '../../utils/pattern.js'

const deliverMail = async (
  userId,
  sender,
  recipients,
  subject,
  body,
  attachments
) => {
  recipients.forEach((recipient) => {
    if (!emailPattern.test(recipient)) throw new Error('INVALID_EMAIL')
  })

  const content = htmlToText(body, {
    wordwrap: 80,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' },
    ],
  })

  const parsedAttachments = convertToArray(attachments)
  const messageId = `<${crypto.randomUUID()}@${process.env.DOMAIN_NAME}>`

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    var [thread] = await Thread.create(
      [
        {
          subject: subject,
          participants: Array.from(new Set([sender, ...recipients])),
          messageIds: [messageId],
          lastMessageAt: new Date(),
        },
      ],
      { session: session }
    )

    var [email] = await Email.create(
      [
        {
          threadId: thread._id,
          from: sender,
          to: recipients,
          messageId: messageId,
          subject,
          body: content,
          attachments: parsedAttachments,
        },
      ],
      { session: session }
    )

    await Mailbox.create(
      [
        {
          userId,
          threadId: thread._id,
          emailId: email._id,
          labels: ['SENT'],
        },
      ],
      { session: session }
    )
    await session.commitTransaction()
  } catch (error) {
    console.log(error)
    await session.abortTransaction()
    throw new Error('DATABASE_ERROR')
  } finally {
    await session.endSession()
  }

  await emailQueue.add(
    'sendEmail',
    {
      senderId: userId,
      emailId: email._id,
      threadId: thread._id,
      sender: sender,
      recipients: recipients,
      subject,
      body: content,
      attachments,
      messageId: messageId,
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

export default { deliverMail }
