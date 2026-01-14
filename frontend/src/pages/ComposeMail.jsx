import { useRef, useState } from 'react'
import { useAppContext } from '../AppContext'
import { RxCross2 } from 'react-icons/rx'
import { emailPattern } from '../utils/pattern'
import api from '../services/api'

const ComposeMail = () => {
  const { setShowComposeMail } = useAppContext()
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [recipents, setRecipents] = useState('')
  const [email, setEmail] = useState({
    recipients: [],
    subject: '',
    body: '',
    attachments: [],
  })
  const subjectRef = useRef(null)
  const recipentsRef = useRef(null)

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
  console.log(email)

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg border border-input  shadow-lg overflow-hidden bg-background'>
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
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50'>
              Attachments:
            </label>
            <input
              type='file'
              multiple
              className='block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-input file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'
            />
          </div>
          <div className='flex gap-2 pt-4'>
            <button
              className='flex-1 text-sm  border-border border p-2 rounded hover:scale-[0.95] active:scale-[1.02] transition-all ease-in-out'
              onClick={sendMail}
            >
              Send
            </button>
            <button
              variant='outline'
              className='border border-border px-3 py-2 rounded text-sm hover:scale-[0.95] active:scale-[1.02]'
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
