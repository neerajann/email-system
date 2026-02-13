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

  // If threadId is null, then it's not a valid reply so process it as a new incoming  mail
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
  // Additional checks to make sure that user exist
  if (!localUsers.length) return

  // If mail contains attachments call uploadAttachments; this will return back array of id's of uploaded attachments
  const attachments = mail.attachments.length
    ? await uploadAttachment(mail.attachments)
    : []

  //If messageId is missing in received mail, generate one
  const messageId =
    mail?.messageId ?? `<${crypto.randomUUID()}@${process.env.DOMAIN_NAME}>`

  // Create a map of recipients email address to their name
  const emailAddressToName = Object.fromEntries(
    localUsers.map((u) => [u.emailAddress, u.name]),
  )

  // Updated value of recipents for the mail
  const recipients = mail.to.value.map((p) => ({
    address: p.address,
    name: emailAddressToName[p.address] ?? '',
  }))

  const sanitizedHtml = htmlSanitizer(mail.html) // Sanitize to remove dangerous scripts,prevent XSS

  // Create a new email to Email collection
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
    references: [...parentReferences, parentMessageId], // Contains all the message id's in a given thread id ordered from oldest to latest
  })

  const userIds = localUsers.map((l) => l._id)

  // Update or create Mailbox to include the new email
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
    { upsert: true },
  )

  // Fetch the updated/created mailboxes to notify users
  const updatedMailboxes = await Mailbox.find({
    userId: { $in: userIds },
    threadId,
  })

  // Update the senders list  in thread (This is used in UI to display who have sent mail till now)
  const senderMapkey = email.from.address.replace(/\./g, '_')
  const thread = await Thread.findByIdAndUpdate(
    threadId,
    {
      // This makes sure that each sender is inserted only once
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
  const notifications = updatedMailboxes.flatMap((result) => {
    if (result.isDeleted) return [] // If mail is in trash, don't notify
    return {
      userId: String(result.userId),
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
