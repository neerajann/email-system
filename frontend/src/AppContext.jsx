import { createContext, useContext, useEffect, useState } from 'react'
import api from './services/api'

const AppContext = createContext(null)

const AppProvider = ({ children }) => {
  const [showSideBar, setShowSideBar] = useState(false)
  const [showComposeMail, setShowComposeMail] = useState(false)
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
    showSideBar,
    setShowSideBar,
    showComposeMail,
    setShowComposeMail,
    user,
    setUser,
    loading,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

const useAppContext = () => useContext(AppContext)
export { AppProvider, useAppContext }
