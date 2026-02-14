import redis from '../../../config/redis.js'
import { Mailbox, RecipientHistory } from '@email-system/core/models'
import notifyUser from '@email-system/core/messaging'
import { createOutboundEmailQueue } from '@email-system/core/queues'

const outboundEmailQueue = await createOutboundEmailQueue(redis)
const updateSenderMailbox = async ({
  userId,
  threadId,
  emailId,
  subject,
  senderInRecipent,
}) => {
  const labels = senderInRecipent ? ['SENT', 'INBOX'] : ['SENT'] // Add it to INBOX label as well if sender address is in recipients

  const mailbox = await Mailbox.findOneAndUpdate(
    {
      userId,
      threadId,
    },
    {
      $set: {
        isRead: !senderInRecipent, // If senderinrecipients, mark it as unread
        lastMessageAt: Date.now(),
      },
      $addToSet: {
        labels: { $each: labels }, // Insert each label into set
      },
      $push: {
        emailIds: emailId, // Include new email id
      },
      $setOnInsert: {
        subject: subject, // Only runs if a new document is being created (this subject is for mail list view)
      },
    },
    {
      upsert: true, // Create a new one if it doesnot exist
      new: true, // Returns back new document
    },
  )
  return mailbox
}

// Update sender's recipients history to include all recipients
const updateRecipientHistory = async (ownerUserId, recipients) => {
  await RecipientHistory.bulkWrite(
    recipients.map((email) => ({
      updateOne: {
        filter: {
          ownerUserId,
          emailAddress: email,
        },
        update: {
          $inc: { sentCount: 1 }, // Each mails sent to a reciver increments the count (higher the score, higher the ranking)
        },
        upsert: true,
      },
    })),
  )
}
// This will be called if sender is in recipients
const sendNotfication = async ({ senderId, thread, mailbox, email }) => {
  const notifications = [
    {
      userId: String(senderId),
      newMail: {
        mailboxId: mailbox._id,
        from: thread.senders,
        subject: mailbox.subject,
        snippet: email.body?.text?.substring(0, 200) ?? ' ',
        isSystem: false,
        messageCount: mailbox.emailIds.length,
        isRead: false,
        isStarred: false,
        receivedAt: mailbox.lastMessageAt,
        isDeleted: false,
      },
    },
  ]
  await notifyUser(notifications, redis)
}

// Adds an email to outbound queue which will be picked by outbound worker
const queueOutboundEmail = async ({
  email,
  thread,
  userInfo,
  externalRecipients,
  allRecipients,
}) => {
  await outboundEmailQueue.add(
    'outboundEmailQueue',
    {
      emailId: email._id,
      threadId: thread._id,
      sender: {
        address: userInfo.emailAddress,
        name: userInfo.name,
        id: userInfo._id,
      },
      recipients: externalRecipients, // Recipients to whom the mail will be delivered (this will be diff from headerTo if the sender was in recipients)
      headerTo: allRecipients, // All recipients
      subject: email.subject,
      body: {
        html: email.body.html,
        text: email.body.text,
      },
      attachments: email.attachments,
      messageId: email.messageId,
      inReplyTo: email?.inReplyTo,
      references: email?.references,
    },
    {
      attempts: 1,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: {
        age: 3600, // Remove from redis memory after 1 hour of completion
      },
      removeOnFail: {
        age: 24 * 3600, // Failed jobs are removed after 24 hours
      },
    },
  )
}
export {
  updateSenderMailbox,
  updateRecipientHistory,
  sendNotfication,
  queueOutboundEmail,
}
