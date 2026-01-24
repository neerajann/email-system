import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import { ToastContainer, toast } from 'react-toastify'
import { useQuery } from '@tanstack/react-query'
import 'react-toastify/dist/ReactToastify.css'
import { Outlet } from 'react-router-dom'
import { useUI } from '../../contexts/UIContext'
import SearchListItem from '../../components/mail/SearchListItem'

const SearchPage = () => {
  const { showThread } = useUI()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')

  const searchMails = async () => {
    const res = await api.get(`/mail/search?q=${query}`)
    return res.data
  }

  const {
    data: searchResult = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['search', query],
    queryFn: searchMails,
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
    <div className='w-full h-full min-h-dvh  overflow-hidden min-w-0 text-sm'>
      <div className='grid lg:grid-cols-2  grid-cols-1 h-full min-w-0 '>
        <div
          className={` border-x border-border relative ${showThread ? 'hidden lg:flex' : 'flex'}  min-w-0 flex-col`}
        >
          <div className='flex flex-col shadow-xs mb-3 border-b border-border bg-background relative z-[40]'>
            <div className='flex items-center justify-between text-sm font-medium px-4 py-2 shadow-xs bg-background relative'>
              <div className='flex items-center gap-3'>
                <span>
                  {searchResult.total}{' '}
                  {searchResult.total <= 1 ? 'email' : 'emails'}
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
          {searchResult.mails?.length ? (
            <div className='h-full flex-1  min-w-0 grid auto-rows-[110px] overflow-y-auto '>
              {searchResult.mails.map((mail) => (
                <SearchListItem key={mail.threadId} mail={mail} query={query} />
              ))}
            </div>
          ) : (
            <div className=' flex h-full  justify-center items-center  absolute inset-0 pointer-events-none'>
              <div className='pointer-events-auto'>
                No messages matched your search.
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
export default SearchPage
