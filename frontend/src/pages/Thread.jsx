import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

const Thread = () => {
  const { id } = useParams()
  const [threadData, setThreadData] = useState([])
  useEffect(() => {
    const fetchThread = async () => {
      const { data } = await api.get(`/mail/${id}`)
      console.log(data)
      setThreadData(data)
    }
    fetchThread()
  }, [])
  return (
    <div className='hidden lg:flex flex-1'>
      {threadData.map((thread) => {
        return (
          <div key={thread.mailId}>
            <h2>{thread.from.name}</h2>
            <h1>{thread.from.address}</h1>
            <div>
              {thread.to.map((to) => {
                return <h2>{`${to.address} ${to.name}`}</h2>
              })}
            </div>
            <h2>{thread.subject}</h2>
            <div dangerouslySetInnerHTML={{ __html: thread.body.html }} />
          </div>
        )
      })}
    </div>
  )
}
export default Thread
