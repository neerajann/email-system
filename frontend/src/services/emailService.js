import api from './api.js'
import {
  handleApiError,
  handleApiSuccess,
} from '../utils/apiResponseHandler.jsx'

const sendMail = async ({ email, data, attachmentsInfo, queryClient }) => {
  try {
    await api.post('/mail/send', data)
    queryClient.invalidateQueries(['mail', 'sent']) // Invalidate sent so next time its loaded, its refetched
    handleApiSuccess()
  } catch (error) {
    await cancelMail({ attachmentsInfo, email })
    handleApiError(error)
  }
}

const cancelMail = async ({ attachmentsInfo, controllersRef, email }) => {
  try {
    attachmentsInfo.map((id) => {
      if (controllersRef?.current[id]) {
        controllersRef.current[id].abort() // If  upload is not compelete, send cancel upload signal
        delete controllersRef.current[id]
      }
    })

    // Only delete attachments that were uploaded and not manually removed by user
    const uploadedAttachments = attachmentsInfo
      .filter((a) => a.uploaded === true && a.removed !== true)
      .map((a) => a.id)
    if (uploadedAttachments.length === 0) return

    api.delete('/mail/attachment', {
      data: {
        attachments: uploadedAttachments,
      },
    })
  } catch (error) {}
}

export { sendMail, cancelMail }
