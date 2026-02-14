import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (localStorage.getItem('dark-mode')) {
      return localStorage.getItem('dark-mode') === 'true' ? true : false
    }
    return window.matchMedia('(prefers-color-scheme:dark)').matches // Fallback to the user's OS-level preference if no theme is stored in localStorage
  })

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
    darkMode,
    setDarkMode,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
const useTheme = () => useContext(ThemeContext)

export { ThemeProvider, useTheme }
