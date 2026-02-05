import { useEffect, useMemo } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Outlet, useParams } from 'react-router-dom'
import MailListItem from '../components/mail/list/MailListItem.jsx'
import { useUI } from '../contexts/UIContext'
import SearchListItem from '../components/mail/list/SearchListItem.jsx'
import useMailboxQuery from '../hooks/mailbox/useMailboxQuery.js'
import useMailboxToasts from '../hooks/mailbox/useMailboxToasts.jsx'
import useMailboxSSE from '../hooks/mailbox/useMailboxSSE.js'
import useInfiniteScroll from '../hooks/mailbox/useInfiniteScroll.js'
import useBulkSelection from '../hooks/mailbox/useBulkSelection.js'
import MailListHeader from '../components/mail/list/MailListHeader.jsx'
import MailListSkeleton from '../components/loading/skeleton/MailListSkeleton.jsx'
import { AnimatePresence, motion } from 'framer-motion'

const MailListLayout = ({
  mailboxType,
  queryKey,
  fetchFunction,
  query,
  emptyMessage,
}) => {
  const { setUnreadCount } = useUI()
  const memoizedQueryKey = useMemo(() => queryKey, [queryKey])
  const { id } = useParams()
  const hasThreadOpen = !!id

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

  useMailboxToasts({ isError, error })
  useMailboxSSE({ mailboxType, queryKey })
  const loadMoreRef = useInfiniteScroll({
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
          className={` overflow-hidden border-x border-border relative min-w-0 ${hasThreadOpen ? 'hidden lg:grid' : 'grid'}  grid-rows-[auto_1fr]`}
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
            hasThreadOpen={hasThreadOpen}
          />
          <div className='absolute top-0 left-0 right-0 z-[30] pointer-events-none'>
            <ToastContainer
              containerId={'error'}
              position='top-center'
              style={{ top: '80px' }}
              className='relative! w-full!  left-0! right-0! transform-none! pointer-events-none'
              toastClassName='pointer-events-auto !bg-background border border-border !text-foreground text-sm !rounded-lg'
              hideProgressBar={true}
              autoClose={2000}
            />
          </div>

          <AnimatePresence mode='wait'>
            {/* Skeleton */}
            {isLoading && (
              <motion.div
                key='skeleton'
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.2 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <MailListSkeleton />
              </motion.div>
            )}
            {/* Mail list */}
            {!isLoading && mails?.length > 0 && (
              <motion.div
                className='min-w-0 min-h-0 overflow-y-auto overflow-x-hidden'
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: 'easeIn' }}
                key='maillist'
              >
                <div className='grid auto-rows-auto gap-4 content-start p-1.5 pb-6'>
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
                    : mails.map((mail) => {
                        return (
                          <MailListItem
                            key={mail.mailboxId}
                            queryKey={memoizedQueryKey}
                            mail={mail}
                            isSelected={selectedIds.has(mail?.mailboxId)}
                            toggle={toggle}
                          />
                        )
                      })}
                  {isFetchingNextPage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      key='fetchingnextskeleton'
                    >
                      <MailListSkeleton />
                    </motion.div>
                  )}
                  {/* observer to fetch next pages */}
                  <div
                    ref={loadMoreRef}
                    className='w-full h-20 pointer-events-none select-none'
                  />
                </div>
              </motion.div>
            )}
            {/* Empty list */}
            {!isLoading && mails?.length === 0 && (
              <div className='absolute inset-0 flex items-center justify-center text-sm text-muted-foreground'>
                {emptyMessage}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div
          className={`lg:flex  min-w-0 w-full ${hasThreadOpen ? 'flex' : 'hidden'}`}
        >
          <Outlet />
        </div>
      </div>
      <ToastContainer
        containerId={'result'}
        position='bottom-right'
        toastClassName='pointer-events-auto !bg-background border border-border !text-foreground text-sm !rounded-lg !mb-[10px]'
        hideProgressBar={true}
        autoClose={3000}
      />
    </div>
  )
}

export default MailListLayout
