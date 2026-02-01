import MailRowSkeleton from './MailRowSkeleton'

const MailListSkeleton = ({ count = 4 }) => {
  return (
    <div className='h-full flex-1 min-w-0 grid auto-rows-auto gap-4 overflow-y-auto content-start pb-8'>
      {Array.from({ length: count }).map((_, i) => (
        <MailRowSkeleton key={i} />
      ))}
    </div>
  )
}
export default MailListSkeleton
