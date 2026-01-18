import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) {
    return <Navigate to='/inbox' replace />
  }

  return children
}

export default PublicRoute
