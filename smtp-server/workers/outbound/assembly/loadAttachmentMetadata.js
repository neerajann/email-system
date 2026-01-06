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
    }
  )
  return await Attachment.find(
    {
      _id: { $in: attachments },
    },
    {
      originalName: 1,
      _id: 0,
      encoding: 1,
      path: 1,
    }
  )
}

export default loadAttachmentMetadata
