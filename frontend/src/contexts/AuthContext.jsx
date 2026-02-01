import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [{ data }] = await Promise.all([
          api.get('/auth/me'),
          new Promise((r) => setTimeout(r, 300)),
        ])
        setUser(data?.user?.emailAddress ?? null)
      } catch (e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
const useAuth = () => useContext(AuthContext)

export { AuthProvider, useAuth }
