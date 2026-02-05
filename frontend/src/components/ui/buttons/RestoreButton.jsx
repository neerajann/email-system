import { MdRestoreFromTrash } from 'react-icons/md'
import Tooltip from '../Tooltip'
import { useNavigate } from 'react-router-dom'

const RestoreButton = ({
  mailUpdateMutation,
  options,
  mailboxIds,
  hasThreadOpen,
}) => {
  const navigate = useNavigate()
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
          if (hasThreadOpen) {
            navigate('..', { relative: 'path' })
          }
        }}
      >
        <MdRestoreFromTrash />
      </button>
    </Tooltip>
  )
}
export default RestoreButton
