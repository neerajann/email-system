import { FaReply, FaReplyAll } from 'react-icons/fa'
import QuotedBlock from './QuotedBlock.jsx'
import Tooltip from '../../ui/Tooltip.jsx'
import ThreadCompactView from './ThreadCompactView.jsx'
import useQuotedText from '../../../hooks/thread/useQuotedText.js'
import useThreadState from '../../../hooks/thread/useThreadState.js'
import ThreadHeader from './ThreadHeader.jsx'
import ThreadBody from './ThreadBody.jsx'
import ThreadAttachmentList from './ThreadAttachmentList.jsx'
import Reply from '../reply/Reply.jsx'
import { memo } from 'react'

const ThreadItem = ({ mail, defaultExpanded, mails }) => {
  const {
    showMore,
    setShowMore,
    expand,
    setExpand,
    showReply,
    setShowReply,
    showQuotedBlock,
    setShowQuotedBlock,
  } = useThreadState({ defaultExpanded })

  const quotedText = useQuotedText({ mail, mails })

  return (
    <>
      {/* compact view */}
      {!expand ? (
        <ThreadCompactView setExpand={setExpand} mail={mail} />
      ) : (
        <div className=' border border-border rounded-lg p-6 bg-background'>
          {/* expanded view  */}
          <ThreadHeader
            setExpand={setExpand}
            setShowMore={setShowMore}
            setShowReply={setShowReply}
            showMore={showMore}
            mail={mail}
          />
          <ThreadBody mail={mail} />

          <ThreadAttachmentList mail={mail} />

          {quotedText?.length > 0 && (
            <div className='mb-12'>
              <Tooltip
                message={
                  showQuotedBlock
                    ? 'Hide trimmed content'
                    : 'Show trimmed content'
                }
                tooltipClassName='top-7! left-13!'
              >
                <div
                  className='mt-6 h-3.5 rounded-2xl w-8 border border-border flex items-center justify-center bg-input hover:cursor-pointer'
                  onClick={() => setShowQuotedBlock((prev) => !prev)}
                >
                  <span className='leading-none text-xs'>•••</span>
                </div>
              </Tooltip>
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
              {mail.to.length > 1 && (
                <button
                  className='flex items-center gap-3  border border-border py-2 px-4 rounded hover:bg-input/50 cursor-pointer'
                  onClick={() => setShowReply({ replyAll: true })}
                >
                  <FaReplyAll />
                  Reply All
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {showReply && (
        <Reply setShowReply={setShowReply} mail={mail} showReply={showReply} />
      )}
    </>
  )
}
export default memo(ThreadItem)
