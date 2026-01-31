import api from './api.js'
import {
  handleApiError,
  handleApiSuccess,
} from '../utils/apiResponseHandler.jsx'

const sendMail = async ({ email, data, attachmentsInfo, queryClient }) => {
  try {
    await api.post('/mail/send', data)
    queryClient.invalidateQueries(['mail', 'sent'])
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
        controllersRef.current[id].abort()
        delete controllersRef.current[id]
      }
    })

    if (email.attachments.length > 0) {
      api.delete('/mail/attachment', {
        data: {
          attachments: email.attachments,
        },
      })
    }
  } catch (error) {
    handleApiError(error)
  }
}

export { sendMail, cancelMail }
