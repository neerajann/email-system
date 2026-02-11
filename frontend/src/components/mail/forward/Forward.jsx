import { useQueryClient } from '@tanstack/react-query'
import useAttachments from '../../../hooks/mail/shared/useAttachments.js'
import UploadedAttachmentList from '../shared/UploadedAttachmentList.jsx'
import useDraft from '../../../hooks/mail/shared/useDraft.js'
import { useRef } from 'react'
import RecipientsInput from '../shared/RecipientsInput.jsx'
import useRecipientsInput from '../../../hooks/mail/shared/useRecipientsInput.js'
import DiscardMailButton from '../../ui/buttons/DiscardMailButton.jsx'
import UploadAttachmentButton from '../../ui/buttons/UploadAttachmentButton.jsx'
import useComposeActions from '../../../hooks/mail/compose/useComposeActions.js'

const Forward = ({ mail, setShowForward }) => {
  const queryClient = useQueryClient()
  const recipientsRef = useRef(null)

  if (!mail) return

  const forwardMailBody = `
  ---------- Forwarded message --------- </br>
  From:${mail.from?.name} ${mail.from.address}</br>
  Date:${mail.receivedAt}</br>
  Subject:${mail.subject}</br>
  To:${mail.to.map((r) => r.address).toString()}</br>
  </br>
  </br>
  ${mail.body.html}
  `

  const { email, recipients, setRecipients } = useDraft({
    subject: `Fwd: ${mail.subject}`,
    body: forwardMailBody,
    attachments: mail.attachments.map((a) => a.id),
  })

  const { input, suggestions, handleChange, addRecipient, removeRecipient } =
    useRecipientsInput({ setRecipients, recipientsRef })

  const {
    attachmentsInfo,
    fileInputRef,
    uploadErrorRef,
    controllersRef,
    onFiles,
    remove,
  } = useAttachments({ email, uploadedAttachments: mail.attachments })

  const { send, cancel } = useComposeActions({
    recipients,
    recipientsRef,
    email,
    setShowComposeMail: setShowForward,
    queryClient,
    attachmentsInfo,
    uploadErrorRef,
    controllersRef,
    subjectRef: uploadErrorRef,
  })

  return (
    <div
      className='border border-border rounded-xl p-6 '
      onDragOver={(e) => e.preventDefault()}
      onDrop={onFiles}
    >
      <div className='text-sm font-semibold mb-5'>Forward</div>
      <div className='space-y-6'>
        {/* recipents  */}
        <RecipientsInput
          recipients={recipients}
          input={input}
          suggestions={suggestions}
          onChange={handleChange}
          onAdd={addRecipient}
          onRemove={removeRecipient}
          recipientsRef={recipientsRef}
        />

        {/* Forward email body  */}
        <div className='space-y-6'>
          <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 '>
            Message:
          </label>
          <div
            contentEditable
            suppressContentEditableWarning
            className='border border-border my-3 w-full min-h-50 text-base sm:text-sm p-4 rounded-md shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
            onInput={(e) => (email.body = e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: email.body }}
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
            onClick={() => send(email)}
          >
            Send
          </button>
          <div className='flex items-center'>
            <input
              type='file'
              ref={fileInputRef}
              multiple
              className='hidden'
              onChange={onFiles}
            />

            <UploadAttachmentButton
              onClick={() => fileInputRef.current.click()}
            />

            <DiscardMailButton onClick={() => cancel(email)} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default Forward
