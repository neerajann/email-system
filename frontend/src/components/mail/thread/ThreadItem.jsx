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
import { LuReply, LuReplyAll, LuForward } from 'react-icons/lu'
import Forward from '../forward/Forward.jsx'

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
    showForward,
    setShowForward,
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
            setShowForward={setShowForward}
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
            <div className='mt-8 flex items-center gap-4 text-sm'>
              <button
                className='flex items-center gap-3 border border-border py-2 px-4 rounded hover:bg-input/50 cursor-pointer'
                onClick={() => setShowReply({ reply: true })}
              >
                <LuReply size={16} />
                Reply
              </button>
              {mail.to.length > 1 && (
                <button
                  className='flex items-center gap-3  border border-border py-2 px-4 rounded hover:bg-input/50 cursor-pointer'
                  onClick={() => setShowReply({ replyAll: true })}
                >
                  <LuReplyAll size={16} />
                  Reply All
                </button>
              )}
              <button
                className='flex items-center gap-3  border border-border py-2 px-4 rounded hover:bg-input/50 cursor-pointer'
                onClick={() => setShowForward(true)}
              >
                <LuForward size={16} />
                Forward
              </button>
            </div>
          )}
        </div>
      )}
      {showReply && (
        <Reply setShowReply={setShowReply} mail={mail} showReply={showReply} />
      )}
      {showForward && <Forward setShowForward={setShowForward} mail={mail} />}
    </>
  )
}
export default memo(ThreadItem)
