import { User, Thread, Email, Mailbox } from '@email-system/core/models'
import htmlSanitizer from '../utils/htmlSanitizer.js'
import uploadAttachment from '../attachments/uploadAttachment.js'
import notifyUser from '../../notifyUser.js'

const processNewIncomingMail = async ({ mail, envelope }) => {
  // console.log('Envelope', envelope)
  const recipientsAddress = envelope.rcptTo.map((r) => r.address)

  // console.log('Mail', mail)
  // console.log('Recipents', recipientsAddress)
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
  // console.log('localUser', localUsers)
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
  })

  // console.log('Thread', thread)
  const emailAddressToName = Object.fromEntries(
    localUsers.map((u) => [u.emailAddress, u.name]),
  )
  // console.log('emailtoname', emailAddressToName)

  const recipients = mail.to.value.map((p) => ({
    ...p,
    name: emailAddressToName[p.address] ?? '',
  }))
  // console.log('recipents', recipients)
  const sanitizedHtml = htmlSanitizer(mail.html)
  // console.log(sanitizedHtml)

  // console.log('mail.from.value[0].address')
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

  console.log('Email', email)

  await Mailbox.create(
    localUsers.map((user) => ({
      userId: user._id,
      threadId: thread._id,
      emailIds: [email._id],
      labels: ['INBOX'],
    })),
  )
  const validUserId = localUsers.map((l) => String(l._id))

  const notifications = validUserId.flatMapmap((userId) => ({
    userId,
    newMail: {
      threadId: email.threadId,
      from: email.from,
      to: email.to,
      subject: email.subject,
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
