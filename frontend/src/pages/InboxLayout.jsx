import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import Mails from '../components/Mails'
import SideBar from '../components/SideBar'
import TopBar from '../components/TopBar'
import 'react-toastify/dist/ReactToastify.css'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import ComposeMail from '../components/ComposeMail'
import { useAppContext } from '../AppContext'
import { Outlet } from 'react-router-dom'

const InboxLayout = () => {
  const { showComposeMail } = useAppContext()

  const fetchInbox = async () => {
    const res = await api.get('/mail/inbox')
    return res.data
  }

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['mail', 'inbox'],
    queryFn: fetchInbox,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    let toastId

    if (isLoading) {
      toastId = toast.loading('Loading...')
    }

    if (isError) {
      toast.dismiss()
      toast.error(error.message || 'Something went wrong')
    }

    if (!isLoading && !isError) {
      toast.dismiss()
    }

    return () => toast.dismiss()
  }, [isLoading, isError])

  console.log(data)
  return (
    <div className='w-full h-screen relative'>
      <ToastContainer
        position='top-center'
        style={{ top: '5rem' }}
        className='fixed z-30 pointer-events-none'
        toastClassName='pointer-events-auto'
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />

      <div className='flex flex-1 h-full '>
        <div className='flex-1 border-r border-border'>
          <div className=' flex items-center justify-between text-sm  font-medium px-4 py-2 shadow-xs mb-3'>
            {data.total} {data.total <= 1 ? 'email' : 'emails'}
            <button className=' bg-background border border-border px-4 py-2 rounded font-normal'>
              Select
            </button>
          </div>
          <Mails mails={data.mails} total={data.total} />
        </div>
        <div className='hidden lg:flex flex-1'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default InboxLayout
