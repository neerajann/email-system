import { Outlet } from 'react-router-dom'
import TopBar from './components/TopBar'
import SideBar from './components/SideBar'
import ComposeMail from './pages/ComposeMail'
import { useAppContext } from './AppContext'

const MailboxLayout = () => {
  const { showComposeMail } = useAppContext()
  return (
    <div className='w-full h-full relative'>
      {showComposeMail && <ComposeMail />}
      <TopBar />
      <div className='flex w-screen '>
        <SideBar />
        <Outlet />
      </div>
    </div>
  )
}
export default MailboxLayout
