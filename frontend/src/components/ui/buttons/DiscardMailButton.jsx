import Tooltip from '../Tooltip'
import { IoTrashOutline } from 'react-icons/io5'
const DiscardMailButton = ({ onClick }) => {
  return (
    <Tooltip message='Discard mail'>
      <button
        variant='outline'
        className='hover:scale-[0.95] active:scale-[1.02] cursor-pointer hover:bg-input px-2.5 py-1.5 rounded hover:text-red-500'
        onClick={onClick}
      >
        <IoTrashOutline size={16} />
      </button>
    </Tooltip>
  )
}
export default DiscardMailButton
