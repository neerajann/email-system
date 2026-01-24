import { Outlet } from 'react-router-dom'
import TopBar from '../components/navigation/TopBar'
import SideBar from '../components/navigation/SideBar'

const MailboxLayout = () => {
  return (
    <div className='w-full h-dvh  relative'>
      <TopBar />
      <div className='grid grid-cols-1 xl:grid-cols-[15.5rem_1fr] min-w-0'>
        <SideBar />
        <Outlet />
      </div>
    </div>
  )
}
export default MailboxLayout
