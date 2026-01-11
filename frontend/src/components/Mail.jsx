import { memo } from 'react'
import formatMailDate from '../utils/fomatMailDate'
import { Link } from 'react-router-dom'

const Mail = memo((props) => {
  const mail = props.data
  return (
    <Link
      to={mail.threadId}
      className='flex border flex-1 rounded  px-5 py-3 mr-5 justify-center items-center bg-white'
    >
      <img
        className='size-12 rounded-full'
        src='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
      />
      <div className=' flex flex-col ml-4  flex-1'>
        <div className='flex  items-center justify-between'>
          <h3 className=' font-medium text-lg'>
            {mail.from.name ?? mail.from.address}
          </h3>
          <p>{formatMailDate(mail.receivedAt)}</p>
        </div>
        <div>
          <h3>{mail.subject}</h3>
          <p>{mail.snippet}</p>
        </div>
      </div>
    </Link>
  )
})
export default Mail
