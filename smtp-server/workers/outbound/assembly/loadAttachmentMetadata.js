import { Attachment } from '@email-system/core/models'

const loadAttachmentMetadata = async (attachments) => {
  return await Attachment.updateMany(
    {
      _id: { $in: attachments },
    },
    {
      $set: {
        status: 'attached',
      },
    },
    {
      new: true,
    },
  )
}

export default loadAttachmentMetadata
