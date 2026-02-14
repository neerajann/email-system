import mongoose from 'mongoose'
import { Attachment, Mailbox, Email } from '@email-system/core/models'
import fs from 'fs/promises'

// Store attachments metadata to Database
const addAttachmentsToDB = async (files) => {
  try {
    const { insertedIds } = await Attachment.insertMany(files, {
      rawResult: true,
    })
    // Return back inserted attachment id's
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

  // Check if mailbox exist with given emailId for a user (checks if a user owns the email)
  const mailboxExists = await Mailbox.exists({
    userId: userIdObject,
    emailIds: emailIdObject,
  })

  // Check if the email owns the attachment
  const emailHasAttachment = await Email.exists({
    _id: emailIdObject,
    attachments: attachmentIdObject,
  })

  // If any of the condition fail, return null
  if (!mailboxExists || !emailHasAttachment) {
    return null
  }
  // Else fetch the attachmen record from DB
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

    // Fetch attachment with given id and status as temporary (attached attachments cannot be deleted as they are shared across recipients)
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

    // Delete from disk storage
    await Promise.allSettled(
      attachmentInfo.map((attachment) => {
        fs.unlink(attachment.path)
      }),
    )
    // Delete from database
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
