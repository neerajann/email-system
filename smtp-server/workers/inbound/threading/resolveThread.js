import { Email } from '@email-system/core/models'

const resolveThread = async (mail) => {
  if (mail.inReplyTo) {
    const email = await Email.findOne({
      messageId: mail.inReplyTo,
    })
    if (email) return email.threadId
  }
  if (mail.references?.length) {
    const lastRef = mail.references[mail.references.length - 1]
    const email = await Email.findOne({
      messageId: lastRef,
    })
    if (email) return email.threadId
  }
  return null
}

export default resolveThread
