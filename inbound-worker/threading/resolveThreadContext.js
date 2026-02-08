import { Email, Thread } from '@email-system/core/models'

const resolveThreadContext = async (mail) => {
  if (mail.inReplyTo) {
    const email = await Email.findOne({
      messageId: mail.inReplyTo,
    })

    if (email) {
      const thread = await verifyIsAllowedToReply({
        threadId: email.threadId,
        senderAddress: mail.from.value[0].address,
      })
      console.log(thread)

      if (!thread) return {}

      return {
        threadId: thread._id,
        parentReferences: email.references,
        parentMessageId: email.messageId,
      }
    } else {
      const email = await Email.findOne({
        references: mail.inReplyTo,
      })

      if (email) {
        const thread = await verifyIsAllowedToReply({
          threadId: email.threadId,
          senderAddress: mail.from.value[0].address,
        })
        if (!thread) return {}

        return {
          threadId: thread._id,
          parentReferences: email.references,
          parentMessageId: email.messageId,
        }
      }
    }
  }

  if (mail.references?.length) {
    const references = Array.isArray(mail.references)
      ? mail.references
      : mail.references.split(' ').map((r) => r.trim())

    const lastRef = references[-1]
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

  return {}
}

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
