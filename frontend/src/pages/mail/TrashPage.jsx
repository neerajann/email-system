import MailListLayout from '../../layouts/MailListLayout'
import api from '../../services/api'

const TrashPage = () => {
  const fetchTrash = async ({ pageParam }) => {
    const res = await api.get(
      `/mail/trash${pageParam ? '?cursor=' + pageParam : ''}`,
    )
    return res.data
  }

  return (
    <MailListLayout
      mailboxType={'trash'}
      queryKey={['mailboxes', 'trash']}
      fetchFuction={fetchTrash}
    />
  )
}
export default TrashPage
