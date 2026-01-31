import { useRef } from 'react'
import { RxCross2 } from 'react-icons/rx'
import { useUI } from '../../../contexts/UIContext.jsx'
import { RiAttachment2 } from 'react-icons/ri'
import { useQueryClient } from '@tanstack/react-query'
import useRecipientsInput from '../../../hooks/mail/compose/useRecipientsInput.js'
import useComposeActions from '../../../hooks/mail/compose/useComposeActions.js'
import useAttachments from '../../../hooks/mail/shared/useAttachments.js'
import RecipientsInput from './RecipientsInput.jsx'
import UploadedAttachmentList from '../shared/UploadedAttachmentList.jsx'
import useDraft from '../../../hooks/mail/shared/useDraft.js'

const ComposeMail = () => {
  const queryClient = useQueryClient()
  const { setShowComposeMail } = useUI()
  const subjectRef = useRef(null)
  const recipientsRef = useRef(null)
  const { email, setEmail } = useDraft({ subject: '' })
  const { input, suggestions, handleChange, addRecipient, removeRecipient } =
    useRecipientsInput({ setEmail, recipientsRef })

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
          <button
            variant='ghost'
            size='icon'
            className='border border-border p-2 rounded cursor-pointer'
            onClick={cancel}
          >
            <RxCross2 />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto space-y-4 px-4 md:px-6 py-4'>
          {/* recipients */}
          {/* <div className='space-y-2 relative'>
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 '>
              To:
            </label>
            <div
              tabIndex={0}
              className='relative w-full flex flex-wrap bg-input text-foreground border gap-y-1.5 gap-x-1 border-border rounded-md items-center p-2 pl-3 text-sm shadow-xs focus-within:outline-none focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50 my-2'
            >
              {email.recipients.map((r) => {
                return (
                  <span
                    className=' border border-border  rounded p-1  flex items-center justify-center'
                    key={r}
                  >
                    {r}
                    <RxCross2
                      className='inline ml-1 cursor-pointer'
                      onClick={() => {
                        removeRecipient(r)
                      }}
                    />
                  </span>
                )
              })}

              <textarea
                autoComplete='off'
                name='recipents'
                placeholder='recipent@example.com'
                rows={1}
                className=' text-base md:text-sm  flex-1 min-w-30 bg-transparent focus:outline-none resize-none overflow-hidden leading-6 border-none active:outline-none'
                value={recipents}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const r = recipents.replace(/\n/g, '')
                    if (emailPattern.test(r)) {
                      addRecipient(r)
                    }
                  }
                }}
              />
            </div>
            {suggestions?.length > 0 &&
              suggestions.map((suggestion) => {
                return (
                  <div
                    key={suggestion.id}
                    className='absolute left-0 top-full mt-1 w-full bg-background border border-border rounded p-2 pl-3 text-sm shadow z-50 cursor-pointer'
                    onClick={() => {
                      addRecipient(suggestion.emailAddress)
                    }}
                  >
                    {suggestion.emailAddress}
                  </div>
                )
              })}
            <span ref={recipientsRef} className=' text-sm text-red-500 '></span>
          </div> */}
          <RecipientsInput
            recipients={email.recipients}
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
              onChange={(e) => setEmail({ ...email, subject: e.target.value })}
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
              onChange={(e) => setEmail({ ...email, body: e.target.value })}
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
