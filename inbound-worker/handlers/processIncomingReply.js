import {
  User,
  Thread,
  Email,
  Mailbox,
  RecipientHistory,
} from '@email-system/core/models'
import uploadAttachment from '../attachments/uploadAttachment.js'
import resolveThreadContext from '../threading/resolveThreadContext.js'
import htmlSanitizer from '../utils/htmlSanitizer.js'
import processNewIncomingMail from './processNewIncomingMail.js'
import notifyUser from '@email-system/core/messaging'

const processIncomingReply = async ({ mail, envelope, redis }) => {
  const { threadId, parentReferences, parentMessageId } =
    await resolveThreadContext(mail)

  if (!threadId) return processNewIncomingMail({ mail, envelope, redis })

  const recipientsAddress = envelope.rcptTo.map((r) => r.address)

  const localUsers = await User.find(
    {
      emailAddress: {
        $in: recipientsAddress,
      },
    },
    {
      _id: 1,
      name: 1,
      emailAddress: 1,
    },
  )
  if (!localUsers.length) return

  const attachments = mail.attachments.length
    ? await uploadAttachment(mail.attachments)
    : []

  const messageId =
    mail?.messageId ?? `<${crypto.randomUUID()}@${process.env.DOMAIN_NAME}>`

  const emailAddressToName = Object.fromEntries(
    localUsers.map((u) => [u.emailAddress, u.name]),
  )

  const recipients = mail.to.value.map((p) => ({
    address: p.address,
    name: emailAddressToName[p.address] ?? '',
  }))

  const sanitizedHtml = htmlSanitizer(mail.html)

  const email = await Email.create({
    threadId,
    from: {
      name: mail.from.value[0]?.name ?? '',
      address: mail.from.value[0].address,
    },
    to: recipients,
    subject: mail.subject,
    body: {
      text: mail.text,
      html: sanitizedHtml,
    },
    messageId,
    attachments,
    inReplyTo: parentMessageId,
    references: [...parentReferences, parentMessageId],
  })

  const userIds = localUsers.map((l) => l._id)

  await Mailbox.updateMany(
    {
      userId: {
        $in: userIds,
      },
      threadId,
    },
    {
      $push: {
        emailIds: email._id,
      },
      $set: { lastMessageAt: new Date(), isRead: false },
      $addToSet: { labels: 'INBOX' },
      $setOnInsert: {
        subject: email.subject,
      },
    },
    { upsert: true, new: true },
  )

  const updatedMailboxes = await Mailbox.find({
    userId: { $in: userIds },
    threadId,
  })

  const senderMapkey = email.from.address.replace(/\./g, '_')
  const thread = await Thread.findByIdAndUpdate(
    threadId,
    {
      $set: {
        [`senders.${senderMapkey}`]: {
          name: email.from.name,
          address: email.from.address,
        },
      },
    },
    {
      new: true,
    },
  )

  await RecipientHistory.bulkWrite(
    localUsers.map((user) => ({
      updateOne: {
        filter: {
          ownerUserId: user._id,
          emailAddress: email.from.address,
        },
        update: {
          $inc: {
            receivedCount: 1,
          },
        },
        upsert: true,
      },
    })),
  )

  const notifications = updatedMailboxes.flatMap((result) => {
    if (result.isDeleted) return []
    return {
      userId: result.userId,
      newMail: {
        mailboxId: result._id,
        from: thread.senders,
        subject: result.subject,
        snippet: email.body?.text?.substring(0, 200) ?? ' ',
        isSystem: false,
        messageCount: result.emailIds.length,
        isRead: false,
        isStarred: result.isStarred,
        receivedAt: result.lastMessageAt,
        isDeleted: false,
      },
    }
  })
  await notifyUser(notifications, redis)
}
export default processIncomingReply
