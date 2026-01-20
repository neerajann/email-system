import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { useUI } from '../../contexts/UIContext'
import api from '../../services/api'
import ActionButtons from '../../components/thread/ActionButtons'
import ThreadItem from '../../components/thread/ThreadItem'

const Thread = () => {
  const { showThread, setShowThread } = useUI()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showHidden, setShowHidden] = useState(false)

  const { data: threadData = [], isError } = useQuery({
    queryKey: ['thread', id],
    queryFn: async () => {
      const { data } = await api.get(`/mail/${id}`)
      return data
    },

    enabled: !!id,
    retry: 1,
  })

  useEffect(() => {
    if (isError) {
      navigate('..', { replace: true })
    }
  }, [isError, navigate])

  const patchMailMutation = useMutation({
    mutationFn: async ({ threadId, data }) => {
      await api.patch(`/mail/${threadId}`, data)
    },
    onMutate: async ({ data }) => {
      await queryClient.cancelQueries(['thread', id])
      const previous = queryClient.getQueryData(['thread', id])

      queryClient.setQueryData(['thread', id], (old) =>
        old.map((mail) => (mail.threadId === id ? { ...mail, ...data } : mail)),
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['thread', id], ctx.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries(['thread', id])
      queryClient.invalidateQueries(['mail'])
    },
  })

  const patchMail = (e, data) => {
    e.preventDefault()
    e.stopPropagation()
    patchMailMutation.mutate({
      threadId: threadData[0].threadId,
      data,
    })
  }

  const deleteForever = async (id) => {
    const result = confirm('Are you sure you want to deleted?')
    if (!result) return
    await api.delete(`/mail/${id}`)
    queryClient.invalidateQueries(['mail', 'trash'])
    setShowThread(false)
    navigate(-1)
  }

  let hiddenCount = 0
  let latestMessages = []
  let oldMessage = []
  if (!threadData.length) return null

  if (threadData.length > 3) {
    oldMessage = threadData.slice(0, 1)
    hiddenCount = Math.max(0, threadData.length - 3)
    latestMessages = threadData.slice(threadData.length - 2, threadData.length)
  }

  return (
    <div className='h-dvh w-full lg:w-auto flex flex-1 min-w-0 sm:p-7 p-2.5  flex-col overflow-y-auto pb-30'>
      <div
        className={`${showThread ? 'flex lg:hidden' : 'hidden'} items-center justify-between mb-7 mt-2`}
      >
        <div
          className='text-sm flex items-center gap-2 border w-fit px-3 py-1.5 rounded border-border cursor-pointer hover:bg-input'
          onClick={() => setShowThread(false)}
        >
          <FaArrowLeftLong />
          Back
        </div>
        <ActionButtons
          thread={threadData[0]}
          patchMail={patchMail}
          deleteForever={deleteForever}
          setShowThread={setShowThread}
          navigate={navigate}
        />
      </div>

      <div className='mb-8 w-full'>
        <div
          className={`${showThread ? 'hidden lg:flex' : 'flex'} shrink-0 gap-3 ml-1 float-right`}
        >
          <ActionButtons
            thread={threadData[0]}
            patchMail={patchMail}
            deleteForever={deleteForever}
            setShowThread={setShowThread}
            navigate={navigate}
          />
        </div>

        <h2 className='text-xl font-semibold'>{threadData[0]?.subject}</h2>
      </div>

      <div className='grid gap-5 min-w-0 *:min-w-0 mb-8'>
        {!showHidden && hiddenCount > 0 && (
          <>
            {oldMessage.map((o) => {
              return (
                <ThreadItem key={o.mailId} thread={o} defaultExpanded={false} />
              )
            })}
            <div
              className='flex items-center text-sm text-muted-foreground cursor-pointer my-2'
              onClick={() => setShowHidden(true)}
            >
              <div className='grow border-t border-border' />
              <span className='px-2 hover:text-foreground text-xs'>
                Show {hiddenCount} more message{hiddenCount > 1 ? 's' : ''}
              </span>
              <div className='grow border-t border-border' />
            </div>
            {latestMessages.map((latest, index) => {
              return (
                <ThreadItem
                  key={latest.mailId}
                  thread={latest}
                  defaultExpanded={index === latest.length - 1}
                />
              )
            })}
          </>
        )}

        {(showHidden || hiddenCount === 0) &&
          threadData.map((thread, index) => {
            return (
              <ThreadItem
                key={thread.mailId}
                thread={thread}
                defaultExpanded={index === threadData.length - 1}
              />
            )
          })}
      </div>
    </div>
  )
}

export default Thread
