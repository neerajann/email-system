import { cancelMail, sendMail } from '../../../services/emailService'

const useComposeActions = ({
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
    if (email.recipients.length === 0) {
      return (recipientsRef.current.textContent =
        'Please specify at least one recipient.')
    }
    recipientsRef.current.textContent = ''
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

    sendMail({
      email,
      attachmentsInfo,
      queryClient,
      data: email,
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
