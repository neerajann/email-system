import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import MailListItem from '../components/mail/MailListItem'
import { useUI } from '../contexts/UIContext'
import { IoMdRefresh } from 'react-icons/io'
import {
  MdOutlineMarkEmailUnread,
  MdOutlineMarkEmailRead,
  MdRestoreFromTrash,
} from 'react-icons/md'
import { IoTrashOutline } from 'react-icons/io5'
import useMailUpdate from '../services/mailUpdateService'
import SearchListItem from '../components/mail/SearchListItem'
import Tooltip from '../components/ui/Tooltip'

const didMount = { current: false }

const MailListLayout = ({ mailboxType, queryKey, fetchFuction, query }) => {
  const loadMoreRef = useRef(null)
  const { showThread, setUnreadCount } = useUI()
  const queryClient = useQueryClient()
  const memoizedQueryKey = useMemo(() => queryKey, [queryKey])

  const patchMailMutation = useMailUpdate(memoizedQueryKey, {
    isInfiniteQuery: true,
  })

  const [selectionState, setSelectionState] = useState({
    isBulkMode: false,
    selectedMailboxIds: new Set([]),
  })

  const {
    data = [],
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: fetchFuction,
    staleTime: 5 * 60 * 1000,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const mails = data?.pages?.flatMap((page) => page.mails) ?? []

  useEffect(() => {
    var toastId

    if (isLoading) {
      toastId = toast.loading('Loading...', {
        containerId: 'loading',
      })
    }

    if (isError) {
      toast.dismiss()
      toast.error(error.message || 'Something went wrong', {
        containerId: 'loading',
      })
    }

    if (!isLoading && !isError) {
      toast.dismiss()
    }

    return () => toast.dismiss()
  }, [isLoading, isError])

  useEffect(() => {
    if (mailboxType !== 'inbox') return
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
  }, [mailboxType])

  useEffect(() => {
    if (mailboxType !== 'inbox') return

    const unreadCount = data?.mails?.filter((m) => !m.isRead)?.length
    setUnreadCount(unreadCount)
  }, [data, mailboxType])

  useEffect(() => {
    if (!loadMoreRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        rootMargin: '200px',
      },
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const handleNewMail = (newMail) => {
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData.pages) return oldData

      const updatedPages = oldData.pages.map((page, index) => {
        const filtered = page.mails.filter(
          (mail) => mail.mailboxId !== newMail.mailboxId,
        )
        if (index === 0) {
          return { ...page, mails: [newMail, ...filtered] }
        }
        return { ...page, mails: filtered }
      })
      return { ...oldData, pages: updatedPages }
    })
    queryClient.invalidateQueries({ queryKey: queryKey })
  }

  const toggleSelection = useCallback((mailboxId) => {
    setSelectionState((prev) => {
      const next = new Set(prev.selectedMailboxIds)
      next.has(mailboxId) ? next.delete(mailboxId) : next.add(mailboxId)
      const isBulkMode = next.size > 0
      return { isBulkMode, selectedMailboxIds: next }
    })
  }, [])

  return (
    <div className='w-full h-full overflow-hidden min-w-0 text-sm relative'>
      <div className='grid lg:grid-cols-2 overflow-hidden  grid-cols-1 h-full min-w-0 '>
        <div
          className={` overflow-hidden border-x border-border relative ${showThread ? 'hidden lg:flex' : 'flex'}  min-w-0 flex-col`}
        >
          <div className='flex flex-col shadow-xs mb-3 border-b border-border bg-background relative z-[40]'>
            <div className='flex items-center justify-between text-sm  px-4 py-2 shadow-xs bg-background relative'>
              <Tooltip
                message='Refresh'
                parentClassName='ml-3 sm:ml-6'
                tooltipClassName='top-6!'
              >
                <button onClick={() => refetch()}>
                  <IoMdRefresh size={20} className='cursor-pointer' />
                </button>
              </Tooltip>

              {selectionState.isBulkMode ? (
                <div className='flex items-center gap-2 '>
                  <span className='text-xs font-normal mr-4'>
                    {selectionState.selectedMailboxIds.size} selected
                  </span>
                  {/* trash mail button  */}
                  {mailboxType === 'trash' ? (
                    <Tooltip message=''>
                      <button
                        className=' border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'
                        onClick={() => {
                          patchMailMutation.mutate({
                            mailboxIds: Array.from(
                              selectionState.selectedMailboxIds,
                            ),
                            data: { isDeleted: false },
                          })
                          setSelectionState(() => ({
                            isBulkMode: false,
                            selectedMailboxIds: new Set([]),
                          }))
                        }}
                      >
                        <MdRestoreFromTrash />
                      </button>
                    </Tooltip>
                  ) : (
                    <Tooltip message='Delete'>
                      <button
                        className='border border-border p-2 rounded disabled:opacity-50 cursor-pointer'
                        onClick={() => {
                          patchMailMutation.mutate({
                            mailboxIds: Array.from(
                              selectionState.selectedMailboxIds,
                            ),
                            data: { isDeleted: true },
                          })
                          setSelectionState((prev) => ({
                            isBulkMode: false,
                            selectedMailboxIds: new Set([]),
                          }))
                        }}
                      >
                        <IoTrashOutline />
                      </button>
                    </Tooltip>
                  )}
                  {/* mail read/unread button  */}
                  {mails.some(
                    (mail) =>
                      selectionState.selectedMailboxIds.has(mail.mailboxId) &&
                      !mail.isRead,
                  ) ? (
                    <Tooltip message='Mark as read'>
                      <button
                        className=' border border-border p-2 rounded cursor-pointer'
                        onClick={() => {
                          patchMailMutation.mutate({
                            mailboxIds: Array.from(
                              selectionState.selectedMailboxIds,
                            ),
                            data: { isRead: true },
                          })
                          setSelectionState((prev) => ({
                            isBulkMode: false,
                            selectedMailboxIds: new Set([]),
                          }))
                        }}
                      >
                        <MdOutlineMarkEmailRead />
                      </button>
                    </Tooltip>
                  ) : (
                    <Tooltip message='Mark as unread'>
                      <button
                        className=' border border-border p-2 rounded cursor-pointer'
                        onClick={() => {
                          patchMailMutation.mutate({
                            mailboxIds: Array.from(
                              selectionState.selectedMailboxIds,
                            ),
                            data: { isRead: false },
                          })
                          setSelectionState((prev) => ({
                            isBulkMode: false,
                            selectedMailboxIds: new Set([]),
                          }))
                        }}
                      >
                        <MdOutlineMarkEmailUnread />
                      </button>
                    </Tooltip>
                  )}

                  <button
                    className=' bg-background border border-border px-4 py-2 rounded font-normal cursor-pointer'
                    onClick={() =>
                      setSelectionState(() => {
                        return {
                          isBulkMode: false,
                          selectedMailboxIds: new Set([]),
                        }
                      })
                    }
                  >
                    Unselect all
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    className=' bg-background border border-border px-4 py-2 rounded font-normal cursor-pointer'
                    onClick={() =>
                      setSelectionState(() => {
                        const allMailboxIds = new Set(
                          mails.map((d) => d.mailboxId),
                        )
                        return {
                          isBulkMode: true,
                          selectedMailboxIds: allMailboxIds,
                        }
                      })
                    }
                  >
                    Select all
                  </button>
                </div>
              )}
            </div>
          </div>

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
                      isSelected={selectionState.selectedMailboxIds.has(
                        mail?.mailboxId,
                      )}
                      toggleSelection={toggleSelection}
                    />
                  ))
                : mails.map((mail) => (
                    <MailListItem
                      key={mail.mailboxId}
                      queryKey={memoizedQueryKey}
                      mail={mail}
                      isSelected={selectionState.selectedMailboxIds.has(
                        mail?.mailboxId,
                      )}
                      toggleSelection={toggleSelection}
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
