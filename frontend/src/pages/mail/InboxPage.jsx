import MailListLayout from '../../layouts/MailListLayout'
import api from '../../services/api'

const InboxPage = () => {
  const fetchInbox = async ({ pageParam }) => {
    const res = await api.get(
      `/mail/inbox${pageParam ? '?cursor=' + pageParam : ''}`,
    )
    return res.data
  }

  return (
    <MailListLayout
      mailboxType={'inbox'}
      fetchFuction={fetchInbox}
      queryKey={['mailboxes', 'inbox']}
    />
  )
}
export default InboxPage
