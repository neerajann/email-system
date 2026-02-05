import { IoMdRefresh } from 'react-icons/io'
import Tooltip from '../../ui/Tooltip'
import MarkAsButton from '../../ui/buttons/MarkAsButton'
import useMailUpdate from '../../../hooks/mailbox/useMailUpdate'
import TrashButton from '../../ui/buttons/TrashButton'
import RestoreButton from '../../ui/buttons/RestoreButton'

const MailListHeader = ({
  refetch,
  queryKey,
  clear,
  mailboxType,
  selectedIds,
  isBulkMode,
  mails,
  selectAll,
  hasThreadOpen,
}) => {
  const mailUpdateMutation = useMailUpdate(queryKey, {
    isInfiniteQuery: true,
  })

  return (
    <div className='flex flex-col shadow-xs mb-3 border-b border-border bg-background relative z-[40]'>
      <div className='flex items-center justify-between text-sm  px-4 py-2 shadow-xs bg-background relative'>
        <Tooltip
          message='Refresh'
          parentClassName='ml-3 sm:ml-6'
          tooltipClassName='top-6!'
        >
          <button onClick={() => refetch()}>
            <IoMdRefresh size={20} className='cursor-pointer' />
          </button>
        </Tooltip>

        {isBulkMode ? (
          <div className='flex items-center gap-2 '>
            <span className='text-xs font-normal mr-4'>
              {selectedIds.size} selected
            </span>
            {/* trash mail button  */}
            {mailboxType === 'trash' ? (
              <RestoreButton
                mailUpdateMutation={mailUpdateMutation}
                mailboxIds={Array.from(selectedIds)}
                options={clear}
                hasThreadOpen={hasThreadOpen}
              />
            ) : (
              <TrashButton
                mailUpdateMutation={mailUpdateMutation}
                isDeleted={false}
                mailboxIds={Array.from(selectedIds)}
                options={clear}
                hasThreadOpen={hasThreadOpen}
              />
            )}
            {/* mail read/unread button  */}
            {mails.some(
              (mail) => selectedIds.has(mail.mailboxId) && !mail.isRead,
            ) ? (
              <MarkAsButton
                mailboxIds={Array.from(selectedIds)}
                isRead={false}
                mailUpdateMutation={mailUpdateMutation}
                options={clear}
              />
            ) : (
              <MarkAsButton
                mailboxIds={Array.from(selectedIds)}
                isRead={true}
                mailUpdateMutation={mailUpdateMutation}
                options={clear}
              />
            )}

            <button
              className=' bg-background border border-border px-4 py-2 rounded font-normal cursor-pointer'
              onClick={clear}
            >
              Unselect all
            </button>
          </div>
        ) : (
          <div>
            <button
              className=' bg-background border border-border px-4 py-2 rounded font-normal cursor-pointer'
              onClick={() => {
                selectAll(mails.map((m) => m.mailboxId))
              }}
            >
              Select all
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
export default MailListHeader
