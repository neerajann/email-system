import MailListLayout from '../../layouts/MailListLayout'
import api from '../../services/api'
const StarredPage = () => {
  const fetchStarred = async ({ pageParam }) => {
    const res = await api.get(
      `/mail/starred${pageParam ? '?cursor=' + pageParam : ''}`,
    )
    return res.data
  }

  return (
    <MailListLayout
      mailboxType={'starred'}
      queryKey={['mailboxes', 'starred']}
      fetchFuction={fetchStarred}
    />
  )
}
export default StarredPage
