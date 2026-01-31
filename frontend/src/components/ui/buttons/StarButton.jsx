import Tooltip from '../Tooltip'
import { IoStarSharp, IoStarOutline } from 'react-icons/io5'

const StarButton = ({
  isDeleted,
  isStarred,
  mailboxId,
  mailUpdateMutation,
}) => {
  return (
    <Tooltip message={isDeleted ? '' : isStarred ? 'Starred' : 'Not starred'}>
      <button
        className=' border border-border p-2 rounded mr-2 disabled:opacity-50 cursor-pointer '
        disabled={isDeleted}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          mailUpdateMutation.mutate({
            mailboxIds: [mailboxId],
            data: {
              isStarred: !isStarred,
            },
          })
        }}
      >
        {isStarred ? <IoStarSharp /> : <IoStarOutline />}
      </button>
    </Tooltip>
  )
}
export default StarButton
