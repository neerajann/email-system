import Attachment from '../../models/attachmentSchema.js'

const addAttachmentsToDB = async (files) => {
  try {
    const attachments = files.map((file) => {
      return {
        path: file.path,
        originalName: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        fileName: file.filename,
        size: file.size,
      }
    })
    const { insertedIds } = await Attachment.insertMany(attachments, {
      rawResult: true,
    })
    return Object.values(insertedIds)
  } catch (error) {
    console.log(error)
    throw new Error('DATABASE_ERROR')
  }
}
export default { addAttachmentsToDB }
