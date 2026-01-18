import { createContext, useContext, useState } from 'react'

const UIContext = createContext(null)

const UIProvider = ({ children }) => {
  const [showSideBar, setShowSideBar] = useState(false)
  const [showComposeMail, setShowComposeMail] = useState(false)
  const value = {
    showSideBar,
    setShowSideBar,
    showComposeMail,
    setShowComposeMail,
  }
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}
const useUI = () => useContext(UIContext)

export { UIProvider, useUI }
