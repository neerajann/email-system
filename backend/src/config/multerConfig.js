import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

const UPLOAD_DIR = path.resolve(process.cwd(), 'attachments')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomUUID() + '-'
    cb(null, uniqueSuffix + file.originalname)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
    files: 10,
  },
})

export default upload
