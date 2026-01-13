import mongoose from 'mongoose'
import { Attachment, Mailbox, Email } from '@email-system/core/models'

const addAttachmentsToDB = async (files) => {
  try {
    const attachments = files.map((file) => {
      return {
        path: file.path,
        originalName: file.originalName,
        encoding: file.encoding,
        mimetype: file.mimetype,
        fileName: file.fileName,
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

const fetchAttachmentRecord = async ({ userId, mailId, attachmentId }) => {
  const userIdObject = new mongoose.Types.ObjectId(userId)
  const mailIdObject = new mongoose.Types.ObjectId(mailId)
  const attachmentIdObject = new mongoose.Types.ObjectId(attachmentId)
  console.log(userIdObject + ' ' + mailIdObject + ' ' + attachmentIdObject)

  const mailboxExists = await Mailbox.exists({
    userId: userIdObject,
    emailId: mailIdObject,
  })

  const emailHasAttachment = await Email.exists({
    _id: mailIdObject,
    attachments: attachmentIdObject,
  })

  console.log('emailHasAttachment', emailHasAttachment)
  console.log('Mailboexits', mailboxExists)
  if (!mailboxExists || !emailHasAttachment) {
    return null
  }
  const attachmentsRecord = await Attachment.findOne(
    {
      _id: attachmentIdObject,
    },
    {
      _id: 0,
      originalName: 1,
      path: 1,
    }
  )
  return attachmentsRecord
}

export default { addAttachmentsToDB, fetchAttachmentRecord }
