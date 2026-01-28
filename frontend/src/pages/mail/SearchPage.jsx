import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import MailListLayout from '../../layouts/MailListLayout'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')

  const searchMails = async () => {
    const res = await api.get(`/mail/search?q=${query}`)
    return res.data
  }

  return (
    <MailListLayout
      queryKey={['search', searchParams]}
      fetchFuction={searchMails}
      mailboxType={'search'}
      query={query}
    />
  )
}
export default SearchPage
