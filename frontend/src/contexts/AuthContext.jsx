import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me')
        if (data.user) {
          setUser(data.user.emailAddress)
        }
      } catch (e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const value = {
    user,
    setUser,
    loading,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
const useAuth = () => useContext(AuthContext)

export { AuthProvider, useAuth }
