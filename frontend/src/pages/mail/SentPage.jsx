import MailListLayout from '../../layouts/MailListLayout'
import api from '../../services/api'

const SentPage = () => {
  const fetchSent = async ({ pageParam }) => {
    const res = await api.get(
      `/mail/sent${pageParam ? '?cursor=' + pageParam : ''}`,
    )
    return res.data
  }

  return (
    <MailListLayout
      mailboxType={'sent'}
      queryKey={['mailboxes', 'sent']}
      fetchFuction={fetchSent}
    />
  )
}
export default SentPage
