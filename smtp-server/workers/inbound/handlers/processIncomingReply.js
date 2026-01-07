import { User, Thread, Email, Mailbox } from '@email-system/core/models'
import uploadAttachment from '../attachments/uploadAttachment.js'
import resolveThread from '../threading/resolveThread.js'
import htmlSanitizer from '../utils/htmlSanitizer.js'
import processNewIncomingMail from './processNewIncomingMail.js'

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
      firstName: 1,
      emailAddress: 1,
    }
  )
  if (!localUsers.length) return

  const attachments = mail.attachments.length
    ? await uploadAttachment(mail.attachments)
    : []

  messageId =
    mail?.messageId ?? `<${crypto.randomUUID()}@${process.env.DOMAIN_NAME}>`

  const emailAddressToName = Object.fromEntries(
    localUsers.map((u) => [u.emailAddress, u.firstName])
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

  await Mailbox.insertMany(
    localUsers.map((user) => ({
      userId: user._id,
      threadId,
      emailId: email._id,
      labels: ['INBOX'],
    }))
  )
  await Thread.findByIdAndUpdate(threadId, {
    $push: {
      messageIds: messageId,
    },
    $inc: {
      messageCount: 1,
    },
    $set: {
      lastMessageAt: new Date(),
    },
  })
}
export default processIncomingReply
