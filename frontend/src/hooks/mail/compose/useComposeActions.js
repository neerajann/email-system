import { cancelMail, sendMail } from '../../../services/emailService'

const useComposeActions = ({
  recipients,
  email,
  attachmentsInfo,
  controllersRef,
  setShowComposeMail,
  queryClient,
  recipientsRef,
  subjectRef,
  uploadErrorRef,
}) => {
  const send = () => {
    uploadErrorRef.current.textContent = ''
    subjectRef.current.textContent = ''
    recipientsRef.current.textContent = ''

    if (recipients.length === 0) {
      return (recipientsRef.current.textContent =
        'Please specify at least one recipient')
    }

    if (email.subject.length === 0) {
      return (subjectRef.current.textContent = 'Subject is required')
    }
    if (email.subject.length > 200) {
      return (subjectRef.current.textContent = 'Subject is too long')
    }

    const incompleteUpload = attachmentsInfo.some((a) => !a.uploaded)

    if (incompleteUpload.length) {
      uploadErrorRef.current.textContent =
        'Please wait until all attachments finish uploading'
      return
    }

    sendMail({
      email: email,
      attachmentsInfo,
      queryClient,
      data: { ...email, recipients: recipients },
    })
    setShowComposeMail(false)
  }

  const cancel = () => {
    cancelMail({
      attachmentsInfo,
      controllersRef,
      email,
    })
    setShowComposeMail(false)
  }
  return { send, cancel }
}
export default useComposeActions
