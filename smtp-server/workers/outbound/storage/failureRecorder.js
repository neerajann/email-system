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
}) => {
  let failureEntries = []
  const allMessageIds = []

  const pushFailureEntry = (subject, html) => {
    const systemMessageId = `<system-${crypto.randomUUID()}@${
      process.env.DOMAIN_NAME
    }>`
    allMessageIds.push(systemMessageId)

    const text = htmlToText(html)
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

  if (type === 'DELIVERY') {
    for (const entry of bouncedRecipients) {
      await Promise.all(
        entry.emails.map(async (recipient) => {
          const html = generateDeliveryFailureHtml(recipient)
          const subject = 'Delivery Delayed: Message Could Not Be Delivered'
          pushFailureEntry(subject, html)
          await RecipientHistory.findOneAndDelete({
            ownerUserId: sender.id,
            emailAddress: recipient,
          })
        }),
      )
    }
  } else if (type === 'BOUNCE') {
    await Promise.all(
      bouncedRecipients.map(async (recipient) => {
        const html = generateBounceHtml(recipient)
        const subject = 'Mail Delivery Failed: Address Not Found'
        pushFailureEntry(subject, html)
        await RecipientHistory.findOneAndDelete({
          ownerUserId: sender.id,
          emailAddress: recipient,
        })
      }),
    )
  }

  const createdEmails = await Email.insertMany(failureEntries)
  const createdEmailsId = createdEmails.map((e) => e._id)

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
    },
    { upsert: true, new: true },
  )

  const thread = await Thread.findByIdAndUpdate(
    threadId,
    {
      $set: {
        lastMessageAt: new Date(),
      },
      $inc: {
        messageCount: createdEmails?.length,
      },
      $push: {
        messageIds: allMessageIds,
      },
      $addToSet: {
        senders: {
          name: 'Mail Delivery Subsystem',
          address: 'mailer-daemon@inboxify.com',
        },
      },
    },
    { new: true },
  )

  const lastFailedEmail = createdEmails[createdEmails.length - 1]

  if (!mailboxRecord.isDeleted) {
    const notifications = [
      {
        userId: sender._id,
        newMail: {
          mailboxId: mailboxRecord._id,
          from: thread.senders,
          subject: thread.subject,
          snippet: lastFailedEmail.body?.text?.substring(0, 200) ?? ' ',
          isSystem: false,
          messageCount: thread.messageCount,
          isRead: false,
          isStarred: mailboxRecord.isStarred,
          receivedAt: lastFailedEmail.receivedAt,
          isDeleted: false,
        },
      },
    ]
    await notifyUser(notifications)
  }

  return true
}
export default failureRecorder
