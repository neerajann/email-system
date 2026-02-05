import { useRef } from 'react'
import { RxCross2 } from 'react-icons/rx'
import { useUI } from '../../../contexts/UIContext.jsx'
import { RiAttachment2 } from 'react-icons/ri'
import { useQueryClient } from '@tanstack/react-query'
import useRecipientsInput from '../../../hooks/mail/shared/useRecipientsInput.js'
import useComposeActions from '../../../hooks/mail/compose/useComposeActions.js'
import useAttachments from '../../../hooks/mail/shared/useAttachments.js'
import RecipientsInput from '../shared/RecipientsInput.jsx'
import UploadedAttachmentList from '../shared/UploadedAttachmentList.jsx'
import useDraft from '../../../hooks/mail/shared/useDraft.js'
import Tooltip from '../../ui/Tooltip.jsx'

const ComposeMail = () => {
  const queryClient = useQueryClient()
  const { setShowComposeMail } = useUI()
  const subjectRef = useRef(null)
  const recipientsRef = useRef(null)
  const { recipients, setRecipients, email } = useDraft({ subject: '' })
  const { input, suggestions, handleChange, addRecipient, removeRecipient } =
    useRecipientsInput({ setRecipients, recipientsRef })

  const {
    attachmentsInfo,
    fileInputRef,
    uploadErrorRef,
    controllersRef,
    onFiles,
    remove,
  } = useAttachments({ email })

  const { send, cancel } = useComposeActions({
    email,
    recipients,
    attachmentsInfo,
    controllersRef,
    setShowComposeMail,
    queryClient,
    subjectRef,
    recipientsRef,
    fileInputRef,
    uploadErrorRef,
  })

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] lg:p-4 '>
      <div
        className='w-full max-w-none lg:max-w-2xl h-dvh lg:h-auto lg:max-h-[90vh] flex flex-col rounded-lg border border-input overflow-hidden bg-background '
        onDragOver={(e) => e.preventDefault()}
        onDrop={onFiles}
      >
        <div className=' border-b border-input px-4 md:px-6 py-4 flex items-center justify-between '>
          <h2 className='text-lg md:text-2xl font-semibold '>Compose Email</h2>
          <Tooltip message='Discard mail' tooltipClassName='-left-0! mt-1'>
            <button
              variant='ghost'
              size='icon'
              className='border border-border p-2 rounded cursor-pointer'
              onClick={cancel}
            >
              <RxCross2 />
            </button>
          </Tooltip>
        </div>
        <div className='flex-1 overflow-y-auto space-y-4 px-4 md:px-6 py-4'>
          {/* recipients */}

          <RecipientsInput
            recipients={recipients}
            input={input}
            suggestions={suggestions}
            onChange={handleChange}
            onAdd={addRecipient}
            onRemove={removeRecipient}
            recipientsRef={recipientsRef}
          />
          {/* subject */}
          <div className='space-y-2'>
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 '>
              Subject:
            </label>
            <input
              type='text'
              name='subject'
              placeholder='Email subject'
              className='text-base md:text-sm  w-full my-2 bg-input text-foreground border border-border rounded-md p-2 pl-3  shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
              onChange={(e) => (email.subject = e.target.value)}
              autoComplete='off'
              autoCorrect='on'
            />
            <span ref={subjectRef} className=' text-sm text-red-500'></span>
          </div>
          {/* email body  */}
          <div className='space-y-2'>
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50'>
              Message:
            </label>
            <textarea
              placeholder='Type your message...'
              name='body'
              rows={10}
              className='bg-background my-2 w-full border border-border text-base md:text-sm p-2 rounded-md shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
              onChange={(e) => (email.body = e.target.value)}
              autoComplete='off'
              autoCorrect='on'
            />
          </div>
          {/* attachment */}
          <div className='space-y-2'>
            {attachmentsInfo.length > 0 && (
              <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 block mb-3'>
                Attachments:
              </label>
            )}

            {attachmentsInfo.map((attachment) => {
              return (
                <UploadedAttachmentList
                  key={attachment.id}
                  attachment={attachment}
                  remove={remove}
                />
              )
            })}

            <input
              type='file'
              ref={fileInputRef}
              multiple
              className='hidden'
              onChange={(e) => onFiles(e)}
            />

            <div className='flex items-center justify-between border border-border p-2 rounded w-40 cursor-pointer'>
              <button
                type='button'
                onClick={() => fileInputRef.current.click()}
                className='flex items-center  text-sm font-medium gap-2 cursor-pointer'
              >
                <RiAttachment2 size={15} /> Attach files
              </button>
            </div>
            <span
              ref={uploadErrorRef}
              className='text-sm mt-3 block text-red-500'
            ></span>
          </div>
          {/* action buttons */}
          <div className='flex gap-2 pt-4'>
            <button
              className='flex-1 text-sm font-semibold  border-border border p-2 rounded hover:scale-[0.98] active:scale-[1.02] transition-all ease-in-out cursor-pointer'
              onClick={send}
            >
              Send
            </button>
            <button
              variant='outline'
              className='border font-semibold border-border px-3 py-2 rounded text-sm hover:scale-[0.95] active:scale-[1.02] cursor-pointer'
              onClick={cancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ComposeMail
