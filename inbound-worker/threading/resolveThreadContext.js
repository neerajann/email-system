import { Email, Thread } from '@email-system/core/models'

const resolveThreadContext = async (mail) => {
  if (mail.inReplyTo) {
    // If inReplyTo exist find an email with the messageId of inReplyTo
    const email = await Email.findOne({
      messageId: mail.inReplyTo,
    })

    // If email is found with the message id of inReplyTo
    if (email) {
      // Verify if the sender is allowed to reply to that thread
      const thread = await verifyIsAllowedToReply({
        threadId: email.threadId,
        senderAddress: mail.from.value[0].address,
      })

      // Return empty object if not allowed
      if (!thread) return {}

      // Else return threadId, references of parent email and parent email message Id
      return {
        threadId: thread._id,
        parentReferences: email.references,
        parentMessageId: email.messageId,
      }
    }
  }

  // If mail referneces has some message ids
  if (mail.references?.length) {
    // If refernces is not an array convert it to array (refernces is seperated by space)
    const references = Array.isArray(mail.references)
      ? mail.references
      : mail.references.split(' ').map((r) => r.trim())

    const lastRef = references[-1]
    // Check email with message id of lastRef mail
    const email = await Email.findOne({
      messageId: lastRef,
    })

    if (email) {
      const thread = await verifyIsAllowedToReply({
        threadId: email.threadId,
        senderAddress: mail.from.value[0].address,
      })

      if (!thread) return {}

      return {
        threadId: email.threadId,
        parentReferences: email.references,
        parentMessageId: email.messageId,
      }
    }
  }
  // If not found return an empty object
  return {}
}

// Checks if the sender is actually in participants of a thread (This prevents reply from random sender to a thread)
const verifyIsAllowedToReply = async ({ threadId, senderAddress }) => {
  return await Thread.findOne(
    {
      _id: threadId,
      participants: senderAddress,
    },
    {
      _id: 1,
    },
  )
}
export default resolveThreadContext
