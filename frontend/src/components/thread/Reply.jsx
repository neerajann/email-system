import { RxCross2 } from 'react-icons/rx'
import { RiAttachment2 } from 'react-icons/ri'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { filesize } from 'filesize'
import { IoTrashOutline } from 'react-icons/io5'
import { handleFiles, removeAttachment } from '../../services/attachmentService'
import { cancelMail, sendReply } from '../../services/emailService'
import { useQueryClient } from '@tanstack/react-query'

const Reply = ({ thread, showReply, setShowReply }) => {
  const queryClient = useQueryClient()
  const controllersRef = useRef({})
  const { user } = useAuth()
  const [attachmentsInfo, setAttachmentsInfo] = useState([])
  const uploadErrorRef = useRef(null)
  const fileInputRef = useRef(null)
  if (!thread) return

  const [reply, setReply] = useState({
    recipients: [],
    subject: '',
    body: '',
    attachments: [],
  })

  useEffect(() => {
    if (showReply?.replyAll) {
      const recipents = thread.to
        .filter((r) => {
          return r.address !== user
        })
        .map((r) => r.address)

      recipents.push(thread.from.address)
      setReply((prev) => ({ ...prev, recipients: recipents }))
    } else if (showReply?.reply) {
      setReply((prev) => ({ ...prev, recipients: [thread.from.address] }))
    }
  }, [])

  return (
    <div
      className='border border-border rounded-xl p-6 '
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        handleFiles({
          e,
          email: reply,
          uploadErrorRef,
          controllersRef,
          setAttachmentsInfo,
        })
      }}
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
          {reply?.recipients?.map((r) => {
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
            className='border border-border my-3 w-full  text-sm p-2 rounded-md shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
          />
        </div>

        {/* attachment */}
        <div className='space-y-2'>
          {attachmentsInfo?.length > 0 && (
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 block mb-3'>
              Attachments:
            </label>
          )}

          {attachmentsInfo?.map((attachment, index) => {
            return (
              <div
                className='border bg-input border-border w-full flex items-center gap-x-4 justify-between text-xs font-normal p-2 rounded mb-3'
                key={index}
              >
                <div>
                  {attachment?.name}
                  <span className='ml-2 '>({filesize(attachment.size)})</span>
                </div>
                {attachment?.progress != 100 && (
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
                      email: reply,
                    })
                  }
                >
                  <RxCross2 size={15} />
                </button>
              </div>
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
            onClick={() => {
              sendReply({
                reply,
                attachmentsInfo,
                uploadErrorRef,
                setShowReply,
                queryClient,
                mailId: thread.mailId,
                threadId: thread.threadId,
              })
            }}
          >
            Send
          </button>
          <div className='flex '>
            <input
              type='file'
              ref={fileInputRef}
              multiple
              className='hidden'
              onChange={(e) =>
                handleFiles({
                  e,
                  email: reply,
                  uploadErrorRef,
                  setAttachmentsInfo,
                  controllersRef,
                })
              }
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
              onClick={() => {
                setShowReply(false)
                cancelMail({
                  attachmentsInfo,
                  controllersRef,
                  email: reply,
                })
              }}
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
