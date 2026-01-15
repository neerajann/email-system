import { useRef, useState } from 'react'
import { useAppContext } from '../AppContext'
import { RxCross2 } from 'react-icons/rx'
import { emailPattern } from '../utils/pattern'
import api from '../services/api'
import { filesize } from 'filesize'

const ComposeMail = () => {
  const { setShowComposeMail } = useAppContext()
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

  const MAX_TOTAL_SIZE = 10 * 1024 * 1024

  const handleRecipentsChange = (e) => {
    const el = e.target
    const value = el.value

    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`

    const parts = value.split(',').map((p) => p.trim())
    const current = parts.pop()
    const validEmails = parts.filter((email) => emailPattern.test(email))

    if (validEmails.length > 0) {
      setEmail((prev) => ({
        ...prev,
        recipients: [...prev.recipients, ...validEmails],
      }))
    }

    setRecipents(current || '')
    setShowSuggestion(emailPattern.test(current))
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length + email.attachments.length > 10) {
      uploadErrorRef.current.textContent = 'You can only upload upto 10 files'
      return
    }
    const exisitingSize = email.attachments.reduce(
      (acc, att) => acc + att.size,
      0
    )
    const newFileSize = files.reduce((acc, file) => acc + file.size, 0)
    if (exisitingSize + newFileSize > MAX_TOTAL_SIZE) {
      uploadErrorRef.current.textContent =
        'Total attachments cannot exceed 10 MB'
      return
    }

    await uploadFiles(files)
    e.target.value = null
  }

  const uploadFiles = async (files) => {
    files.forEach(async (file, index) => {
      setAttachmentsInfo([
        ...attachmentsInfo,
        {
          name: file.name,
          size: file.size,
          progress: 0,
          uploaded: false,
        },
      ])

      const form = new FormData()
      form.append('attachments', file)

      const result = await api.post('/mail/attachment', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          if (!event.total) return
          const percent = Math.round((event.loaded * 100) / event.total)
          setAttachmentsInfo((prev) =>
            prev.map((att, i) =>
              i === index ? { ...att, progress: percent } : att
            )
          )
        },
      })

      if (result.data) {
        setAttachmentsInfo((prev) =>
          prev.map((att, i) => (i === index ? { ...att, uploaded: true } : att))
        )
        result.data.forEach((attachmendId) => {
          email.attachments.push(attachmendId)
        })
      }
    })
  }

  console.log(attachmentsInfo)

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles({ target: { files: e.dataTransfer.files } })
  }
  const sendMail = async () => {
    if (email.recipients.length === 0) {
      return (recipentsRef.current.textContent =
        'Please specify at least one recipient.')
    }
    recipentsRef.current.textContent = ''
    if (email.subject.length > 200) {
      return (subjectRef.current.textContent = 'Subject is too long.')
    }
    subjectRef.current.textContent = ''
    const response = await api.post('/mail/send', email)
    console.log(response)
  }
  const cancelMail = async () => {
    setShowComposeMail(false)
  }

  const removeAttachment = (index) => {
    if (attachmentsInfo[index].uploaded) {
      setAttachmentsInfo((prev) => prev.filter((_, i) => i != index))
      email.attachments.filter((_, id) => id != index)
    } else {
      setAttachmentsInfo((prev) => prev.filter((_, i) => i != index))
    }
  }
  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div
        className='w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg border border-input  shadow-lg overflow-hidden bg-background'
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className=' border-b border-input px-4 md:px-6 py-4 flex items-center justify-between '>
          <h2 className='text-lg md:text-2xl font-semibold '>Compose Email</h2>
          <button
            variant='ghost'
            size='icon'
            className='border border-border p-2 rounded'
            onClick={() => setShowComposeMail(false)}
          >
            <RxCross2 />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto space-y-4 px-4 md:px-6 py-4'>
          <div className='space-y-2 relative'>
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 '>
              To:
            </label>
            <div
              tabIndex={0}
              className='relative
              w-full
              flex
              flex-wrap
              bg-input
              text-foreground
              border gap-y-1.5
              gap-x-1
              border-border
              rounded-md items-center
              p-2
              pl-3
              text-sm
              shadow-xs
              focus-within:outline-none
              focus-within:border-ring
              focus-within:ring-2
              focus-within:ring-ring/50
              my-2
              '
            >
              {email.recipients.map((r) => {
                return (
                  <span className=' border border-border  rounded p-1  flex items-center justify-center'>
                    {r}
                    <RxCross2
                      className='inline ml-1'
                      onClick={() => {
                        setEmail({
                          ...email,
                          recipients: email.recipients.filter(
                            (recipent) => recipent != r
                          ),
                        })
                      }}
                    />
                  </span>
                )
              })}
              <textarea
                type='email'
                name='recipents'
                placeholder='recipent@example.com'
                rows={1}
                className='
                flex-1
                min-w-30
                bg-transparent
                focus:outline-none
                resize-none
                overflow-hidden
                leading-6
            '
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
                className='
                absolute
                left-0
                top-full
                mt-1
                w-full
                bg-background
                border
                border-border
                rounded
                p-2
                pl-3
                text-sm
                shadow-lg
                z-50
                '
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
          <div className='space-y-2'>
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 '>
              Subject:
            </label>
            <input
              type='text'
              name='subject'
              placeholder='Email subject'
              className='
              w-full
              my-2
              bg-input
              text-foreground
              border
              border-border
              rounded-md
              p-2
              pl-3
              text-sm
              shadow-xs
              placeholder:text-muted-foreground
              focus:outline-none
              focus:border-ring
              focus:ring-2
              focus:ring-ring/50

            '
              onChange={(e) => setEmail({ ...email, subject: e.target.value })}
            />
            <span ref={subjectRef} className=' text-sm text-red-500'></span>
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50'>
              Message:
            </label>
            <textarea
              placeholder='Type your message...'
              name='body'
              rows={10}
              className='my-2 w-full border border-border text-sm p-2 rounded-md shadow-xs
              placeholder:text-muted-foreground
              focus:outline-none
              focus:border-ring
              focus:ring-2
              focus:ring-ring/50 '
              onChange={(e) => setEmail({ ...email, body: e.target.value })}
            />
          </div>
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
                    onClick={() => removeAttachment(index)}
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
              onChange={handleFiles}
            />

            <div className='flex items-center justify-between border border-border p-2 rounded w-40 '>
              <button
                type='button'
                onClick={() => fileInputRef.current.click()}
                className='flex items-center  text-sm font-medium'
              >
                📎 Attach files
              </button>
            </div>
            <span ref={uploadErrorRef}></span>
          </div>
          <div className='flex gap-2 pt-4'>
            <button
              className='flex-1 text-sm font-semibold  border-border border p-2 rounded hover:scale-[0.95] active:scale-[1.02] transition-all ease-in-out'
              onClick={sendMail}
            >
              Send
            </button>
            <button
              variant='outline'
              className='border font-semibold border-border px-3 py-2 rounded text-sm hover:scale-[0.95] active:scale-[1.02]'
              onClick={cancelMail}
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
