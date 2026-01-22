import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import handleUploadError from '../utils/handleUploadError.js'
import attachmentService from '../services/mail/attachment.service.js'

const uploadAttachments = {
  onRequestAbort: async (req) => {
    const filePaths = req.uploadedFilePaths || []

    for (const filePath of filePaths) {
      try {
        await fs.promises.unlink(filePath)
      } catch (err) {
        console.log(err)
      }
    }
  },
  handler: async (req, reply) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const uploadDir = path.join(__dirname, '../../../data/attachments')

    await fs.promises.mkdir(uploadDir, { recursive: true })

    const savedFiles = []
    req.uploadedFilePaths = []
    let fileCount = 0

    try {
      for await (const part of req.parts()) {
        if (!part.file) continue
        if (!part.filename) continue

        if (part.fieldname !== 'attachments') continue

        fileCount++

        const safeFileNameForStorage = part.filename.replace(
          /[^a-zA-Z0-9.\-_]/g,
          '_',
        )
        const uniqueSuffix = Date.now() + '-' + crypto.randomUUID()
        const fileName = `${uniqueSuffix}-${safeFileNameForStorage}`
        const filePath = path.join(uploadDir, fileName)
        req.uploadedFilePaths.push(filePath)

        await new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(filePath)

          const cleanup = (err) => {
            part.file.unpipe(stream)
            part.file.destroy()
            stream.destroy()
            fs.unlink(filePath, () => {})
            reject(err)
          }

          part.file.on('limit', () => {
            cleanup(new Error('FILE_TOO_LARGE'))
          })

          part.file.on('error', cleanup)
          stream.on('error', cleanup)
          stream.on('finish', resolve)

          part.file.pipe(stream)
        })

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

      const attachmentIds =
        await attachmentService.addAttachmentsToDB(savedFiles)
      req.uploadedFilePaths = []
      return reply.code(200).send(attachmentIds)
    } catch (error) {
      for (const f of savedFiles) {
        fs.unlink(f.path, () => {})
      }
      console.log(error)
      return handleUploadError(reply, error)
    }
  },
}

const downloadAttachment = async (req, reply) => {
  const attachmentId = req.params.id
  const emailId = req.query.emailId.trim()

  const attachment = await attachmentService.fetchAttachmentRecord({
    userId: req.userId,
    emailId,
    attachmentId,
  })
  if (!attachment) {
    return reply.code(404).send({ error: 'Not found' })
  }
  reply.header(
    'Content-Disposition',
    `attachment; filename=${attachment.originalName}`,
  )

  return reply.send(fs.createReadStream(attachment.path))
}

const deleteAttachments = async (req, reply) => {
  try {
    console.log(req.body)
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
