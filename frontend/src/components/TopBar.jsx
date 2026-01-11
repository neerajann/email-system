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
    <div className=' bg-white w-full flex justify-between items-center p-4 shadow-2xl shadow-[#20121217] border-b  relative z-50'>
      <div className='flex  items-center '>
        <GiHamburgerMenu
          className='mr-5 size-6 lg:hidden'
          onClick={() => setShowSideBar((prev) => !prev)}
        />
        <h2 className='text-lg font-semibold '>Inboxify</h2>
      </div>
      <div>
        <input
          type='search'
          placeholder='Search in mail'
          className='border lg:w-100 p-1 rounded-2xl '
        />
      </div>
      <div>
        {user}
        <button
          type='submit'
          onClick={handleLogout}
          className='bg-foreground text-background px-2 py-1 rounded ml-3'
        >
          Logout
        </button>
      </div>
    </div>
  )
}
export default TopBar
