import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('dark-mode') === 'true'
  })
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
  useEffect(() => {
    const html = document.documentElement

    if (darkMode) {
      html.classList.add('dark')
      localStorage.setItem('dark-mode', 'true')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('dark-mode', 'false')
    }
  }, [darkMode])
  const value = {
    user,
    darkMode,
    setDarkMode,
    setUser,
    loading,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
const useAuth = () => useContext(AuthContext)

export { AuthProvider, useAuth }
