import { sendMail, cancelMail } from '../../../services/emailService'
const useReplyActions = ({
  attachmentsInfo,
  uploadErrorRef,
  setShowReply,
  queryClient,
  controllersRef,
  mailboxId,
  emailId,
  reply,
}) => {
  const send = () => {
    const incompleteUpload = attachmentsInfo.filter(
      (attachment) => !attachment.uploaded,
    )

    if (incompleteUpload.length) {
      uploadErrorRef.current.textContent =
        'Please wait until all attachments finish uploading'
      return
    }

    if (reply.body.length == 0) {
      uploadErrorRef.current.textContent = 'Cannot send an empty reply'
    }
    uploadErrorRef.current.textContent = ''

    sendMail({
      email: reply,
      attachmentsInfo,
      uploadErrorRef,
      queryClient,
      data: {
        ...reply,
        emailId,
        mailboxId,
      },
    })
    setShowReply(false)
  }
  const cancel = () => {
    setShowReply(false)
    cancelMail({
      attachmentsInfo,
      controllersRef,
      email: reply,
    })
  }

  return {
    send,
    cancel,
  }
}
export default useReplyActions
