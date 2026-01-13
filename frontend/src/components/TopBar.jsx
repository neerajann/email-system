import { GiHamburgerMenu } from 'react-icons/gi'
import { useAppContext } from '../AppContext'
import api from '../services/api'

const TopBar = () => {
  const { setShowSideBar, setUser, user } = useAppContext()
  const handleLogout = async () => {
    const result = await api.post('/auth/logout')
    if (result.data.success) setUser(null)
  }
  return (
    <div className=' w-full flex justify-between items-center p-4  bg-background border-b   border-border  relative z-50 shadow-xs'>
      <div className='flex items-center mr-4 '>
        <GiHamburgerMenu
          className='mr-5 size-6 lg:hidden'
          onClick={() => setShowSideBar((prev) => !prev)}
        />
        <h2 className=' text-lg font-bold '>inboxify</h2>
      </div>
      <div className='flex flex-1 justify-center'>
        <input
          type='search'
          placeholder='Search in mail'
          className='
          w-full
              bg-input
              text-foreground
              border
              border-border
              rounded-md
              p-2
              pl-3
              text-sm
              shadow-xs
              placeholder:text-muted-foreground
              focus:outline-none
              focus:border-ring
              focus:ring-2
              focus:ring-ring/50
              lg:w-100
              '
        />
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
