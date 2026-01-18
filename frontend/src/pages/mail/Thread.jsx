import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import ThreadItem from '../../components/mail/ThreadItem'
const Thread = () => {
  const { id } = useParams()
  const [threadData, setThreadData] = useState([])
  const [showHidden, setShowHidden] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchThread = async () => {
      const { data } = await api.get(`/mail/${id}`)
      setThreadData(data)
    }
    fetchThread()
  }, [id])

  console.log(threadData)

  let hiddenCount = 0
  let latestMessages = []
  if (!threadData.length) return null

  const oldMessage = threadData.slice(0, 1)
  if (threadData.length > 3) {
    hiddenCount = Math.max(0, threadData.length - 3)
    latestMessages = threadData.slice(threadData.length - 2, threadData.length)
  }
  return (
    <div className=' h-dvh hidden lg:flex flex-1 min-w-0 max-w-full p-7 flex-col overflow-auto pb-30'>
      <div className='mb-8'>
        <h2 className='text-xl font-semibold'>{threadData[0]?.subject}</h2>
      </div>

      <div className='grid gap-3.5'>
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
              <span className='px-2 hover:text-foreground'>
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

        {(showHidden || hiddenCount < 0) &&
          threadData.map((thread, index) => (
            <ThreadItem
              key={thread.mailId}
              thread={thread}
              defaultExpanded={index === threadData.length - 1}
            />
          ))}
      </div>
    </div>
  )
}

export default Thread
