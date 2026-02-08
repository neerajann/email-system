import Tooltip from '../Tooltip'
import { RiAttachment2 } from 'react-icons/ri'

const UploadAttachmentButton = ({ onClick }) => {
  return (
    <Tooltip message={'Upload attachment'}>
      <button
        type='button'
        onClick={onClick}
        className='hover:scale-[0.95] active:scale-[1.02] cursor-pointer hover:bg-input px-2.5 py-1.5 rounded'
      >
        <RiAttachment2 size={16} />
      </button>
    </Tooltip>
  )
}
export default UploadAttachmentButton
