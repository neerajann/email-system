import { useSearchParams } from 'react-router-dom'
import api from '../../services/api.js'
import MailListLayout from '../../layouts/MailListLayout'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')

  const searchMails = async ({ pageParam }) => {
    const res = await api.get(
      `/mail/search?q=${query}${pageParam ? '&cursor=' + pageParam : ''}`,
    )
    return res.data
  }

  return (
    <MailListLayout
      queryKey={['search', query]}
      fetchFunction={searchMails}
      mailboxType={'search'}
      query={query}
      emptyMessage={'No email matched your search.'}
    />
  )
}
export default SearchPage
