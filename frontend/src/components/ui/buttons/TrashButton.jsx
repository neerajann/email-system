import Tooltip from '../Tooltip'
import { IoTrashOutline } from 'react-icons/io5'

const TrashButton = ({
  isDeleted,
  mailboxIds,
  mailUpdateMutation,
  options,
}) => {
  return (
    <Tooltip message={!isDeleted && 'Delete'}>
      <button
        disabled={isDeleted}
        className='border border-border p-2 rounded mr-2 disabled:opacity-50 cursor-pointer'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          mailUpdateMutation.mutate({
            mailboxIds,
            data: {
              isDeleted: true,
            },
          })
          options && options()
        }}
      >
        <IoTrashOutline />
      </button>
    </Tooltip>
  )
}
export default TrashButton
