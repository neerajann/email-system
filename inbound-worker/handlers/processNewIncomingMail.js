import { User, Thread, Email, Mailbox } from '@email-system/core/models'
import htmlSanitizer from '../utils/htmlSanitizer.js'
import uploadAttachment from '../attachments/uploadAttachment.js'
import notifyUser from '@email-system/core/messaging'
import { RecipientHistory } from '@email-system/core/models'

const processNewIncomingMail = async ({ mail, envelope, redis }) => {
  const recipientsAddress = envelope?.rcptTo.map((r) => r.address)

  // Find user record from email address
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

  // If mail contains attachments call uploadAttachments; this will return back array of id's of uploaded attachments
  const attachments = mail.attachments.length
    ? await uploadAttachment(mail.attachments)
    : []

  //If messageId is missing in received mail, generate one
  const messageId =
    mail?.messageId ?? `<${crypto.randomUUID()}@${process.env.DOMAIN_NAME}>`

  // Create sender map to include in thread (Used in mail list view in UI)
  const senderMap = new Map()
  const senderMapkey = mail.from.value[0].address.replace(/\./g, '_')

  senderMap.set(senderMapkey, {
    name: mail.from.value[0]?.name ?? '',
    address: mail.from.value[0].address,
  })

  // Get email address of recipients from mail
  const mailToAddresses = mail.to.value.map((t) => t.address)

  // Create a new thread with participants from the mail(sender,recipients)
  const thread = await Thread.insertOne({
    senders: senderMap,
    participants: [mail.from.value[0].address, ...mailToAddresses],
  })

  // Create a map of recipients email address to their name
  const emailAddressToName = Object.fromEntries(
    localUsers.map((u) => [u.emailAddress, u.name]),
  )

  // Updated value of recipents for the mail (includes the name of local recipients)
  const recipients = mail.to.value.map((p) => ({
    ...p,
    name: emailAddressToName[p.address] ?? '',
  }))

  // Santize the mail body
  const sanitizedHtml = htmlSanitizer(mail.html)

  // Create a new email
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

  // Create new mailbox entry for all local users (Same email is shared across all local recipients)
  const mailboxRecord = await Mailbox.create(
    localUsers.map((user) => ({
      userId: user._id,
      threadId: thread._id,
      emailIds: [email._id],
      labels: ['INBOX'],
      subject: email.subject,
    })),
  )

  // Update the recipient history to include the sender(Used for recipents suggestion while composing a mail)
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

  // Notify the backend about new mail arrival for a user
  const notifications = mailboxRecord.map((record) => ({
    userId: String(record.userId),
    newMail: {
      mailboxId: record._id,
      from: thread.senders,
      subject: record.subject,
      snippet: email.body?.text?.substring(0, 200) ?? ' ',
      isSystem: false,
      messageCount: record.emailIds.length,
      isRead: false,
      isStarred: false,
      receivedAt: record.lastMessageAt,
      isDeleted: false,
    },
  }))

  await notifyUser(notifications, redis)
}
export default processNewIncomingMail
