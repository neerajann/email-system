import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiXCircle } from 'react-icons/fi'

const useMailboxToasts = ({ isError, error }) => {
  useEffect(() => {
    if (isError) {
      toast.error(error.message || 'Something went wrong', {
        containerId: 'error',
        icon: <FiXCircle className='text-red-500' size={18} />,
      })
    }
  }, [isError])
}
export default useMailboxToasts
