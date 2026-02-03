import { useRef, useState } from 'react'

const useDraft = ({ subject }) => {
  const [recipients, setRecipients] = useState([])

  const email = useRef({
    subject: subject || '',
    body: '',
    attachments: [],
  })

  return { recipients, setRecipients, email: email.current }
}
export default useDraft
