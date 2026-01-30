import { memo } from 'react'
import formatMailDate from '../../utils/fomatMailDate'
import { NavLink } from 'react-router-dom'
import {
  MdOutlineMarkEmailUnread,
  MdOutlineMarkEmailRead,
} from 'react-icons/md'
import { IoStarOutline, IoStarSharp, IoTrashOutline } from 'react-icons/io5'
import { useUI } from '../../contexts/UIContext'
import highlightText from '../../utils/highlightText'
import useMailUpdate from '../../services/mailUpdateService'
import Tooltip from '../ui/Tooltip'

const SearchListItem = memo((props) => {
  const { mail, query, queryKey, isSelected, toggleSelection } = props
  const { setShowThread } = useUI()

  const mailUpdateMutation = useMailUpdate(queryKey)
  return (
    <NavLink
      to={`/search/${mail.mailboxId}?q=${query}`}
      className={({ isActive }) =>
        `h-25 flex flex-1 items-center border border-b bg-background group relative border-border hover:shadow-sm min-w-0 ${
          isActive && 'border-l-4'
        }`
      }
      onClick={(e) => {
        if (window.innerWidth < 1024) {
          setShowThread(true)
        }
        if (!mail.isRead) {
          mailUpdateMutation.mutate({
            mailboxIds: [mail.mailboxId],
            data: {
              isRead: true,
            },
          })
        }
      }}
    >
      <Tooltip
        message={isSelected ? 'Selected' : 'Not Selected'}
        parentClassName='ml-4 sm:ml-8 '
      >
        <label className='relative flex items-center cursor-pointer p-2'>
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
      </Tooltip>
      <div className=' flex items-center flex-1 px-4 sm:px-8 min-w-0 w-full'>
        {/* mail content */}
        <div className=' flex items-center flex-1 min-w-0 w-0'>
          <Tooltip
            message={mail.isStarred ? 'Starred' : 'Not Starred'}
            parentClassName='mr-5 sm:mr-10 shrink-0 hidden sm:inline-block'
            tooltipClassName='!top-6'
          >
            {mail.isStarred ? <IoStarSharp /> : <IoStarOutline />}
          </Tooltip>
          <div className='flex flex-col justify-between flex-1 min-w-0 w-0'>
            <div className='flex items-center gap-1 mb-1.5  min-w-0'>
              <h3
                className={`text-sm truncate text-foreground ${
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

              <div className='ml-2 flex gap-1.5'>
                {mail.isDeleted ? (
                  <span className='border border-border px-2 py-0.5 rounded-xl text-xs'>
                    Trash
                  </span>
                ) : (
                  mail.labels.map((label) => (
                    <span className='border border-border px-2 py-0.5 rounded-xl text-xs'>
                      {label.charAt(0).toUpperCase() +
                        label.slice(1).toLowerCase()}
                    </span>
                  ))
                )}
              </div>
            </div>
            <h3
              className={`text-sm truncate  mb-1.5 ${
                !mail.isRead && 'font-semibold'
              }`}
            >
              {highlightText(mail.subject, query)}
            </h3>
            <p className=' text-xs text-muted-foreground truncate '>
              {highlightText(mail.body, query)}
            </p>
          </div>
        </div>
        {/* buttons and time */}
        <div className='flex shrink-0 items-center ml-2'>
          {/* action buttons  */}
          <div className='hidden group-hover:flex items-center pointer-events-none group-hover:pointer-events-auto '>
            {/* star mail button  */}
            <Tooltip
              message={
                mail.isDeleted ? '' : mail.isStarred ? 'Starred' : 'Not starred'
              }
            >
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
            </Tooltip>
            {/* trash mail button  */}
            <Tooltip message={!mail.isDeleted && 'Delete'}>
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
            </Tooltip>
            {/* mail read/unread button  */}
            <Tooltip message={mail.isRead ? 'Mark as unread' : 'Mark as read'}>
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
            </Tooltip>
          </div>

          {/* date and time */}
          <div className='group-hover:hidden flex flex-col gap-3 items-end'>
            <p className={`text-xs ${!mail.isRead && 'font-semibold '}`}>
              {formatMailDate(mail.receivedAt)}
            </p>

            <div className='sm:hidden'>
              {mail.isStarred ? <IoStarSharp /> : <IoStarOutline />}
            </div>
          </div>
        </div>
      </div>
    </NavLink>
  )
})
export default SearchListItem
