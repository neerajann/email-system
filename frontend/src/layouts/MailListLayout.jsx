import { useEffect, useMemo } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { Outlet } from 'react-router-dom'
import MailListItem from '../components/mail/MailListItem'
import { useUI } from '../contexts/UIContext'
import { IoMdRefresh } from 'react-icons/io'

const didMount = { current: false }

const MailListLayout = ({ mailType }) => {
  const { showThread, setUnreadCount } = useUI()
  const queryClient = useQueryClient()
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
    refetch,
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

  useEffect(() => {
    if (mailType !== 'inbox') return
    if (didMount.current) {
      refetch()
    } else {
      didMount.current = true
    }

    const sse = new EventSource(`${import.meta.env.VITE_API_URL}/events`, {
      withCredentials: true,
    })

    sse.onmessage = (e) => {
      const newMail = JSON.parse(e.data)
      handleNewMail(newMail)
    }
    sse.onerror = () => {
      sse.close()
    }
    return () => sse.close()
  }, [mailType])

  useEffect(() => {
    if (mailType !== 'inbox') return

    const unreadCount = data?.mails?.filter((m) => !m.isRead)?.length
    setUnreadCount(unreadCount)
  }, [data, mailType])

  const handleNewMail = (newMail) => {
    queryClient.setQueryData(['mail', mailType], (oldData = []) => {
      const filtered = oldData.mails.filter(
        (mail) => mail.threadId !== newMail.threadId,
      )
      if (filtered.length === oldData.total) {
        return { total: oldData.total + 1, mails: [newMail, ...filtered] }
      }
      return { ...oldData, mails: [newMail, ...filtered] }
    })
  }

  return (
    <div className='w-full h-full min-h-dvh  overflow-hidden min-w-0 text-sm'>
      <div className='grid lg:grid-cols-2 overflow-hidden  grid-cols-1 h-full min-w-0 '>
        <div
          className={` overflow-hidden border-x border-border relative ${showThread ? 'hidden lg:flex' : 'flex'}  min-w-0 flex-col`}
        >
          <div className='flex flex-col shadow-xs mb-3 border-b border-border bg-background relative z-[40]'>
            <div className='flex items-center justify-between text-sm font-medium px-4 py-2 shadow-xs bg-background relative'>
              <div className='flex items-center gap-3'>
                <button onClick={() => refetch()}>
                  <IoMdRefresh size={20} className='cursor-pointer' />
                </button>
                <span>
                  {data.total} {data.total <= 1 ? 'email' : 'emails'}
                </span>
              </div>
              <button className=' bg-background border border-border px-4 py-2 rounded font-normal'>
                Select
              </button>
            </div>
          </div>

          <div className='absolute top-0 left-0 right-0 z-[30] pointer-events-none'>
            <ToastContainer
              position='top-center'
              style={{ top: '80px' }}
              className='relative! w-full!  left-0! right-0! transform-none! pointer-events-none'
              toastClassName='pointer-events-auto !bg-background border border-border !text-foreground text-sm'
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
            />
          </div>
          {data.mails?.length ? (
            <div className='h-full flex-1 min-w-0 grid auto-rows-[110px] gap-4 overflow-y-auto '>
              {data.mails.map((mail) => (
                <MailListItem
                  key={mail.threadId}
                  queryKey={memoizedQueryKey}
                  mail={mail}
                />
              ))}
              <div className='h-40'></div>
            </div>
          ) : (
            <div className=' flex h-full  justify-center items-center  absolute inset-0 pointer-events-none'>
              <div className='pointer-events-auto'>
                No emails in this folder
              </div>
            </div>
          )}
        </div>

        <div
          className={` lg:flex min-w-0 w-full ${showThread ? 'flex' : 'hidden'}`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default MailListLayout
