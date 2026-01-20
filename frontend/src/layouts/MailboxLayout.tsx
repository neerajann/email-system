import { Outlet } from 'react-router-dom'
import TopBar from '../components/navigation/TopBar'
import SideBar from '../components/navigation/SideBar'

const MailboxLayout = () => {
  return (
    <div className='w-full h-full relative'>
      <TopBar />
      <div className='flex w-full min-w-0'>
        <SideBar />
        <Outlet />
      </div>
    </div>
  )
}
export default MailboxLayout
