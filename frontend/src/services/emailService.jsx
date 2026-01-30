import { toast } from 'react-toastify'
import api from './api'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

const sendMail = async ({
  email,
  recipentsRef,
  subjectRef,
  attachmentsInfo,
  uploadErrorRef,
  setShowComposeMail,
  queryClient,
}) => {
  if (email.recipients.length === 0) {
    return (recipentsRef.current.textContent =
      'Please specify at least one recipient.')
  }
  recipentsRef.current.textContent = ''
  if (email.subject.length > 200) {
    return (subjectRef.current.textContent = 'Subject is too long.')
  }
  subjectRef.current.textContent = ''
  const incompleteUpload = attachmentsInfo.filter(
    (attachment) => !attachment.uploaded,
  )

  if (incompleteUpload.length) {
    uploadErrorRef.current.textContent =
      'Please wait until all attachments finish uploading'
    return
  }
  uploadErrorRef.current.textContent = ''
  try {
    setShowComposeMail(false)
    await api.post('/mail/send', email)
    queryClient.invalidateQueries(['mail', 'sent'])
    toast.success('Mail sent sucessfully', {
      containerId: 'result',
      icon: <FiCheckCircle size={18} className='text-green-500' />,
    })
  } catch (error) {
    console.log(error)
    await cancelMail({ attachmentsInfo, email })
    toast.error(error.response.data.error, {
      containerId: 'result',
      icon: <FiXCircle className='text-red-500' size={18} />,
    })
  }
}

const cancelMail = async ({ attachmentsInfo, controllersRef, email }) => {
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
}
const sendReply = async ({
  reply,
  attachmentsInfo,
  uploadErrorRef,
  setShowReply,
  queryClient,
  emailId,
  mailboxId,
}) => {
  const incompleteUpload = attachmentsInfo.filter(
    (attachment) => !attachment.uploaded,
  )

  if (incompleteUpload.length) {
    uploadErrorRef.current.textContent =
      'Please wait until all attachments finish uploading'
    return
  }
  uploadErrorRef.current.textContent = ''

  try {
    setShowReply(false)
    await api.post('/mail/send', {
      ...reply,
      emailId,
      mailboxId,
    })
    queryClient.invalidateQueries(['mail', 'sent'])
    toast('Mail sent sucessfully')
  } catch (error) {
    console.log(error)
    cancelMail({ attachmentsInfo, email: reply })
    toast(error.response.data.error)
  }
}
export { sendMail, cancelMail, sendReply }
