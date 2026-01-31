import { memo } from 'react'
import BaseMailListItem from './BaseMailListItem.jsx'

const MailListItem = memo((props) => {
  const { mail } = props
  return (
    <BaseMailListItem
      snippet={mail.snippet}
      subject={mail.subject}
      navigateTo={mail.mailboxId}
      {...props}
    />
  )
})
export default MailListItem
