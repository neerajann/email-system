import { Email } from '@email-system/core/models'

const resolveThreadContext = async (mail) => {
  if (mail.inReplyTo) {
    var email = await Email.findOne({
      messageId: mail.inReplyTo,
    })
    if (email)
      return {
        threadId: email.threadId,
        parentReferences: email.references,
        parentMessageId: email.messageId,
      }

    email = await Email.findOne({
      references: mail.inReplyTo,
    })

    if (email)
      return {
        threadId: email.threadId,
        parentReferences: email.references,
        parentMessageId: email.messageId,
      }
  }

  if (mail.references?.length) {
    const mailRefs = mail.references.split(',')
    const lastRef = mailRefs[-1]
    const email = await Email.findOne({
      messageId: lastRef,
    })
    if (email)
      return {
        threadId: email.threadId,
        parentReferences: email.references,
        parentMessageId: email.messageId,
      }
  }
  return {}
}

export default resolveThreadContext
