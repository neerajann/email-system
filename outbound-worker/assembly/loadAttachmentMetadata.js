import { Attachment } from '@email-system/core/models'

const loadAttachmentMetadata = async (attachments) => {
  await Attachment.updateMany(
    {
      _id: { $in: attachments },
    },
    {
      $set: {
        status: 'attached', // Update the status of attachment to attached so it can no longer be deleted
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
