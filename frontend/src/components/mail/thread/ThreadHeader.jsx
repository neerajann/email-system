import { FaReply, FaReplyAll } from 'react-icons/fa6'
import Tooltip from '../../ui/Tooltip'
import { BsChevronExpand } from 'react-icons/bs'
import formatMailDate from '../../../utils/formatMailDate'

const ThreadHeader = ({
  setExpand,
  showMore,
  mail,
  setShowReply,
  setShowMore,
}) => {
  return (
    <>
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
              {mail.from.name ?? mail.from.address}
            </h2>

            {showMore && (
              <span className='text-muted-foreground'>{mail.from.address}</span>
            )}
          </div>

          <div
            className={` ${showMore && 'opacity-0'} sm:opacity-100 flex items-center gap-4 text-xs text-muted-foreground shrink-0`}
          >
            <Tooltip message='Reply' tooltipClassName='text-foreground'>
              <div
                className='border border-border p-1 rounded hover:bg-input '
                onClick={(e) => {
                  e.stopPropagation()
                  setShowReply({ reply: true })
                }}
              >
                <FaReply size={15} />
              </div>
            </Tooltip>
            {mail.to.length > 1 && (
              <Tooltip message='Reply all' tooltipClassName='text-foreground'>
                <div
                  className='border border-border p-1 rounded hover:bg-input '
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowReply({ replyAll: true })
                  }}
                >
                  <FaReplyAll size={15} />
                </div>
              </Tooltip>
            )}
            <span className='whitespace-nowrap'>
              {formatMailDate(mail.receivedAt, true)}
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
              {mail.to.map((to) => to.name || to.address).join(', ')}
            </span>
            <Tooltip message='Expand' tooltipClassName='text-foreground top-6!'>
              <BsChevronExpand
                className='shrink-0 cursor-pointer'
                onClick={() => setShowMore(true)}
              />
            </Tooltip>
          </div>
        ) : (
          <div className='flex flex-col gap-2'>
            {mail.to.map((to) => (
              <div key={to.address} className='flex gap-2 px-1'>
                <span>{to.name ?? to.address}</span>
                {to.name && (
                  <span className='text-muted-foreground'>{to.address}</span>
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
    </>
  )
}
export default ThreadHeader
