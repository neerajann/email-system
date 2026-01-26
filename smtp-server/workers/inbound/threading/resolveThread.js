import { Email } from '@email-system/core/models'

const resolveThread = async (mail) => {
  if (mail.inReplyTo) {
    var email = await Email.findOne({
      inReplyTo: mail.inReplyTo,
    })
    if (email) return email.threadId
    email = await Email.findOne({
      references: mail.inReplyTo,
    })
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
