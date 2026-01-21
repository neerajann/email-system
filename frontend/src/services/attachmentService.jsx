import { v4 as uuidv4 } from 'uuid'
import api from './api'

const handleFiles = async ({
  e,
  email,
  uploadErrorRef,
  controllersRef,
  setAttachmentsInfo,
}) => {
  const MAX_TOTAL_SIZE = 10 * 1024 * 1024

  const files = Array.from(e.target?.files || e.dataTransfer?.files || [])

  if (!files.length) return

  if (files.length + email.attachments.length > 10) {
    uploadErrorRef.current.textContent = 'You can only upload upto 10 files'
    return
  }

  const exisitingSize = email.attachments.reduce(
    (acc, att) => acc + att.size,
    0,
  )
  const newFileSize = files.reduce((acc, file) => acc + file.size, 0)
  if (exisitingSize + newFileSize > MAX_TOTAL_SIZE) {
    uploadErrorRef.current.textContent = 'Total attachments cannot exceed 10 MB'
    return
  }
  uploadErrorRef.current.textContent = ''
  await uploadFiles({ files, controllersRef, setAttachmentsInfo, email })
  e.target.value = null
}

const uploadFiles = async ({
  files,
  controllersRef,
  setAttachmentsInfo,
  email,
}) => {
  const filesWithId = files.map((file) => ({ file, id: uuidv4() }))

  setAttachmentsInfo((prev) => [
    ...prev,
    ...filesWithId.map(({ file, id }) => ({
      id,
      name: file.name,
      size: file.size,
      progress: 0,
      uploaded: false,
    })),
  ])

  await Promise.all(
    filesWithId.map(async ({ file, id }) => {
      const controller = new AbortController()
      controllersRef.current[id] = controller

      const form = new FormData()
      form.append('attachments', file)

      try {
        const result = await api.post('/mail/attachment', form, {
          signal: controller.signal,
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            if (!event.total) return
            const percent = Math.round((event.loaded * 100) / event.total)
            setAttachmentsInfo((prev) =>
              prev.map((att) =>
                att.id === id ? { ...att, progress: percent } : att,
              ),
            )
          },
        })

        if (result.data) {
          setAttachmentsInfo((prev) =>
            prev.map((att) =>
              att.id === id
                ? { ...att, uploaded: true, id: result.data[0] }
                : att,
            ),
          )
          result.data.forEach((attachId) => email.attachments.push(attachId))
        }
      } catch (err) {
        if (err.name === 'CanceledError') {
          console.log(`Upload cancelled: ${file.name}`)
        } else {
          console.error(err)
        }
      } finally {
        delete controllersRef.current[id]
      }
    }),
  )
}

const removeAttachment = ({
  id,
  attachmentsInfo,
  setAttachmentsInfo,
  controllersRef,
  email,
}) => {
  const attachment = attachmentsInfo.find((i) => i.id === id)
  if (!attachment) return

  if (controllersRef.current[id]) {
    controllersRef.current[id].abort()
    delete controllersRef.current[id]
  }

  setAttachmentsInfo((prev) => prev.filter((att) => att.id !== id))

  if (attachment.uploaded) {
    api
      .delete('/mail/attachment', {
        data: { attachments: [attachment.id] },
      })
      .catch(console.error)

    email.attachments = email.attachments.filter((attachId) => attachId !== id)
  }
}
export { uploadFiles, handleFiles, removeAttachment }
