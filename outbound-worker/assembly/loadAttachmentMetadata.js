import { Attachment } from '@email-system/core/models'

const loadAttachmentMetadata = async (attachments) => {
  await Attachment.updateMany(
    {
      _id: { $in: attachments },
    },
    {
      $set: {
        status: 'attached',
      },
    },
  )
  return Attachment.find({
    _id: {
      $in: attachments,
    },
  })
}

export default loadAttachmentMetadata
