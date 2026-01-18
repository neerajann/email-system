import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Navigate to='/login' replace />
  }
  if (!children) return <Navigate to='/inbox' replace />
  return children
}

export default ProtectedRoute
