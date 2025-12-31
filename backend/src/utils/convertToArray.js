import mongoose from 'mongoose'

const convertToArray = (attachments) => {
  let attachmentIds

  if (typeof attachments === 'string') {
    try {
      attachmentIds = JSON.parse(attachments)
    } catch (e) {
      attachmentIds = []
    }
  } else if (Array.isArray(attachments)) {
    attachmentIds = attachments
  }

  const filteredAttachmentId = Array.isArray(attachmentIds)
    ? attachmentIds.filter((id) => mongoose.Types.ObjectId.isValid(id))
    : []
  return filteredAttachmentId
}
export default convertToArray
