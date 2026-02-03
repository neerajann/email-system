import { createContext, useContext, useMemo, useState } from 'react'

const UIContext = createContext(null)

const UIProvider = ({ children }) => {
  const [showSideBar, setShowSideBar] = useState(false)
  const [showComposeMail, setShowComposeMail] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const value = useMemo(
    () => ({
      showSideBar,
      setShowSideBar,
      showComposeMail,
      setShowComposeMail,

      unreadCount,
      setUnreadCount,
    }),
    [showSideBar, showComposeMail, unreadCount],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}
const useUI = () => useContext(UIContext)

export { UIProvider, useUI }
