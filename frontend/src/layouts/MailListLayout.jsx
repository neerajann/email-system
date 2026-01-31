import { useEffect, useMemo, useRef } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Outlet } from 'react-router-dom'
import MailListItem from '../components/mail/list/MailListItem.jsx'
import { useUI } from '../contexts/UIContext'
import SearchListItem from '../components/mail/list/SearchListItem.jsx'
import useMailboxQuery from '../hooks/mailbox/useMailboxQuery.js'
import useMailboxToasts from '../hooks/mailbox/useMailboxToasts.js'
import useMailboxSSE from '../hooks/mailbox/useMailboxSSE.js'
import useInfiniteScroll from '../hooks/mailbox/useInfiniteScroll.js'
import useBulkSelection from '../hooks/mailbox/useBulkSelection.js'
import MailListHeader from '../components/mail/list/MailListHeader.jsx'

const didMount = { current: false }

const MailListLayout = ({ mailboxType, queryKey, fetchFunction, query }) => {
  const loadMoreRef = useRef(null)
  const { showThread, setUnreadCount } = useUI()
  const memoizedQueryKey = useMemo(() => queryKey, [queryKey])

  const {
    mails,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useMailboxQuery({ queryKey, fetchFunction })

  useMailboxToasts({ isLoading, isError, error })
  useMailboxSSE({ mailboxType, queryKey, didMount, refetch })
  useInfiniteScroll({
    ref: loadMoreRef,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  })

  const { selectedIds, selectAll, toggle, clear, isBulkMode } =
    useBulkSelection()

  useEffect(() => {
    if (mailboxType !== 'inbox') return
    const unreadCount = mails?.filter((m) => !m.isRead)?.length
    setUnreadCount(unreadCount)
  }, [mails, mailboxType])

  return (
    <div className='w-full h-full overflow-hidden min-w-0 text-sm relative'>
      <div className='grid lg:grid-cols-2 overflow-hidden  grid-cols-1 h-full min-w-0 '>
        <div
          className={` overflow-hidden border-x border-border relative ${showThread ? 'hidden lg:flex' : 'flex'}  min-w-0 flex-col`}
        >
          <MailListHeader
            selectedIds={selectedIds}
            selectAll={selectAll}
            clear={clear}
            refetch={refetch}
            mailboxType={mailboxType}
            mails={mails}
            queryKey={memoizedQueryKey}
            isBulkMode={isBulkMode}
          />
          <div className='absolute top-0 left-0 right-0 z-[30] pointer-events-none'>
            <ToastContainer
              containerId={'loading'}
              position='top-center'
              style={{ top: '80px' }}
              className='relative! w-full!  left-0! right-0! transform-none! pointer-events-none'
              toastClassName='pointer-events-auto !bg-background border border-border !text-foreground text-sm'
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
            />
          </div>

          {mails?.length ? (
            <div className='h-full flex-1 min-w-0 grid auto-rows-auto gap-4 overflow-y-auto content-start pb-8'>
              {mailboxType === 'search'
                ? mails.map((mail) => (
                    <SearchListItem
                      key={mail.mailboxId}
                      queryKey={memoizedQueryKey}
                      mail={mail}
                      query={query}
                      isSelected={selectedIds.has(mail?.mailboxId)}
                      toggle={toggle}
                    />
                  ))
                : mails.map((mail) => (
                    <MailListItem
                      key={mail.mailboxId}
                      queryKey={memoizedQueryKey}
                      mail={mail}
                      isSelected={selectedIds.has(mail?.mailboxId)}
                      toggle={toggle}
                    />
                  ))}
              <div
                className='min-h-15 h-10 text-sm flex items-center justify-center'
                ref={loadMoreRef}
              >
                {isFetchingNextPage && <span>Loading more....</span>}
              </div>
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
      <ToastContainer
        containerId={'result'}
        position='bottom-right'
        toastClassName='pointer-events-auto !bg-background border border-border !text-foreground text-sm'
        hideProgressBar={true}
        autoClose={3000}
      />
    </div>
  )
}

export default MailListLayout
