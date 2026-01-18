import { GiHamburgerMenu } from 'react-icons/gi'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useUI } from '../../contexts/UIContext'

const TopBar = () => {
  const { setUser, user } = useAuth()
  const { setShowSideBar } = useUI()
  const handleLogout = async () => {
    const result = await api.post('/auth/logout')
    if (result.data.success) setUser(null)
  }
  return (
    <div className=' w-full flex justify-between items-center p-4  bg-background relative z-50 shadow-xs border-b border-border'>
      <div className='flex items-center mr-4 '>
        <GiHamburgerMenu
          className='mr-5 size-6 xl:hidden'
          onClick={() => {
            setShowSideBar((prev) => !prev)
          }}
        />
        <h2 className=' text-lg font-bold '>inboxify</h2>
      </div>

      <div>
        <p className=' text-sm text-foreground font-medium hidden lg:inline'>
          {user}
        </p>

        <button
          type='submit'
          onClick={handleLogout}
          className='bg-foreground  text-sm text-background px-2 py-1 rounded ml-4'
        >
          Logout
        </button>
      </div>
    </div>
  )
}
export default TopBar
