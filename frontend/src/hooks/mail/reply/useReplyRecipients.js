import { useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'

const useReplyRecipients = ({ showReply, mail, setRecipients }) => {
  const { user } = useAuth()

  useEffect(() => {
    // Add all users recipients and senders to 'TO' ; exclude the sender address
    if (showReply?.replyAll) {
      const recipents = mail.to
        .filter((r) => {
          return r.address !== user
        })
        .map((r) => r.address)

      recipents.push(mail.from.address)
      setRecipients(recipents)
    } else if (showReply?.reply) {
      // Reply to sender, unless replying to own sent mail - then reply to original recipients
      if (mail.from.address === user) {
        setRecipients(mail.to.map((r) => r.address))
      } else {
        setRecipients([mail.from.address])
      }
    }
  }, [])
}
export default useReplyRecipients
