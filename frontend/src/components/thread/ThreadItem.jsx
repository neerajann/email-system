import { useState } from 'react'
import { FaReply, FaReplyAll } from 'react-icons/fa'
import formatMailDate from '../../utils/fomatMailDate'
import { BsChevronExpand } from 'react-icons/bs'
import { MdOutlineFileDownload } from 'react-icons/md'
import DOMPurify from 'dompurify'
import Reply from './Reply'
import QuotedBlock from './QuotedBlock'

const ThreadItem = ({ email, defaultExpanded, emails }) => {
  const [showMore, setShowMore] = useState(false)
  const [expand, setExpand] = useState(defaultExpanded)
  const [showReply, setShowReply] = useState(false)
  const [showQuotedBlock, setShowQuotedBlock] = useState(false)

  const messageIdMap = new Map()
  emails.map((e) =>
    messageIdMap.set(e.messageId, {
      receivedAt: e.receivedAt,
      body: e.body.text,
      sender: e.from,
      inReplyTo: e?.inReplyTo,
    }),
  )
  const quotedText = []

  const constructQuotedText = (email) => {
    if (!email?.inReplyTo) return
    const parent = messageIdMap.get(email.inReplyTo)
    if (!parent) return
    quotedText.push(parent)
    constructQuotedText(parent)
  }

  constructQuotedText(email)

  return (
    <>
      {/* compact view */}
      {!expand ? (
        <div
          className=' border border-border rounded-lg p-6 bg-background hover:bg-input cursor-pointer '
          onClick={() => setExpand(true)}
        >
          <div className='flex items-center justify-between min-w-0 overflow-hidden  '>
            <div className='flex flex-1 min-w-0'>
              <h2 className=' font-semibold text-sm mr-3 shrink-0 whitespace-nowrap'>
                {email.from.name ?? email.from.address}
              </h2>
              <p className='text-sm  text-muted-foreground truncate break-all overflow-hidden'>
                {email.body.text}
              </p>
            </div>
            <span className='text-muted-foreground text-xs shrink-0 ml-4 whitespace-nowrap'>
              {formatMailDate(email.receivedAt, true)}
            </span>
          </div>
        </div>
      ) : (
        <div className=' border border-border rounded-lg p-6 bg-background'>
          {/* expanded view  */}
          <div
            className={`grid items-center cursor-pointer text-sm ${
              showMore ? 'grid-cols-[60px_1fr]' : 'grid-cols-1'
            }`}
            onClick={() => setExpand(false)}
          >
            {showMore && (
              <span
                className='font-semibold text-muted-foreground cursor-text'
                onClick={(e) => e.stopPropagation()}
              >
                FROM
              </span>
            )}

            <div className='flex items-center justify-between min-w-0 relative'>
              <div
                className={`flex gap-1 min-w-0 ${showMore && 'px-1'} cursor-text `}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className='font-semibold'>
                  {email.from.name ?? email.from.address}
                </h2>

                {showMore && (
                  <span className='text-muted-foreground'>
                    {email.from.address}
                  </span>
                )}
              </div>

              <div
                className={` ${showMore && 'opacity-0'} sm:opacity-100 flex items-center gap-4 text-xs text-muted-foreground flex-none `}
              >
                <span
                  className='border border-border p-1 rounded hover:bg-input '
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowReply({ reply: true })
                  }}
                >
                  <FaReply size={15} />
                </span>
                <span
                  className='border border-border p-1 rounded hover:bg-input '
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowReply({ replyAll: true })
                  }}
                >
                  <FaReplyAll size={15} />
                </span>
                <span className='whitespace-nowrap'>
                  {formatMailDate(email.receivedAt, true)}
                </span>
              </div>
            </div>
          </div>
          <div
            className={`grid items-start text-sm mt-2 ${
              showMore ? 'grid-cols-[60px_1fr]' : 'grid-cols-1'
            }`}
          >
            {showMore && (
              <span className='font-semibold text-muted-foreground'>TO</span>
            )}

            {!showMore ? (
              <div
                className='flex items-center gap-1 text-muted-foreground cursor-pointer'
                onClick={() => setShowMore(true)}
              >
                To
                <span className='truncate'>
                  {email.to.map((to) => to.name || to.address).join(', ')}
                </span>
                <BsChevronExpand
                  className='shrink-0 cursor-pointer'
                  onClick={() => setShowMore(true)}
                />
              </div>
            ) : (
              <div className='flex flex-col gap-2'>
                {email.to.map((to) => (
                  <div key={to.address} className='flex gap-2 px-1'>
                    <span>{to.name ?? to.address}</span>
                    {to.name && (
                      <span className='text-muted-foreground'>
                        {to.address}
                      </span>
                    )}
                  </div>
                ))}

                <span
                  className='inline-block text-muted-foreground hover:bg-input rounded p-1 w-fit cursor-pointer'
                  onClick={() => setShowMore(false)}
                >
                  Show less
                </span>
              </div>
            )}
          </div>
          {email.isSystem ? (
            <div
              dangerouslySetInnerHTML={{
                __html: email.body.html,
              }}
              className='mt-7 text-sm text-foreground'
            />
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(email.body.html),
              }}
              className='mt-7 text-sm whitespace-pre-wrap text-foreground'
            />
          )}
          {email.attachments.length !== 0 && (
            <div className='text-sm mt-6 border-t border-border pt-4  '>
              <span className='text-sm font-semibold '>
                {email.attachments.length} &nbsp;Attachment
                {email.attachments.length < 1 ? 's' : ''}
              </span>
              <div className='flex gap-5 min-w-0 flex-wrap mt-4'>
                {email.attachments.map((attachment) => {
                  return (
                    <div
                      key={attachment.id}
                      className=' border border-border py-2 px-4 bg-input  flex items-center gap-6 rounded w-fit'
                    >
                      <span>{attachment.fileName}</span>
                      <a
                        href={`${import.meta.env.VITE_API_URL}/mail/attachment/${attachment.id}?mailId=${email.mailId}`}
                      >
                        <MdOutlineFileDownload size={18} />
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {quotedText.length > 0 && (
            <div>
              <div
                className='mt-6 h-3.5 rounded-2xl not w-8 border border-border flex items-center justify-center bg-input hover:cursor-pointer'
                onClick={() => setShowQuotedBlock((prev) => !prev)}
              >
                <span className='leading-none text-xs'>•••</span>
              </div>
              {showQuotedBlock && (
                <div className='mt-6'>
                  <QuotedBlock quotes={[...quotedText]} />
                </div>
              )}
            </div>
          )}

          {defaultExpanded && (
            <div className='mt-8 flex items-center gap-6 text-sm'>
              <button
                className='flex items-center gap-3 border border-border py-2 px-4 rounded hover:bg-input/50 cursor-pointer'
                onClick={() => setShowReply({ reply: true })}
              >
                <FaReply />
                Reply
              </button>
              <button
                className='flex items-center gap-3  border border-border py-2 px-4 rounded hover:bg-input/50 cursor-pointer'
                onClick={() => setShowReply({ replyAll: true })}
              >
                <FaReplyAll />
                Reply All
              </button>
            </div>
          )}
        </div>
      )}
      {showReply && (
        <Reply
          setShowReply={setShowReply}
          email={email}
          showReply={showReply}
        />
      )}
    </>
  )
}
export default ThreadItem
