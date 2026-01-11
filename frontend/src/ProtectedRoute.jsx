import { Navigate } from 'react-router-dom'
import { useAppContext } from './AppContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAppContext()

  if (loading) return null

  if (!user) {
    return <Navigate to='/login' replace />
  }
  if (!children) return <Navigate to='/inbox' replace />
  return children
}

export default ProtectedRoute
