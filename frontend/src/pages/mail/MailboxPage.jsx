import MailListLayout from '../../layouts/MailListLayout'
import api from '../../services/api'
import { useParams } from 'react-router-dom'
import NotFound from '../NotFound'

const MAILBOX_TYPES = {
  inbox: { endpoint: '/mail/inbox', queryKey: ['mailboxes', 'inbox'] },
  sent: { endpoint: '/mail/sent', queryKey: ['mailboxes', 'sent'] },
  starred: { endpoint: '/mail/starred', queryKey: ['mailboxes', 'starred'] },
  trash: { endpoint: '/mail/trash', queryKey: ['mailboxes', 'trash'] },
}

const MailboxPage = () => {
  const { mailboxType } = useParams()
  if (!MAILBOX_TYPES[mailboxType]) return <NotFound />

  const config = MAILBOX_TYPES[mailboxType]

  const fetchMails = async ({ pageParam }) => {
    const res = await api.get(
      `${config.endpoint}${pageParam ? '?cursor=' + pageParam : ''}`,
    )
    return res.data
  }
  return (
    <MailListLayout
      queryKey={config.queryKey}
      mailboxType={mailboxType}
      fetchFunction={fetchMails}
      emptyMessage={'No emails in this folder.'}
    />
  )
}
export default MailboxPage
