import { useState } from 'react'
import { FaReply, FaReplyAll } from 'react-icons/fa'
import formatMailDate from '../../utils/fomatMailDate'
import { BsChevronExpand } from 'react-icons/bs'

const ThreadItem = ({ thread, defaultExpanded }) => {
  const [showMore, setShowMore] = useState(false)
  const [expand, setExpand] = useState(defaultExpanded)

  return (
    <>
      {!expand ? (
        <div
          className=' border border-border rounded-lg p-6 bg-background hover:bg-input cursor-pointer'
          onClick={() => setExpand(true)}
        >
          <div className='flex items-center justify-between min-w-0 overflow-hidden  '>
            <div className='flex flex-1 min-w-0'>
              <h2 className=' font-semibold text-sm mr-3 shrink-0 whitespace-nowrap'>
                {thread.from.name ?? thread.from.address}
              </h2>
              <p className='text-sm  text-muted-foreground truncate break-all overflow-hidden'>
                {thread.body.text}
              </p>
            </div>
            <span className='text-muted-foreground text-xs shrink-0 ml-4 whitespace-nowrap'>
              {formatMailDate(thread.receivedAt)}
            </span>
          </div>
        </div>
      ) : (
        <div className=' border border-border rounded-lg p-6 bg-background'>
          <div
            className={`grid items-center cursor-pointer text-sm ${
              showMore ? 'grid-cols-[60px_1fr]' : 'grid-cols-1'
            }`}
            onClick={() => setExpand(false)}
          >
            {showMore && (
              <span className='font-semibold text-muted-foreground'>FROM</span>
            )}

            <div className='flex items-center justify-between min-w-0 relative'>
              <div className={`flex gap-1 min-w-0 ${showMore && 'px-1'}`}>
                <h2 className='font-semibold'>
                  {thread.from.name ?? thread.from.address}
                </h2>

                {showMore && (
                  <span className='text-muted-foreground'>
                    {thread.from.address}
                  </span>
                )}
              </div>

              <div className='flex items-center gap-4 text-xs text-muted-foreground flex-none '>
                <span className='border border-border p-1 rounded hover:bg-input '>
                  <FaReply
                    size={15}
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('clicked')
                    }}
                  />
                </span>
                <span className='border border-border p-1 rounded hover:bg-input '>
                  <FaReplyAll
                    size={15}
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('clicked')
                    }}
                  />
                </span>
                <span className='whitespace-nowrap'>
                  {formatMailDate(thread.receivedAt)}
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
              <div className='flex items-center gap-1 text-muted-foreground'>
                To
                <span className='truncate'>
                  {thread.to.map((to) => to.name || to.address).join(', ')}
                </span>
                <BsChevronExpand
                  className='shrink-0 cursor-pointer'
                  onClick={() => setShowMore(true)}
                />
              </div>
            ) : (
              <div className='flex flex-col gap-2'>
                {thread.to.map((to) => (
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

          <div
            dangerouslySetInnerHTML={{ __html: thread.body.html }}
            className='mt-7 text-sm'
          />
          <div className='mt-8 flex items-center gap-6 text-sm'>
            <button className='flex items-center gap-3 border border-border py-2 px-4 rounded hover:bg-input/50 cursor-pointer'>
              <FaReply />
              Reply
            </button>
            <button className='flex items-center gap-3  border border-border py-2 px-4 rounded hover:bg-input/50 cursor-pointer'>
              <FaReplyAll />
              Reply All
            </button>
          </div>
        </div>
      )}
    </>
  )
}
export default ThreadItem
