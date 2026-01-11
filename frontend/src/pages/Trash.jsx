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

const Trash = () => {
  const { showComposeMail } = useAppContext()
  const fetchInbox = async () => {
    const res = await api.get('/mail/trash')
    console.log(res)
    return res.data.mails
  }
  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['mail', 'trash'],
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

  return (
    <div className='w-full h-full relative'>
      <TopBar />
      <ToastContainer
        position='top-center'
        style={{ top: '5rem' }}
        className='fixed z-30 pointer-events-none'
        toastClassName='pointer-events-auto'
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />

      <div className='flex w-screen'>
        <SideBar />
        <Mails data={data} />
        {showComposeMail && <ComposeMail />}
      </div>
    </div>
  )
}

export default Trash
