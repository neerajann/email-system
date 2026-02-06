import { Email, Thread } from '@email-system/core/models'

const handleReply = async ({
  emailId,
  senderAddress,
  userInfo,
  recipients,
  messageId,
  bodyHtml,
  bodyText,
  parsedAttachments,
}) => {
  const olderMail = await Email.findById(emailId).populate('threadId')
  const isAuthorized =
    olderMail?.threadId?.participants?.includes(senderAddress)

  if (!isAuthorized) throw new Error('UNAUTHORIZED_REPLY')

  //creates a new reply email using the older mail message id
  const email = await createEmail({
    threadId: olderMail.threadId,
    senderAddress,
    senderName: userInfo.name,
    recipients,
    messageId,
    subject: `Re: ${olderMail.subject.trim().replace(/^(Re:\s*)+/i, '')}`,
    bodyHtml,
    bodyText,
    attachments: parsedAttachments,
    inReplyTo: olderMail.messageId,
    references: [...olderMail.references, olderMail.messageId],
  })

  const senderMapkey = userInfo.emailAddress.replace(/\./g, '_')
  const thread = await Thread.findByIdAndUpdate(
    email.threadId,
    {
      $set: {
        [`senders.${senderMapkey}`]: {
          name: userInfo.name,
          address: userInfo.emailAddress,
        },
      },
      $addToSet: {
        participants: {
          $each: recipients,
        },
      },
    },
    {
      new: true,
    },
  )
  return { email, thread }
}

const createEmail = async ({
  threadId,
  senderAddress,
  senderName,
  recipients,
  messageId,
  subject,
  bodyText,
  bodyHtml,
  attachments,
  inReplyTo,
  references,
}) => {
  const recipientsMap = recipients.map((recipient) => {
    if (recipient === senderAddress) {
      return {
        address: senderAddress,
        name: senderName,
      }
    }
    return {
      address: recipient,
    }
  })
  const email = {
    threadId: threadId,
    from: {
      address: senderAddress,
      name: senderName,
    },
    to: recipientsMap,
    messageId: messageId,
    subject: subject,
    body: {
      text: bodyText,
      html: bodyHtml,
    },
    attachments: attachments,
  }
  if (inReplyTo) {
    email.inReplyTo = inReplyTo
  }
  if (references) {
    email.references = references
  }
  return await Email.create(email)
}

const createThread = async ({ senderAddress, senderName, recipients }) => {
  const senderMap = new Map()
  const senderMapkey = senderAddress.replace(/\./g, '_')
  senderMap.set(senderMapkey, {
    name: senderName,
    address: senderAddress,
  })

  return await Thread.create({
    participants: Array.from(new Set([senderAddress, ...recipients])),
    senders: senderMap,
  })
}
export { handleReply, createEmail, createThread }
