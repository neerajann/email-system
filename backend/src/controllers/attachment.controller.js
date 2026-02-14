import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import handleUploadError from '../utils/handleUploadError.js'
import attachmentService from '../services/mail/attachment.service.js'

const uploadAttachments = {
  // Cleanup uploaded files if client aborts request midway
  onRequestAbort: async (req) => {
    const filePaths = req.uploadedFilePaths || []
    // Remove from disk storage
    for (const filePath of filePaths) {
      try {
        await fs.promises.unlink(filePath)
      } catch (err) {
        console.log(err)
      }
    }
  },
  handler: async (req, reply) => {
    // Resolve base data directory (env override or default local path)
    const getDataDir = () => {
      if (process.env.DATA_DIR) {
        return process.env.DATA_DIR
      }
      const __dirname = path.dirname(fileURLToPath(import.meta.url))
      return path.join(__dirname, '../../../data/')
    }

    const uploadDir = path.join(getDataDir(), 'attachments')
    await fs.promises.mkdir(uploadDir, { recursive: true }) // Ensure upload directory exists

    const savedFiles = []
    req.uploadedFilePaths = []
    let fileCount = 0

    try {
      // Iterate over multipart form parts
      for await (const part of req.parts()) {
        if (!part.file) continue
        if (!part.filename) continue

        if (part.fieldname !== 'attachments') continue // Only process "attachments" field

        fileCount++
        // Sanitize filename to prevent path traversal and invalid characters
        const safeFileNameForStorage = part.filename.replace(
          /[^a-zA-Z0-9.\-_]/g,
          '_',
        )
        // Generate unique filename to avoid collisions
        const uniqueSuffix = Date.now() + '-' + crypto.randomUUID()
        const fileName = `${uniqueSuffix}-${safeFileNameForStorage}`
        const filePath = path.join(uploadDir, fileName)
        req.uploadedFilePaths.push(filePath)

        // Stream file to disk with proper error handling and cleanup
        await new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(filePath)

          const cleanup = (err) => {
            part.file.unpipe(stream)
            part.file.destroy()
            stream.destroy()
            fs.unlink(filePath, () => {})
            reject(err)
          }

          // Triggered when file exceeds configured size limit
          part.file.on('limit', () => {
            cleanup(new Error('FILE_TOO_LARGE'))
          })

          part.file.on('error', cleanup)
          stream.on('error', cleanup)
          stream.on('finish', resolve)

          part.file.pipe(stream)
        })

        // Skip empty files
        if (part.file.bytesRead === 0) {
          fs.unlink(filePath, () => {})
          continue
        }

        savedFiles.push({
          path: filePath,
          originalName: part.filename,
          mimetype: part.mimetype,
          fileName,
          size: part.file.bytesRead,
        })
      }

      if (fileCount === 0) {
        throw new Error('NO_FILES')
      }

      // Persist attachment metadata in DB
      const attachmentIds =
        await attachmentService.addAttachmentsToDB(savedFiles)
      req.uploadedFilePaths = []
      return reply.code(200).send(attachmentIds)
    } catch (error) {
      // Cleanup already saved files on failure
      for (const f of savedFiles) {
        fs.unlink(f.path, () => {})
      }
      console.log(error)
      return handleUploadError(reply, error)
    }
  },
}

const downloadAttachment = async (req, reply) => {
  const q = req.query?.q || 'download'
  const attachmentId = req.params.id
  const emailId = req.query.emailId.trim()

  // Fetch attachment metadata
  const attachment = await attachmentService.fetchAttachmentRecord({
    userId: req.userId,
    emailId,
    attachmentId,
  })

  if (!attachment) {
    return reply.code(404).send({ error: 'Not found' })
  }
  // Set Content Disposition to view(opens the attachment in browser)
  if (q === 'view') {
    reply.header(
      'Content-Disposition',
      `inline; filename=${encodeURIComponent(attachment.originalName)}`,
    )
  }
  // Set Content Disposition to attachment(downloads the attachment)
  else {
    reply.header(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(attachment.originalName)}`,
    )
  }

  return reply.send(fs.createReadStream(attachment.path))
}

const deleteAttachments = async (req, reply) => {
  try {
    const response = await attachmentService.deleteAttachments(
      req.body.attachments,
    )
    if (response === 'all') {
      return reply.code(204).send()
    } else if (response === 'partial') {
      return reply.code(207).send({
        message: 'Some attachments could not be deleted',
      })
    } else {
      return reply.code(404).send({
        message: 'No matching resources found to delete',
      })
    }
  } catch (error) {
    console.log(error)
    handleUploadError(reply, error)
  }
}

export default { uploadAttachments, downloadAttachment, deleteAttachments }
