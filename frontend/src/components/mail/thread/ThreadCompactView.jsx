import formatMailDate from '../../../utils/formatMailDate'

const ThreadCompactView = ({ setExpand, mail }) => {
  return (
    <div
      className=' border border-border rounded-lg p-6 bg-background hover:bg-input cursor-pointer '
      onClick={() => setExpand(true)}
    >
      <div className='flex items-center justify-between min-w-0 overflow-hidden  '>
        <div className='flex flex-1 min-w-0'>
          <h2 className=' font-semibold text-sm mr-3 shrink-0 whitespace-nowrap'>
            {mail.from.name ?? mail.from.address}
          </h2>
          <p className='text-sm  text-muted-foreground truncate  overflow-hidden'>
            {mail.body.text}
          </p>
        </div>
        <span className='text-muted-foreground text-xs shrink-0 ml-4 whitespace-nowrap'>
          {formatMailDate(mail.receivedAt, true)}
        </span>
      </div>
    </div>
  )
}
export default ThreadCompactView
