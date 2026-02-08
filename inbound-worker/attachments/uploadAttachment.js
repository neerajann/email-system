import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Attachment } from '@email-system/core/models'

const uploadAttachment = async (attachments) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const uploadDir = path.join(__dirname, '../../../../data/attachments/')

  await fs.promises.mkdir(uploadDir, {
    recursive: true,
  })

  let savedFiles = []

  for await (const attachment of attachments) {
    const uniqueSuffix = Date.now() + '-' + crypto.randomUUID()
    const safeFileName = attachment.filename.replace(/[^\w.\-]/g, '_')
    const fileName = `${uniqueSuffix}-${attachment.filename}`
    const filePath = path.join(uploadDir, fileName)
    try {
      const inputBuffer = Buffer.from(attachment.content.data)
      await fs.promises.writeFile(filePath, inputBuffer)

      savedFiles.push({
        originalName: safeFileName,
        mimetype: attachment.contentType,
        fileName: fileName,
        path: filePath,
        size: attachment.size,
        status: 'attached',
      })
    } catch (error) {
      console.log(error)
      continue
    }
  }

  const inserted = await Attachment.insertMany(savedFiles)
  return inserted.map((i) => i._id)
}

export default uploadAttachment
