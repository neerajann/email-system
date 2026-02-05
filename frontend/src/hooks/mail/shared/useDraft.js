import { useRef, useState } from 'react'

const useDraft = ({ subject, body, attachments }) => {
  const [recipients, setRecipients] = useState([])

  const email = useRef({
    subject: subject || '',
    body: body || '',
    attachments: attachments || [],
  })

  return { recipients, setRecipients, email: email.current }
}
export default useDraft
