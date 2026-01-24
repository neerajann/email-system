import { GiHamburgerMenu } from 'react-icons/gi'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useUI } from '../../contexts/UIContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { RxCross1 } from 'react-icons/rx'

const TopBar = () => {
  const navigate = useNavigate()
  const { setUser, user } = useAuth()
  const { setShowSideBar } = useUI()
  const [query, setQuery] = useState('')

  const handleLogout = async () => {
    const response = confirm('Are you sure you want to logout?')
    if (response) {
      const result = await api.post('/auth/logout')
      if (result.data.success) setUser(null)
      return
    }
    return
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }
  return (
    <div
      className='grid grid-cols-[auto_1fr_auto] xl:grid-cols-[15.5rem_1fr_1fr] items-center py-4 bg-background border-b border-border z-50
  '
    >
      <div className='flex items-center gap-4 min-w-0 px-4'>
        <GiHamburgerMenu
          className='size-6 xl:hidden'
          onClick={() => setShowSideBar((p) => !p)}
        />
        <div className='hidden sm:flex items-center gap-4 '>
          <h2 className='text-lg font-bold'>inboxify</h2>
        </div>
      </div>
      <div className='relative w-full'>
        <form onSubmit={handleSubmit}>
          <input
            type='search'
            placeholder='Search in mail'
            className='w-full bg-input border border-border rounded-md p-2 pl-3 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50'
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
        </form>
        {query && (
          <button
            onClick={() => setQuery('')}
            className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
          >
            <RxCross1 />
          </button>
        )}
      </div>

      <div className='flex justify-end items-center gap-4 px-4 '>
        <p className='text-sm font-medium lg:block hidden'>{user}</p>
        <button
          onClick={handleLogout}
          className='bg-foreground text-background px-2 py-1 rounded text-sm'
        >
          Logout
        </button>
      </div>
    </div>
  )
}
export default TopBar
