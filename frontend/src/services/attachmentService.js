import { v4 as uuidv4 } from 'uuid'
import api from './api.js'

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
  // Calculate the size of earlier uploaded attachments
  const exisitingSize = email.attachments.reduce(
    (acc, att) => acc + att.size,
    0,
  )
  // Size of new attachments to upload
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
  // Generate a temporary id
  const filesWithId = files.map((file) => ({ file, id: uuidv4() }))

  setAttachmentsInfo((prev) => [
    ...prev,
    ...filesWithId.map(({ file, id }) => ({
      id,
      fileName: file.name,
      size: file.size,
      progress: 0,
      uploaded: false,
    })),
  ])

  // Upload all files asynchronously
  await Promise.all(
    filesWithId.map(async ({ file, id }) => {
      const controller = new AbortController() // To cancel upload in the middle of upload
      controllersRef.current[id] = controller // Store the abort controller with id as key

      const form = new FormData()
      form.append('attachments', file)

      try {
        const result = await api.post('/mail/attachment', form, {
          signal: controller.signal, // Abort signal
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            if (!event.total) return
            const percent = Math.round((event.loaded * 100) / event.total) // Calculate the upload progress
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
                ? { ...att, uploaded: true, id: result.data[0] } // Replace temproary id with id from backend
                : att,
            ),
          )
          result.data.forEach((attachId) => email.attachments.push(attachId)) // Push it to actual email
        }
      } catch (err) {
        if (err.name === 'CanceledError') {
          // Do nothing; the upload was cancelled by user
        } else {
          console.error(err)
        }
      } finally {
        delete controllersRef.current[id] // Delte the abort controller after the upload is complete
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

  // If abort controller exist i.e upload not completed, cancel the upload
  if (controllersRef.current[id]) {
    controllersRef.current[id].abort()
    delete controllersRef.current[id]
  }

  // Mark as removed rather than filtering out - cancelMail needs this flag to avoid re-deleting
  setAttachmentsInfo((prev) =>
    prev.map((att) => {
      if (att.id === id) {
        return {
          ...att,
          removed: true,
        }
      }
      return att
    }),
  )

  // If attachment has been uploaded already, delete it from backend
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
