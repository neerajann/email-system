const ThreadListSkeleton = () => {
  return (
    <>
      {/*Thread header for larger devices */}
      <div className='mb-8 w-full block'>
        <div className='flex items-start justify-between gap-3 mb-2 mt-2'>
          <div className='block lg:hidden rounded h-8 w-18 bg-muted animate-pulse' />
          <div className='hidden lg:block w-full h-8 rounded bg-muted animate-pulse' />

          <div className='flex'>
            <div className='flex gap-3'>
              <div className='w-8 h-8 rounded bg-muted animate-pulse' />
              <div className='w-8 h-8 rounded bg-muted animate-pulse' />
              <div className='w-8 h-8 rounded bg-muted animate-pulse' />
            </div>
          </div>
        </div>
      </div>

      {/* From and recived at row */}
      <div className='block lg:hidden w-full h-8 rounded bg-muted animate-pulse mb-4' />

      <div className='flex items-center justify-between min-w-0 relative mt-5'>
        <div className='flex gap-1 min-w-0  cursor-text '>
          <div className='w-35 bg-muted h-3 rounded animate-pulse' />
        </div>

        {/* the right side of from row */}
        <div className='opacity-100 flex items-center gap-4 shrink-0'>
          <div className='bg-muted h-5 w-6 rounded animate-pulse' />
          <div className='bg-muted h-5 w-6 rounded animate-pulse' />
          <div className='bg-muted h-5 w-20 rounded animate-pulse' />
        </div>
      </div>

      <div className='grid items-start text-sm mt-4 grid-cols-1'>
        <div className='bg-muted h-3 w-60 rounded animate-pulse' />
      </div>
      <div className='mt-10 flex flex-col gap-4'>
        <div className='w-full h-3 rounded bg-muted animate-pulse' />
        <div className='w-full h-3 rounded bg-muted animate-pulse' />
        <div className='w-full h-3 rounded bg-muted animate-pulse' />
        <div className='w-full h-3 rounded bg-muted animate-pulse' />
        <div className='w-full h-3 rounded bg-muted animate-pulse' />
        <div className='w-1/2 h-3 rounded bg-muted animate-pulse' />
        <div className='w-1/3 h-3 rounded bg-muted animate-pulse' />
      </div>
      <div className='flex gap-3 items-center mt-10'>
        <div className='w-20 h-6 rounded bg-muted animate-pulse' />
        <div className='w-20 h-6 rounded bg-muted animate-pulse' />
      </div>
    </>
  )
}
export default ThreadListSkeleton
