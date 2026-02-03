import { RiAttachment2 } from 'react-icons/ri'
import { IoTrashOutline } from 'react-icons/io5'
import { useQueryClient } from '@tanstack/react-query'
import useAttachments from '../../../hooks/mail/shared/useAttachments.js'
import useReplyActions from '../../../hooks/mail/reply/useReplyActions.js'
import useReplyRecipients from '../../../hooks/mail/reply/useReplyRecipients.js'
import UploadedAttachmentList from '../shared/UploadedAttachmentList.jsx'
import useDraft from '../../../hooks/mail/shared/useDraft.js'

const Reply = ({ mail, showReply, setShowReply }) => {
  const queryClient = useQueryClient()

  if (!mail) return

  const {
    email: reply,
    recipients,
    setRecipients,
  } = useDraft({
    subject: mail.subject,
  })

  const {
    attachmentsInfo,
    fileInputRef,
    uploadErrorRef,
    controllersRef,
    onFiles,
    remove,
  } = useAttachments({ email: reply })

  const { send, cancel } = useReplyActions({
    attachmentsInfo,
    uploadErrorRef,
    setShowReply,
    queryClient,
    controllersRef,
    mailboxId: mail.mailboxId,
    emailId: mail.emailId,
    reply: { ...reply, recipients },
  })

  useReplyRecipients({ showReply, mail, setRecipients })

  return (
    <div
      className='border border-border rounded-xl p-6 '
      onDragOver={(e) => e.preventDefault()}
      onDrop={onFiles}
    >
      <div className='text-sm font-semibold mb-5'>
        {showReply.reply ? 'Reply' : 'Reply All'}
      </div>
      <div className='space-y-6'>
        {/* recipents  */}
        <div
          tabIndex={0}
          className='relative w-full flex flex-wrap bg-input text-foreground border gap-y-1.5 gap-x-1 border-border rounded-md items-center p-2 pl-3 text-sm shadow-xs '
        >
          {recipients?.map((r) => {
            return (
              <span
                className=' border border-border  rounded p-1  flex items-center justify-center'
                key={r}
              >
                {r}
              </span>
            )
          })}
        </div>
        {/* reply email body  */}
        <div className='space-y-6'>
          <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 '>
            Message:
          </label>
          <textarea
            placeholder='Write your reply...'
            name='body'
            autoComplete='off'
            autoCorrect='on'
            rows={10}
            className='border border-border my-3 w-full  text-base sm:text-sm p-2 rounded-md shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
            onChange={(e) => (reply.body = e.target.value)}
          />
        </div>

        {/* attachment */}
        <div className='space-y-2'>
          {attachmentsInfo?.length > 0 && (
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 block mb-3'>
              Attachments:
            </label>
          )}

          {attachmentsInfo.map((attachment) => {
            return (
              <UploadedAttachmentList
                attachment={attachment}
                remove={remove}
                key={attachment.id}
              />
            )
          })}

          <span
            ref={uploadErrorRef}
            className='text-sm mt-3 block text-red-500'
          ></span>
        </div>
        <div className='flex gap-2 pt-4 justify-between'>
          <button
            className=' text-sm font-semibold  border-border border py-2 px-10 rounded hover:scale-[0.95] active:scale-[1.02] transition-all ease-in-out hover:bg-input cursor-pointer'
            onClick={send}
          >
            Send
          </button>
          <div className='flex '>
            <input
              type='file'
              ref={fileInputRef}
              multiple
              className='hidden'
              onChange={onFiles}
            />

            <button
              type='button'
              onClick={() => fileInputRef.current.click()}
              className='hover:scale-[0.95] active:scale-[1.02] cursor-pointer hover:bg-input px-3 rounded'
            >
              <RiAttachment2 size={16} />
            </button>

            <button
              variant='outline'
              className='hover:scale-[0.95] active:scale-[1.02] cursor-pointer hover:bg-input px-3 rounded hover:text-red-500'
              onClick={cancel}
            >
              <IoTrashOutline size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Reply
