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
  const olderMail = await Email.findById(emailId).populate('threadId') // Find old email using the emailid and fill in threads info
  const isAuthorized =
    olderMail?.threadId?.participants?.includes(senderAddress) // Check if the sender is in participants list of a thread

  if (!isAuthorized) throw new Error('UNAUTHORIZED_REPLY') // Reject reply mail if sender is not in participants

  // Creates a new reply email using the older mail message id
  const email = await createEmail({
    threadId: olderMail.threadId,
    senderAddress,
    senderName: userInfo.name,
    recipients,
    messageId,
    subject: `Re: ${olderMail.subject.trim().replace(/^(Re:\s*)+/i, '')}`, // Adds Re: to mail subject (replaces with empty string if already exist to prevent subject from looking like 'Re: Re: Re: Test mail')
    bodyHtml,
    bodyText,
    attachments: parsedAttachments,
    inReplyTo: olderMail.messageId,
    references: [...olderMail.references, olderMail.messageId],
  })

  // Add the sender to sender's map in thread
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
  // Add the name of sender if the sender's address is in recipients and convert recipients from array of recipients to array of objects containing name and address
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

  // Base email
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
  return await Email.create(email) // Returns back the newly created email
}

// Creates a new thread
const createThread = async ({ senderAddress, senderName, recipients }) => {
  // Sender's map used to show senders in mail list view (Map used to prevent duplicate senders)
  const senderMap = new Map()
  // Normalize the sender address to use as a safe object key. This avoids issue when accessing the key via dot notation or serializing.
  const senderMapkey = senderAddress.replace(/\./g, '_')

  senderMap.set(senderMapkey, {
    name: senderName,
    address: senderAddress,
  })

  // Return back the newly created thread
  return await Thread.create({
    participants: Array.from(new Set([senderAddress, ...recipients])), // Array of senders and recipients as participants for that thread
    senders: senderMap,
  })
}
export { handleReply, createEmail, createThread }
