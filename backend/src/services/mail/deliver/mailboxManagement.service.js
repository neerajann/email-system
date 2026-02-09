import redis from '../../../config/redis.js'
import { Mailbox, RecipientHistory } from '@email-system/core/models'
import notifyUser from '@email-system/core/messaging'
import { createOutboundEmailQueue } from '@email-system/core/queues'

const outboundEmailQueue = createOutboundEmailQueue(redis)
const updateSenderMailbox = async ({
  userId,
  threadId,
  emailId,
  subject,
  senderInRecipent,
}) => {
  const labels = senderInRecipent ? ['SENT', 'INBOX'] : ['SENT']
  const mailbox = await Mailbox.findOneAndUpdate(
    {
      userId,
      threadId,
    },
    {
      $set: {
        isRead: !senderInRecipent,
        lastMessageAt: Date.now(),
      },
      $addToSet: {
        labels: { $each: labels },
      },
      $push: {
        emailIds: emailId,
      },
      $setOnInsert: {
        subject: subject,
      },
    },
    {
      upsert: true,
      new: true,
    },
  )
  return mailbox
}

const updateRecipientHistory = async (ownerUserId, recipients) => {
  await RecipientHistory.bulkWrite(
    recipients.map((email) => ({
      updateOne: {
        filter: {
          ownerUserId,
          emailAddress: email,
        },
        update: {
          $inc: { sentCount: 1 },
        },
        upsert: true,
      },
    })),
  )
}
const sendNotfication = async ({ senderId, thread, mailbox, email }) => {
  const notifications = [
    {
      userId: senderId,
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
      recipients: externalRecipients,
      headerTo: allRecipients,
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
        age: 3600,
      },
      removeOnFail: {
        age: 24 * 3600,
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
