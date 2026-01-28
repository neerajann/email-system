import { memo } from 'react'
import formatMailDate from '../../utils/fomatMailDate'
import { NavLink } from 'react-router-dom'
import {
  MdOutlineMarkEmailUnread,
  MdOutlineMarkEmailRead,
} from 'react-icons/md'
import { IoStarOutline, IoStarSharp, IoTrashOutline } from 'react-icons/io5'
import { useUI } from '../../contexts/UIContext'
import useMailUpdate from '../../services/mailUpdateService'

const MailListItem = memo((props) => {
  const { mail, queryKey, isSelected, toggleSelection } = props

  const { setShowThread } = useUI()

  const mailUpdateMutation = useMailUpdate(queryKey)

  return (
    <NavLink
      to={mail.mailboxId}
      className={({ isActive }) =>
        `flex flex-1 items-center border border-b bg-background group relative border-border hover:shadow-sm min-w-0 ${
          isActive && 'border-l-4'
        }`
      }
      onClick={(e) => {
        if (window.innerWidth < 1024) {
          setShowThread(true)
        }
        mailUpdateMutation.mutate({
          mailboxIds: [mail.mailboxId],
          data: {
            isRead: true,
          },
        })
      }}
    >
      <label className='relative flex items-center ml-4 sm:ml-8 cursor-pointer p-2'>
        <input
          type='checkbox'
          className='peer absolute opacity-0 h-8 w-8 cursor-pointer py-8 -left-0.5'
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleSelection(mail.mailboxId)}
        />

        <div className='h-4 w-4 border border-border rounded bg-background peer-checked:bg-foreground peer-checked:border-foreground transition-colors pointer-events-none' />

        <svg
          className='absolute h-4 w-4 text-background opacity-0 peer-checked:opacity-100 pointer-events-none'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
        >
          <path d='M5 13l4 4L19 7' />
        </svg>
      </label>
      <div className=' flex items-center flex-1 px-4 sm:px-8  min-w-0 w-full'>
        {/* mail content */}
        <div className='flex items-center flex-1 min-w-0 w-0'>
          <div className='mr-5 sm:mr-10 shrink-0'>
            {mail.isStarred ? <IoStarSharp /> : <IoStarOutline />}
          </div>
          <div className='flex flex-col justify-between flex-1 min-w-0 w-0'>
            <h3
              className={`text-sm truncate text-foreground mb-1.5 ${
                !mail.isRead && 'font-semibold'
              }`}
            >
              {mail.from.name ?? mail.from.address}
              {mail.messageCount > 1 && (
                <span
                  className={`text-muted-foreground ml-2 ${!mail.isRead && 'font-semibold'}`}
                >
                  {mail.messageCount}
                </span>
              )}
            </h3>
            <h3
              className={`text-sm truncate  mb-1.5 ${
                !mail.isRead && 'font-semibold'
              }`}
            >
              {mail.subject}
            </h3>
            <p className=' text-xs text-muted-foreground truncate '>
              {mail.snippet}
            </p>
          </div>
        </div>
        {/* buttons and time */}
        <div className='flex shrink-0 items-center ml-2'>
          {/* action buttons  */}
          <div className='hidden group-hover:flex items-center pointer-events-none group-hover:pointer-events-auto '>
            {/* star mail button  */}
            <button
              className=' border border-border p-2 rounded mr-2 disabled:opacity-50 cursor-pointer '
              disabled={mail.isDeleted}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                mailUpdateMutation.mutate({
                  mailboxIds: [mail.mailboxId],
                  data: {
                    isStarred: !mail.isStarred,
                  },
                })
              }}
            >
              {mail.isStarred ? <IoStarSharp /> : <IoStarOutline />}
            </button>
            {/* trash mail button  */}
            <button
              disabled={mail.isDeleted}
              className='border border-border p-2 rounded mr-2 disabled:opacity-50 cursor-pointer'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                mailUpdateMutation.mutate({
                  mailboxIds: [mail.mailboxId],
                  data: {
                    isDeleted: true,
                  },
                })
              }}
            >
              <IoTrashOutline />
            </button>
            {/* mail read/unread button  */}
            <button
              className=' border border-border p-2 rounded mr-2 cursor-pointer'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                mailUpdateMutation.mutate({
                  mailboxIds: [mail.mailboxId],
                  data: {
                    isRead: !mail.isRead,
                  },
                })
              }}
            >
              {mail.isRead ? (
                <MdOutlineMarkEmailUnread />
              ) : (
                <MdOutlineMarkEmailRead />
              )}
            </button>
          </div>

          {/* date and time */}
          <div className='group-hover:hidden'>
            <p className={`text-xs ml-3 ${!mail.isRead && 'font-semibold'} `}>
              {formatMailDate(mail.receivedAt)}
            </p>
          </div>
        </div>
      </div>
    </NavLink>
  )
})
export default MailListItem
