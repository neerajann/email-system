const handleUploadError = (reply, error) => {
  if (error.code === 'FST_FILES_LIMIT') {
    return reply.code(400).send({
      error: 'You can upload a maximum of 10 files',
    })
  }
  if (error.message === 'NO_FILES')
    return reply.code(400).send({
      eror: 'No file to upload.',
    })

  if (error.message === 'FILE_TOO_LARGE') {
    return reply.code(400).send({
      eror: 'Max alloweded file size is 10 MB.',
    })
  }

  if (error.code === 'FST_MULTIPART_FILE_SIZE_LIMIT') {
    return reply.code(400).send({
      eror: 'File size exceeds the allowed limit',
    })
  }
  return reply.code(500).send({
    error: 'Something went wrong.',
  })
}

export default handleUploadError
