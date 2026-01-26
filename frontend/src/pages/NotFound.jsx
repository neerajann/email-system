import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className='w-screen h-dvh flex gap-4 flex-col items-center justify-center text-sm'>
      <div className=' font-semibold text-base'>404 | Page Not Found</div>

      <Link
        className='border border-border rounded p-2 hover:bg-input'
        to={'/'}
      >
        Back to Home Page
      </Link>
    </div>
  )
}
export default NotFound
