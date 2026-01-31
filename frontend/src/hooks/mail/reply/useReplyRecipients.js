import { useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'

const useReplyRecipients = ({ showReply, mail, setReply }) => {
  const { user } = useAuth()

  useEffect(() => {
    if (showReply?.replyAll) {
      const recipents = mail.to
        .filter((r) => {
          return r.address !== user
        })
        .map((r) => r.address)

      recipents.push(mail.from.address)
      setReply((prev) => ({ ...prev, recipients: recipents }))
    } else if (showReply?.reply) {
      setReply((prev) => ({ ...prev, recipients: [mail.from.address] }))
    }
  }, [])

  const handleChange = (e) => {
    setReply((prev) => ({ ...prev, body: e.target.value }))
  }
  return {
    handleChange,
  }
}
export default useReplyRecipients
