import { User, Thread, Email, Mailbox } from '@email-system/core/models'
import uploadAttachment from '../attachments/uploadAttachment.js'
import resolveThread from '../threading/resolveThread.js'
import htmlSanitizer from '../utils/htmlSanitizer.js'
import processNewIncomingMail from './processNewIncomingMail.js'
import notifyUser from '../../notifyUser.js'

const processIncomingReply = async ({ mail, envelope }) => {
  const threadId = await resolveThread(mail)
  if (!threadId) return processNewIncomingMail(mail, envelope)

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

  messageId =
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
    },
    { upsert: true, new: true },
  )

  const updatedMailboxes = await Mailbox.find({
    userId: { $in: userIds },
    threadId,
  })

  const thread = await Thread.findByIdAndUpdate(
    threadId,
    {
      $push: {
        messageIds: messageId,
      },
      $inc: {
        messageCount: 1,
      },
      $set: {
        lastMessageAt: Date.now(),
      },
    },
    {
      new: true,
    },
  )

  const notifications = updatedMailboxes.flatMap((result) => {
    if (result.isDeleted) return []
    return {
      userId: result.userId,
      newMail: {
        threadId: email.threadId,
        from: email.from,
        to: email.to,
        subject: email.subject,
        snippet: email.body?.text?.substring(0, 200) ?? ' ',
        isSystem: false,
        messageCount: thread.messageCount,
        isRead: false,
        isStarred: result.isStarred,
        receivedAt: email.receivedAt,
        isDeleted: false,
      },
    }
  })
  await notifyUser(notifications)
}
export default processIncomingReply
