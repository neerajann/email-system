import {
  MdOutlineMarkEmailUnread,
  MdOutlineMarkEmailRead,
  MdRestoreFromTrash,
} from 'react-icons/md'
import { IoStarOutline, IoTrashOutline, IoStarSharp } from 'react-icons/io5'

const ThreadActionButtons = ({
  email,
  patchMail,
  deleteForever,
  setShowThread,
  navigate,
}) => {
  console.log(email)

  return (
    <div className='flex gap-3'>
      {email.isDeleted ? (
        <>
          <button
            className='text-xs border rounded px-2 border-border hover:bg-input'
            onClick={() => deleteForever(email.mailboxId)}
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
                navigate('..', { relative: 'path' })
              }}
            />
          </button>
        </>
      ) : (
        <>
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
        </>
      )}
      <button
        className=' border border-border p-2 rounded mr-2 cursor-pointer hover:bg-input'
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
    </div>
  )
}
export default ThreadActionButtons
