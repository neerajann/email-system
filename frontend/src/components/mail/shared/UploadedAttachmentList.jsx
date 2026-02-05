import { RxCross2 } from 'react-icons/rx'
import { filesize } from 'filesize'
import Tooltip from '../../ui/Tooltip'

const UploadedAttachmentList = ({ attachment, remove }) => {
  if (attachment?.removed) {
    return
  }
  return (
    <div className='border bg-input border-border w-full flex items-center gap-x-4 justify-between text-sm font-normal p-2 rounded mb-3'>
      <div className='text-sm'>
        {attachment.fileName}
        <span className='ml-2 '>({filesize(attachment.size)})</span>
      </div>
      {attachment.progress != 100 && (
        <div className='flex-1 h-1.5 bg-muted rounded flex items-center'>
          <div
            className='h-full bg-foreground  rounded-sm transition-all'
            style={{ width: `${attachment.progress}%` }}
          />
        </div>
      )}
      <Tooltip message={'Remove attachment'}>
        <button
          className=' border border-border p-1 rounded cursor-pointer'
          onClick={() => remove(attachment.id)}
        >
          <RxCross2 size={15} />
        </button>
      </Tooltip>
    </div>
  )
}
export default UploadedAttachmentList
