import { useState } from 'react'

const useDraft = ({ subject }) => {
  const [email, setEmail] = useState({
    recipients: [],
    subject: subject || '',
    body: '',
    attachments: [],
  })
  return { email, setEmail }
}
export default useDraft
