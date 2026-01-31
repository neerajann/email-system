import Tooltip from '../Tooltip'
import {
  MdOutlineMarkEmailRead,
  MdOutlineMarkEmailUnread,
} from 'react-icons/md'

const MarkAsButton = ({ mailboxIds, isRead, mailUpdateMutation, options }) => {
  return (
    <Tooltip message={isRead ? 'Mark as unread' : 'Mark as read'}>
      <button
        className=' border border-border p-2 rounded mr-2 cursor-pointer'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          mailUpdateMutation.mutate({
            mailboxIds,
            data: {
              isRead: !isRead,
            },
          })
          options && options()
        }}
      >
        {isRead ? <MdOutlineMarkEmailUnread /> : <MdOutlineMarkEmailRead />}
      </button>
    </Tooltip>
  )
}
export default MarkAsButton
