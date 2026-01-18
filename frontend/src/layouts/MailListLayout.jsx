import { useEffect, useMemo } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { Outlet } from 'react-router-dom'
import MailListItem from '../components/mail/MailListItem'

const MailListLayout = ({ mailType }) => {
  const memoizedQueryKey = useMemo(() => ['mail', mailType], [mailType])

  const fetchMails = async () => {
    const res = await api.get(`/mail/${mailType}`)
    return res.data
  }

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['mail', mailType],
    queryFn: fetchMails,
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
    <div className='w-full h-screen '>
      <div className='grid grid-cols-1 lg:grid-cols-2 flex-1 h-full '>
        <div className='flex-1 border-x border-border relative flex flex-col'>
          <div className='flex flex-col shadow-xs mb-3 border-b border-border bg-background relative z-[40]'>
            <div className='flex flex-1 justify-center  w-full p-3'>
              <input
                type='search'
                placeholder='Search in mail'
                className='w-full bg-input text-foreground border border-border rounded-md p-2 pl-3 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 '
              />
            </div>
            <div className='flex items-center justify-between text-sm font-medium px-4 py-2 shadow-xs bg-background relative border-t border-border'>
              {data.total} {data.total <= 1 ? 'email' : 'emails'}
              <button className=' bg-background border border-border px-4 py-2 rounded font-normal'>
                Select
              </button>
            </div>
          </div>
          <div className='absolute top-0 left-0 right-0 z-[30] pointer-events-none'>
            <ToastContainer
              position='top-center'
              style={{ top: '140px' }}
              className='relative! w-full!  left-0! right-0! transform-none! pointer-events-none'
              toastClassName='pointer-events-auto !bg-background border border-border !text-foreground text-sm'
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
            />
          </div>
          {data.mails?.length ? (
            <div className='h-full flex-1 grid auto-rows-[90px] overflow-y-auto '>
              {data.mails.map((mail) => (
                <MailListItem
                  key={mail.threadId}
                  queryKey={memoizedQueryKey}
                  mail={mail}
                />
              ))}
            </div>
          ) : (
            <div className=' flex h-full  justify-center items-center  absolute inset-0 pointer-events-none'>
              <div className='pointer-events-auto'>
                No emails in this folder
              </div>
            </div>
          )}
        </div>
        <div className='hidden lg:flex'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default MailListLayout
