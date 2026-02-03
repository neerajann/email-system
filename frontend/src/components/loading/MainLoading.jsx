const MainLoading = () => {
  return (
    <div className='w-screen h-dvh flex flex-col items-center justify-center bg-background text-foreground gap-4'>
      <span className='text-3xl lg:text-5xl font-semibold'>
        {import.meta.env.VITE_DOMAIN_NAME.split('.')[0]}
      </span>

      <div className='w-30 lg:w-45 h-0.5 rounded bg-muted overflow-hidden'>
        <div className='h-full w-1/3 bg-foreground animate-[slide_1s_linear_infinite]' />
      </div>

      <div className=' text-xs text-muted-foreground flex items-center justify-between gap-1'>
        Verifying authentication
        <div className='flex gap-1 text-xs'>
          <span className='animate-bounce [animation-delay:-0.3s]'>.</span>
          <span className='animate-bounce [animation-delay:-0.15s]'>.</span>
          <span className='animate-bounce'>.</span>
        </div>
      </div>
    </div>
  )
}
export default MainLoading
