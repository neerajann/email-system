import {
  MdOutlineMarkEmailUnread,
  MdOutlineMarkEmailRead,
  MdRestoreFromTrash,
} from 'react-icons/md'
import { IoStarOutline, IoTrashOutline, IoStarSharp } from 'react-icons/io5'
import Tooltip from '../ui/Tooltip'

const ThreadActionButtons = ({
  email,
  patchMail,
  setShowConfirmationModal,
  setShowThread,
  navigate,
}) => {
  return (
    <div className='flex gap-3'>
      {email.isDeleted ? (
        <>
          <button
            className='text-xs border rounded px-2 border-border hover:bg-input cursor-pointer'
            onClick={() => setShowConfirmationModal(true)}
          >
            Delete forever
          </button>

          <Tooltip message='Restore'>
            <button className=' border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'>
              <MdRestoreFromTrash
                onClick={(e) => {
                  patchMail(e, {
                    isDeleted: false,
                  })
                  setShowThread(false)
                  navigate('..', { relative: 'path' })
                }}
              />
            </button>
          </Tooltip>
        </>
      ) : (
        <>
          <Tooltip message={!email.isDeleted && 'Delete'}>
            <button
              disabled={email.isDeleted}
              className='border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'
              onClick={(e) => {
                patchMail(e, {
                  isDeleted: true,
                })
                setShowThread(false)
                navigate('..', { relative: 'path' })
              }}
            >
              <IoTrashOutline />
            </button>
          </Tooltip>
          <Tooltip message={email.isStarred ? 'Starred' : 'Not starred'}>
            <button
              className=' border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'
              disabled={email.isDeleted}
              onClick={(e) =>
                patchMail(e, {
                  isStarred: !email.isStarred,
                })
              }
            >
              {email.isStarred ? <IoStarSharp /> : <IoStarOutline />}
            </button>
          </Tooltip>
        </>
      )}
      <Tooltip
        message={email.isRead ? 'Mark as unread' : 'Mark as read'}
        tooltipClassName='hidden sm:block -left-2!'
      >
        <button
          className=' border border-border p-2 rounded cursor-pointer hover:bg-input'
          onClick={(e) =>
            patchMail(e, {
              isRead: !email.isRead,
            })
          }
        >
          {email.isRead ? (
            <MdOutlineMarkEmailUnread />
          ) : (
            <MdOutlineMarkEmailRead />
          )}
        </button>
      </Tooltip>
    </div>
  )
}
export default ThreadActionButtons
