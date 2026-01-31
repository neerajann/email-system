import { MdRestoreFromTrash } from 'react-icons/md'
import Tooltip from '../Tooltip'

const RestoreButton = ({ mailUpdateMutation, options, mailboxIds }) => {
  return (
    <Tooltip message='Restore mail'>
      <button
        className=' border border-border p-2 rounded disabled:opacity-50 cursor-pointer hover:bg-input'
        onClick={() => {
          mailUpdateMutation.mutate({
            mailboxIds,
            data: { isDeleted: false },
          })
          options && options()
        }}
      >
        <MdRestoreFromTrash />
      </button>
    </Tooltip>
  )
}
export default RestoreButton
