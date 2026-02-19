import { MdOutlineFileDownload } from 'react-icons/md'
import { filesize } from 'filesize'
import Tooltip from '../../ui/Tooltip'

const ThreadAttachmentList = ({ mail }) => {
  return (
    <>
      {mail.attachments.length !== 0 && (
        <div className='text-sm mt-6 border-t border-border pt-4  '>
          <span className='text-sm font-semibold '>
            {mail.attachments.length} &nbsp;Attachment
            {mail.attachments.length < 1 ? 's' : ''}
          </span>
          <div className='flex gap-5 min-w-0 flex-wrap mt-4'>
            {mail.attachments.map((attachment) => {
              const viewUrl = `${import.meta.env.VITE_API_URL || '/api'}/mail/attachment/${attachment.id}?emailId=${mail.emailId}&q=view`
              const downloadUrl = `${import.meta.env.VITE_API_URL || '/api'}/mail/attachment/${attachment.id}?emailId=${mail.emailId}`
              return (
                <a
                  key={attachment.id}
                  href={viewUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='border border-border py-2 px-4 bg-input flex items-center gap-6 rounded max-w-sm min-w-0'
                >
                  <div className='flex items-center gap-1 min-w-0 flex-1'>
                    <span className='truncate block min-w-0'>
                      {attachment.fileName}
                    </span>
                    <span className='ml-1.5 shrink-0 text-xs text-muted-foreground'>
                      ({filesize(attachment.size)})
                    </span>
                  </div>
                  <Tooltip message={'Download attachment'}>
                    <button
                      type='button'
                      className='shrink-0 cursor-pointer'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(downloadUrl, '_self')
                      }}
                    >
                      <MdOutlineFileDownload size={18} />
                    </button>
                  </Tooltip>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default ThreadAttachmentList
