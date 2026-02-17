import {
  Mailbox,
  Thread,
  Email,
  RecipientHistory,
} from '@email-system/core/models'
import {
  generateBounceHtml,
  generateDeliveryFailureHtml,
} from '../assembly/DSNComposer.js'
import { htmlToText } from 'html-to-text'
import mongoose from 'mongoose'
import notifyUser from '@email-system/core/messaging'

const failureRecorder = async ({
  sender,
  emailId,
  threadId,
  bouncedRecipients,
  type,
  parentMessageId,
  redis,
}) => {
  let failureEntries = []
  const allMessageIds = []

  const pushFailureEntry = (subject, html) => {
    // Generate a messageId
    const systemMessageId = `<system-${crypto.randomUUID()}@${
      process.env.DOMAIN_NAME
    }>`
    allMessageIds.push(systemMessageId)

    // Generate a text version of the html
    const text = htmlToText(html)

    // Push to failure entries array
    failureEntries.push({
      threadId: threadId,
      messageId: systemMessageId,
      to: {
        address: sender.address,
        name: sender.name,
      },
      from: {
        address: 'mailer-daemon@inboxify.com ',
        name: 'Mail Delivery Subsystem',
      },

      subject: subject,
      body: {
        html: html,
        text: text,
      },
      isSystem: true,
      bounceFor: emailId,
      receivedAt: Date.now(),
      references: [parentMessageId],
    })
  }
  // Delivery Failure mail
  if (type === 'DELIVERY') {
    for (const entry of bouncedRecipients) {
      await Promise.all(
        entry.emails.map(async (recipient) => {
          // Generate delivery failure email
          const html = generateDeliveryFailureHtml(recipient)
          const subject = 'Delivery Delayed: Message Could Not Be Delivered'

          pushFailureEntry(subject, html)

          await RecipientHistory.findOneAndUpdate(
            {
              ownerUserId: sender.id,
              emailAddress: recipient,
            },
            {
              $inc: {
                sentCount: -3, // Decrement the sentCount in recipient history (this is used to rank recipients that match the search term)
              },
            },
          )
        }),
      )
    }
  }
  // Failure mails of type bounce
  else if (type === 'BOUNCE') {
    for (const entry of bouncedRecipients) {
      await Promise.all(
        entry.addresses.map(async (recipient) => {
          // Generate bounce email in html format
          const html = generateBounceHtml({
            recipient,
            errorMessage: entry.errorMessage,
          })
          const subject = 'Mail Delivery Failed: Address Not Found'
          pushFailureEntry(subject, html)
          await RecipientHistory.findOneAndUpdate(
            {
              ownerUserId: sender.id,
              emailAddress: recipient,
            },
            {
              $inc: {
                sentCount: -3, // Decrement the sentCount in recipient history (this is used to rank recipients that match the search term)
              },
            },
          )
        }),
      )
    }
  }

  // Insert all failure mails into Email collection
  const createdEmails = await Email.insertMany(failureEntries)
  const createdEmailsId = createdEmails.map((e) => e._id)

  // Update the sender mailbox to include the failure emails
  const mailboxRecord = await Mailbox.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(sender.id),
      threadId: new mongoose.Types.ObjectId(threadId),
    },
    {
      $push: {
        emailIds: createdEmailsId,
      },
      $set: {
        isRead: false,
        lastMessageAt: Date.now(),
      },
      $addToSet: {
        labels: { $each: ['SYSTEM', 'INBOX'] },
      },
      $setOnInsert: {
        subject: createdEmails[0].subject,
      },
    },
    { upsert: true, new: true },
  )

  // Update thread to include mailer-daemon@inboxify.com in senders
  const thread = await Thread.findByIdAndUpdate(
    threadId,
    {
      $set: {
        ['senders.mailer-daemon@inboxify_com']: {
          name: 'Mail Delivery Subsystem',
          address: 'mailer-daemon@inboxify.com',
        },
      },
    },
    { new: true },
  )

  // Only send the last(latest) failed mail in notification
  const lastFailedEmail = createdEmails[createdEmails.length - 1]

  // Notify the sender if the mail is not in trash
  if (!mailboxRecord.isDeleted) {
    const notifications = [
      {
        userId: String(sender.id),
        newMail: {
          mailboxId: mailboxRecord._id,
          from: thread.senders,
          subject: mailboxRecord.subject,
          snippet: lastFailedEmail.body?.text?.substring(0, 200) ?? ' ',
          isSystem: false,
          messageCount: mailboxRecord.emailIds.length,
          isRead: false,
          isStarred: mailboxRecord.isStarred,
          receivedAt: mailboxRecord.lastMessageAt,
          isDeleted: false,
        },
      },
    ]

    await notifyUser(notifications, redis)
  }

  return true
}
export default failureRecorder
