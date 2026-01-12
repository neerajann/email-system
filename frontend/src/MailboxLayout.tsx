import { Outlet } from 'react-router-dom'
import TopBar from './components/TopBar'
import SideBar from './components/SideBar'

const MailboxLayout = () => {
  return (
    <div className='w-full h-full relative'>
      <TopBar />
      <div className='flex w-screen '>
        <SideBar />

        <Outlet />
      </div>
    </div>
  )
}
export default MailboxLayout
