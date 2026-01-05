import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import handleUploadError from '../utils/handleUploadError.js'
import attachmentService from '../services/mail/attachment.service.js'

const uploadAttachments = async (req, reply) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const uploadDir = path.join(__dirname, '../../../data/attachments')

  await fs.promises.mkdir(uploadDir, { recursive: true })

  const savedFiles = []
  let fileCount = 0

  try {
    for await (const part of req.parts()) {
      if (!part.file) continue
      if (!part.filename) continue

      if (part.fieldname !== 'attachments') continue

      fileCount++

      const uniqueSuffix = Date.now() + '-' + crypto.randomUUID()
      const fileName = `${uniqueSuffix}-${part.filename}`
      const filePath = path.join(uploadDir, fileName)

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
        encoding: part.encoding,
        size: part.file.bytesRead,
      })
    }

    if (fileCount === 0) {
      throw new Error('NO_FILES')
    }

    const attachmentIds = await attachmentService.addAttachmentsToDB(savedFiles)
    return reply.code(200).send(attachmentIds)
  } catch (error) {
    for (const f of savedFiles) {
      fs.unlink(f.path, () => {})
    }
    console.log(error)
    return handleUploadError(reply, error)
  }
}

const downloadAttachment = async (req, reply) => {
  const attachmentId = req.params.id
  const mailId = req.query.mailId.trim()

  const attachment = await attachmentService.fetchAttachmentRecord({
    userId: req.userId,
    mailId,
    attachmentId,
  })
  if (!attachment) {
    return reply.code(404).send({ error: 'Not found' })
  }
  reply.header(
    'Content-Disposition',
    `attachment; filename=${attachment.originalName}`
  )

  return reply.send(fs.createReadStream(attachment.path))
}
export default { uploadAttachments, downloadAttachment }
