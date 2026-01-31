import { MdOutlineFileDownload } from 'react-icons/md'

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
              return (
                <div
                  key={attachment.id}
                  className=' border border-border py-2 px-4 bg-input  flex items-center gap-6 rounded w-fit min-w-0'
                >
                  <span className='truncate'>{attachment.fileName}</span>
                  <a
                    href={`${import.meta.env.VITE_API_URL}/mail/attachment/${attachment.id}?emailId=${mail.emailId}`}
                  >
                    <MdOutlineFileDownload size={18} />
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default ThreadAttachmentList
