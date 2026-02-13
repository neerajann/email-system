import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Attachment } from '@email-system/core/models'

const uploadAttachment = async (attachments) => {
  // Returns the location of where to store the attachments
  const getDataDir = () => {
    // If the DATA_DIR is directly provided in env
    if (process.env.DATA_DIR) {
      return process.env.DATA_DIR
    }
    // Else store in relative path
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    return path.join(__dirname, '../../data/')
  }

  const uploadDir = path.join(getDataDir(), 'attachments')

  // Create the folder if it doesnot exist
  await fs.promises.mkdir(uploadDir, {
    recursive: true,
  })

  let savedFiles = []

  for await (const attachment of attachments) {
    // Add unique suffix to the name of attachments to avoid conflicts for attachments with same name
    const uniqueSuffix = Date.now() + '-' + crypto.randomUUID()
    // Sanitizes the filename path traversal attacks
    const safeFileName = attachment.filename.replace(/[^\w.\-]/g, '_')
    // Generates a unique filename that will be used to store the attachment
    const fileName = `${uniqueSuffix}-${attachment.filename}`
    const filePath = path.join(uploadDir, fileName)
    try {
      // Writes to specified file path from the buffer
      const inputBuffer = Buffer.from(attachment.content.data)
      await fs.promises.writeFile(filePath, inputBuffer)

      // Add to savedFiles array
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
  // Insert into Attachment collection and return back the inserted attachment id's
  const inserted = await Attachment.insertMany(savedFiles)
  return inserted.map((i) => i._id)
}

export default uploadAttachment
