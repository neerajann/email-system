import multer from 'multer'

const handleUploadError = (res, err) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'Total upload size must not exceed 10 MB.',
        })

      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'You can upload up to 10 files only.',
        })

      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Unexpected file field.',
        })

      default:
        return res.status(400).json({
          error: 'File upload error.',
        })
    }
  }
  switch (err?.message) {
    case 'Unexpected end of form':
      return res.status(400).json({
        error: 'Invalid upload request. The form data was incomplete.',
      })

    case 'NO_FILES':
      return res.status(400).json({
        error: 'No files were uploaded.',
      })

    case 'DATABASE_ERROR':
      return res.status(500).json({
        error: 'Error while storing files to database.',
      })

    default:
      console.log(err)
      return res.status(500).json({
        error: 'Something went wrong.',
      })
  }
}

export default handleUploadError
