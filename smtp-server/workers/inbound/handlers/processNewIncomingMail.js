import { User, Thread, Email, Mailbox } from '@email-system/core/models'
import htmlSanitizer from '../utils/htmlSanitizer.js'
import uploadAttachment from '../attachments/uploadAttachment.js'

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
      firstName: 1,
      emailAddress: 1,
    }
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
  })

  const emailAddressToName = Object.fromEntries(
    localUsers.map((u) => [u.emailAddress, u.firstName])
  )
  const recipients = mail.to.value.map((p) => ({
    ...p,
    name: emailAddressToName[p.address] ?? '',
  }))
  const sanitizedHtml = htmlSanitizer(mail.html, SANITIZE_CONFIG)

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

  await Mailbox.create(
    localUsers.map((user) => ({
      userId: user._id,
      threadId: thread._id,
      emailId: email._id,
      labels: ['INBOX'],
    }))
  )
}
export default processNewIncomingMail
