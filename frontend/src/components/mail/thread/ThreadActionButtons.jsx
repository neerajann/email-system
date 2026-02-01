import {
  MdRestoreFromTrash,
  MdOutlineMarkEmailRead,
  MdOutlineMarkEmailUnread,
} from 'react-icons/md'
import { IoStarOutline, IoTrashOutline, IoStarSharp } from 'react-icons/io5'
import Tooltip from '../../ui/Tooltip'

const ThreadActionButtons = ({ mail, patchMail, setShowConfirmationModal }) => {
  if (!mail) return
  return (
    <div className='flex gap-3'>
      {mail.isDeleted ? (
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
                }}
              />
            </button>
          </Tooltip>
        </>
      ) : (
        <>
          <Tooltip message={!mail?.isDeleted && 'Delete'}>
            <button
              disabled={mail?.isDeleted}
              className='border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'
              onClick={(e) => {
                patchMail(e, {
                  isDeleted: true,
                })
              }}
            >
              <IoTrashOutline />
            </button>
          </Tooltip>

          <Tooltip message={mail.isStarred ? 'Starred' : 'Not starred'}>
            <button
              className=' border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'
              disabled={mail.isDeleted}
              onClick={(e) =>
                patchMail(e, {
                  isStarred: !mail.isStarred,
                })
              }
            >
              {mail.isStarred ? <IoStarSharp /> : <IoStarOutline />}
            </button>
          </Tooltip>
        </>
      )}
      <Tooltip
        message={mail.isRead ? 'Mark as unread' : 'Mark as read'}
        tooltipClassName='hidden sm:block -left-2!'
      >
        <button
          className=' border border-border p-2 rounded cursor-pointer hover:bg-input'
          onClick={(e) =>
            patchMail(e, {
              isRead: !mail.isRead,
            })
          }
        >
          {mail.isRead ? (
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
