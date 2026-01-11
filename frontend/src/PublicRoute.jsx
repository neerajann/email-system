import { useAppContext } from './AppContext'
import { Navigate } from 'react-router-dom'

const PublicRoute = ({ children }) => {
  const { user, loading } = useAppContext()

  if (loading) return null

  if (user) {
    return <Navigate to='/inbox' replace />
  }

  return children
}

export default PublicRoute
