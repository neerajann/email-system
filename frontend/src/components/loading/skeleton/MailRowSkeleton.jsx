const MailRowSkeleton = () => {
  return (
    <div className='h-25 flex flex-1 items-center border border-b bg-background group relative border-border min-w-0 '>
      <div className='ml-4 sm:ml-8 p-2'>
        {/* select icon */}
        <div className='h-4 w-4 rounded bg-muted animate-pulse' />
      </div>

      <div className=' flex items-center flex-1 px-4 sm:px-8 min-w-0 w-full'>
        <div className=' flex items-center flex-1 min-w-0 w-0'>
          {/* star icon */}
          <div className='mr-5 sm:mr-10 shrink-0 hidden sm:inline-block'>
            <div className='h-4 w-4 rounded bg-muted animate-pulse' />
          </div>
          {/* mail contents */}
          <div className='flex flex-col justify-between flex-1 min-w-0 w-0 gap-2'>
            <div className='flex items-center gap-1 mb-1.5  min-w-0'>
              {/* mail from */}
              <div className='h-3 w-32 rounded bg-muted animate-pulse' />
            </div>
            {/* mail subject */}
            <div className='h-3 w-48 rounded bg-muted mb-1.5 animate-pulse' />
            {/* mail body */}
            <div className='h-2.5 w-full max-w-[20rem] rounded bg-muted animate-pulse' />
          </div>
        </div>

        {/* date and time */}

        <div className='flex flex-col gap-3 items-end'>
          <div className='h-3 w-16 rounded bg-muted animate-pulse ' />
          {/* star button for mobile devices */}
          <div className='sm:hidden animate-pulse p-3'>
            <div className='rounded h-4 w-4 bg-muted '></div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default MailRowSkeleton
