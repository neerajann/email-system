import api from '../services/api'
import SideBar from '../components/SideBar'
import TopBar from '../components/TopBar'
import { useQuery } from '@tanstack/react-query'
import { toast, ToastContainer } from 'react-toastify'
import { useEffect } from 'react'
import { useAppContext } from '../AppContext'
import Mails from '../components/Mails'
import ComposeMail from '../components/ComposeMail'

const Starred = () => {
  const { showComposeMail } = useAppContext()
  const fetchSent = async () => {
    const { data } = await api.get('/mail/starred')
    return data.mails
  }
  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['mail', 'sent'],
    queryFn: fetchSent,
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
export default Starred
