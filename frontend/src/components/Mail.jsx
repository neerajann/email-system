import { memo } from 'react'
import formatMailDate from '../utils/fomatMailDate'
import { Link } from 'react-router-dom'
import { IoStarOutline, IoStarSharp } from 'react-icons/io5'
const Mail = memo((props) => {
  const mail = props.data

  return (
    <Link
      to={mail.threadId}
      className='flex border border-border py-4 flex-1   justify-center items-center bg-background mb-2'
    >
      <div className=' flex  items-center  flex-1 px-10   justify-between'>
        <div className='flex items-center'>
          <div className='mr-10'>
            {mail.starred ? <IoStarSharp /> : <IoStarOutline />}
          </div>
          <div className='flex flex-col justify-between'>
            <h3 className='font-medium text-sm truncate text-foreground mb-1'>
              {mail.from.name ?? mail.from.address}
            </h3>
            <h3 className='text-sm truncate text-muted-foreground mb-1'>
              {mail.subject}
            </h3>
            <p className=' text-xs text-muted-foreground line-clamp-1 '>
              {mail.snippet}
            </p>
          </div>
        </div>
        <div>
          <p className='text-xs'>{formatMailDate(mail.receivedAt)}</p>
        </div>
      </div>
    </Link>
  )
})
export default Mail
