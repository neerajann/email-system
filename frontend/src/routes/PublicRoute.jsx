import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import MainLoading from '../components/loading/MainLoading'

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <MainLoading />

  if (user) {
    return <Navigate to='/inbox' replace />
  }

  return children
}

export default PublicRoute
