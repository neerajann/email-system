import { User, Thread, Email, Mailbox } from '@email-system/core/models'
import htmlSanitizer from '../utils/htmlSanitizer.js'
import uploadAttachment from '../attachments/uploadAttachment.js'
import notifyUser from '@email-system/core/messaging'

const processNewIncomingMail = async ({ mail, envelope }) => {
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

  const thread = await Thread.insertOne({
    subject: mail.subject,
    lastMessageAt: new Date(),
    messageIds: [messageId],
    senders: {
      name: mail.from.value[0]?.name ?? '',
      address: mail.from.value[0].address,
    },
  })

  const emailAddressToName = Object.fromEntries(
    localUsers.map((u) => [u.emailAddress, u.name]),
  )

  const recipients = mail.to.value.map((p) => ({
    ...p,
    name: emailAddressToName[p.address] ?? '',
  }))

  const sanitizedHtml = htmlSanitizer(mail.html)

  const email = await Email.create({
    threadId: thread._id,
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

  const mailboxRecord = await Mailbox.create(
    localUsers.map((user) => ({
      userId: user._id,
      threadId: thread._id,
      emailIds: [email._id],
      labels: ['INBOX'],
    })),
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

  const notifications = mailboxRecord.map((record) => ({
    userId: String(record.userId),
    newMail: {
      mailboxId: record._id,
      from: thread.senders,
      subject: thread.subject,
      snippet: email.body?.text?.substring(0, 200) ?? ' ',
      isSystem: false,
      messageCount: thread.messageCount,
      isRead: false,
      isStarred: false,
      receivedAt: email.receivedAt,
      isDeleted: false,
    },
  }))

  await notifyUser(notifications)
}
export default processNewIncomingMail
