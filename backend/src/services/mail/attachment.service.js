import mongoose from 'mongoose'
import { Attachment, Mailbox, Email } from '@email-system/core/models'
import fs from 'fs/promises'

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

const fetchAttachmentRecord = async ({ userId, emailId, attachmentId }) => {
  const userIdObject = new mongoose.Types.ObjectId(userId)
  const emailIdObject = new mongoose.Types.ObjectId(emailId)
  const attachmentIdObject = new mongoose.Types.ObjectId(attachmentId)
  console.log(userIdObject + ' ' + emailIdObject + ' ' + attachmentIdObject)

  const mailboxExists = await Mailbox.exists({
    userId: userIdObject,
    emailIds: emailIdObject,
  })

  const emailHasAttachment = await Email.exists({
    _id: emailIdObject,
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
    },
  )
  return attachmentsRecord
}

const deleteAttachments = async (attachments) => {
  try {
    const parsedAttachments = attachments?.map(
      (attachment) => new mongoose.Types.ObjectId(attachment),
    )
    const attachmentInfo = await Attachment.find(
      {
        _id: {
          $in: parsedAttachments,
        },
        status: 'temporary',
      },
      {
        path: 1,
      },
    )

    await Promise.allSettled(
      attachmentInfo.map((attachment) => {
        fs.unlink(attachment.path)
      }),
    )
    const result = await Attachment.deleteMany({
      _id: {
        $in: parsedAttachments,
      },
      status: 'temporary',
    })

    if (result.deletedCount === parsedAttachments.length) {
      return 'all'
    } else if (result.deletedCount === 0) {
      return 'none'
    } else {
      return 'partial'
    }
  } catch (error) {
    throw error
  }
}
export default { addAttachmentsToDB, fetchAttachmentRecord, deleteAttachments }
