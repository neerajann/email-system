import { memo } from 'react'
import formatMailDate from '../../../utils/formatMailDate.js'
import { NavLink, useLocation } from 'react-router-dom'
import { IoStarOutline, IoStarSharp } from 'react-icons/io5'
import { useUI } from '../../../contexts/UIContext.jsx'
import useMailUpdate from '../../../hooks/mailbox/useMailUpdate.js'
import Tooltip from '../../ui/Tooltip.jsx'
import StarButton from '../../ui/buttons/StarButton.jsx'
import TrashButton from '../../ui/buttons/TrashButton.jsx'
import MarkAsButton from '../../ui/buttons/MarkAsButton.jsx'

const BaseMailListItem = memo((props) => {
  const {
    navigateTo,
    queryKey,
    isSelected,
    toggle,
    subject,
    snippet,
    children,
    mail,
  } = props
  const { showThread, setShowThread } = useUI()
  const mailUpdateMutation = useMailUpdate(queryKey)
  const location = useLocation()
  return (
    <NavLink
      to={navigateTo}
      className={({ isActive }) =>
        `h-25 flex flex-1 items-center border border-b bg-background group relative border-border hover:shadow-sm min-w-0 ${
          isActive && 'border-l-4'
        }`
      }
      state={{ from: location.pathname + location.search }}
      onClick={() => {
        if (window.innerWidth < 1024 && !showThread) {
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
      {/* checkbox element */}
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
            onChange={() => toggle(mail.mailboxId)}
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
        <div className=' flex items-center flex-1 min-w-0 w-0'>
          <Tooltip
            message={mail.isStarred ? 'Starred' : 'Not Starred'}
            parentClassName='mr-5 sm:mr-10 shrink-0 hidden sm:inline-block'
            tooltipClassName='!top-6'
          >
            {mail.isStarred ? <IoStarSharp /> : <IoStarOutline />}
          </Tooltip>
          {/* mail contents */}
          <div className='flex flex-col justify-between flex-1 min-w-0 w-0'>
            <div className='flex items-center gap-1 mb-1.5  min-w-0'>
              {/* mail from */}
              <h3
                className={`text-sm truncate ${!mail.isRead && 'font-semibold'}`}
              >
                {mail.from
                  .map((f) => {
                    return f.name ?? f.address
                  })
                  .join(', ')}
                {mail.messageCount > 1 && (
                  <span className='text-muted-foreground ml-2 text-xs'>
                    {mail.messageCount}
                  </span>
                )}
              </h3>
              {/* labels for search page */}
              {children}
            </div>
            {/* mail subject */}
            <h3
              className={`text-sm truncate  mb-1.5 ${
                !mail.isRead && 'font-semibold'
              }`}
            >
              {subject}
            </h3>
            {/* mail body */}
            <p className=' text-xs text-muted-foreground truncate'>{snippet}</p>
          </div>
        </div>

        <div className='flex shrink-0 items-center ml-2'>
          {/* action buttons  */}
          <div className='hidden group-hover:flex items-center pointer-events-none group-hover:pointer-events-auto '>
            {/* star mail button  */}
            <StarButton
              isDeleted={mail.isDeleted}
              isStarred={mail.isStarred}
              mailUpdateMutation={mailUpdateMutation}
              mailboxIds={[mail.mailboxId]}
            />

            {/* trash mail button  */}
            <TrashButton
              isDeleted={mail.isDeleted}
              mailUpdateMutation={mailUpdateMutation}
              mailboxIds={[mail.mailboxId]}
            />
            {/* mail read/unread button  */}
            <MarkAsButton
              mailboxIds={[mail.mailboxId]}
              mailUpdateMutation={mailUpdateMutation}
              isRead={mail.isRead}
            />
          </div>

          {/* date and time */}
          <div className='group-hover:hidden flex flex-col gap-3 items-end'>
            <p className={`text-xs ${!mail.isRead && 'font-semibold '}`}>
              {formatMailDate(mail.receivedAt)}
            </p>
            {/* star button for mobile devices */}
            <button
              className='sm:hidden p-3 '
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
          </div>
        </div>
      </div>
    </NavLink>
  )
})
export default BaseMailListItem
