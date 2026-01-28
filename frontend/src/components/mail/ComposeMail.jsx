import { useRef, useState } from 'react'
import { RxCross2 } from 'react-icons/rx'
import { emailPattern } from '../../utils/pattern'
import { filesize } from 'filesize'
import { useUI } from '../../contexts/UIContext'
import { RiAttachment2 } from 'react-icons/ri'
import { useQueryClient } from '@tanstack/react-query'
import { handleFiles, removeAttachment } from '../../services/attachmentService'
import { cancelMail, sendMail } from '../../services/emailService'

const ComposeMail = () => {
  const controllersRef = useRef({})
  const queryClient = useQueryClient()
  const { setShowComposeMail } = useUI()
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [recipents, setRecipents] = useState('')
  const [attachmentsInfo, setAttachmentsInfo] = useState([])
  const [email, setEmail] = useState({
    recipients: [],
    subject: '',
    body: '',
    attachments: [],
  })

  const subjectRef = useRef(null)
  const recipentsRef = useRef(null)
  const fileInputRef = useRef(null)
  const uploadErrorRef = useRef(null)

  const handleRecipentsChange = (e) => {
    const el = e.target
    const value = el.value

    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`

    const parts = value.split(',').map((p) => p.trim())

    let current = parts.pop()

    const validEmails = parts.filter((email) => emailPattern.test(email))

    if (validEmails.length > 0) {
      recipentsRef.current.textContent = ''
      const uniqueRecipents = new Set([...email.recipients, ...validEmails])

      setEmail((prev) => ({
        ...prev,
        recipients: Array.from(uniqueRecipents),
      }))
    }
    console.log(validEmails.length)

    if (parts.length >= 1 && validEmails.length === 0) {
      setRecipents(parts[0])
    } else {
      setRecipents(current || '')
    }
    setShowSuggestion(emailPattern.test(current))
  }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] lg:p-4 '>
      <div
        className='w-full max-w-none lg:max-w-2xl h-dvh lg:h-auto lg:max-h-[90vh] flex flex-col rounded-lg border border-input overflow-hidden bg-background '
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles({
            e,
            email,
            uploadErrorRef,
            controllersRef,
            setAttachmentsInfo,
          })
        }}
      >
        <div className=' border-b border-input px-4 md:px-6 py-4 flex items-center justify-between '>
          <h2 className='text-lg md:text-2xl font-semibold '>Compose Email</h2>
          <button
            variant='ghost'
            size='icon'
            className='border border-border p-2 rounded'
            onClick={() => {
              cancelMail({
                attachmentsInfo,
                controllersRef,
                email,
              })
              setShowComposeMail(false)
            }}
          >
            <RxCross2 />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto space-y-4 px-4 md:px-6 py-4'>
          {/* recipents  */}
          <div className='space-y-2 relative'>
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
                      className='inline ml-1'
                      onClick={() => {
                        setEmail({
                          ...email,
                          recipients: email.recipients.filter(
                            (recipent) => recipent != r,
                          ),
                        })
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
                onChange={(e) => handleRecipentsChange(e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const r = recipents.replace(/\n/g, '')
                    if (emailPattern.test(r)) {
                      setRecipents('')
                      setEmail({
                        ...email,
                        recipients: [...email.recipients, r],
                      })
                      setShowSuggestion(false)
                    }
                  }
                }}
              />
            </div>
            {showSuggestion && (
              <div
                className='absolute left-0 top-full mt-1 w-full bg-background border border-border rounded p-2 pl-3 text-sm shadow z-50'
                onClick={() => {
                  const r = [...email.recipients, recipents]
                  setEmail({ ...email, recipients: r })
                  setShowSuggestion(false)
                  setRecipents('')
                }}
              >
                {recipents}
              </div>
            )}
            <span ref={recipentsRef} className=' text-sm text-red-500 '></span>
          </div>
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

            {attachmentsInfo.map((attachment, index) => {
              return (
                <div
                  className='border bg-input border-border w-full flex items-center gap-x-4 justify-between text-xs font-normal p-2 rounded mb-3'
                  key={index}
                >
                  <div>
                    {attachment.name}
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
                  <button
                    className=' border border-border p-1 rounded'
                    onClick={() =>
                      removeAttachment({
                        id: attachment.id,
                        attachmentsInfo,
                        setAttachmentsInfo,
                        controllersRef,
                        email,
                      })
                    }
                  >
                    <RxCross2 size={15} />
                  </button>
                </div>
              )
            })}
            <input
              type='file'
              ref={fileInputRef}
              multiple
              className='hidden'
              onChange={(e) =>
                handleFiles({
                  e,
                  email,
                  uploadErrorRef,
                  controllersRef,
                  setAttachmentsInfo,
                })
              }
            />

            <div className='flex items-center justify-between border border-border p-2 rounded w-40 '>
              <button
                type='button'
                onClick={() => fileInputRef.current.click()}
                className='flex items-center  text-sm font-medium gap-2'
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
              className='flex-1 text-sm font-semibold  border-border border p-2 rounded hover:scale-[0.95] active:scale-[1.02] transition-all ease-in-out'
              onClick={() =>
                sendMail({
                  email,
                  recipentsRef,
                  subjectRef,
                  attachmentsInfo,
                  uploadErrorRef,
                  setShowComposeMail,
                  queryClient,
                })
              }
            >
              Send
            </button>
            <button
              variant='outline'
              className='border font-semibold border-border px-3 py-2 rounded text-sm hover:scale-[0.95] active:scale-[1.02]'
              onClick={() => {
                cancelMail({
                  attachmentsInfo,
                  controllersRef,
                  email,
                })
                setShowComposeMail(false)
              }}
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
