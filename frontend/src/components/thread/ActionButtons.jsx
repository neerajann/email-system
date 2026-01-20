import {
  MdOutlineMarkEmailUnread,
  MdOutlineMarkEmailRead,
  MdRestoreFromTrash,
} from 'react-icons/md'
import { IoStarOutline, IoTrashOutline, IoStarSharp } from 'react-icons/io5'

const ActionButtons = ({
  thread,
  patchMail,
  deleteForever,
  setShowThread,
  navigate,
}) => {
  return (
    <div className='flex gap-3'>
      {thread.isDeleted ? (
        <>
          <button
            className='text-xs border rounded px-2 border-border hover:bg-input'
            onClick={() => deleteForever(thread.threadId)}
          >
            Delete forever
          </button>
          <button className=' border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'>
            <MdRestoreFromTrash
              onClick={(e) => {
                patchMail(e, {
                  isDeleted: false,
                })
                setShowThread(false)
                navigate(-1)
              }}
            />
          </button>
        </>
      ) : (
        <>
          <button
            disabled={thread.isDeleted}
            className='border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'
            onClick={(e) => {
              patchMail(e, {
                isDeleted: true,
              })
              setShowThread(false)
              navigate(-1)
            }}
          >
            <IoTrashOutline />
          </button>
          <button
            className=' border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'
            disabled={thread.isDeleted}
            onClick={(e) =>
              patchMail(e, {
                isStarred: !thread.isStarred,
              })
            }
          >
            {thread.isStarred ? <IoStarSharp /> : <IoStarOutline />}
          </button>
        </>
      )}
      <button
        className=' border border-border p-2 rounded mr-2 cursor-pointer hover:bg-input'
        onClick={(e) =>
          patchMail(e, {
            isRead: !thread.isRead,
          })
        }
      >
        {thread.isRead ? (
          <MdOutlineMarkEmailUnread />
        ) : (
          <MdOutlineMarkEmailRead />
        )}
      </button>
    </div>
  )
}
export default ActionButtons
