import { useEffect } from 'react'
import { toast } from 'react-toastify'

const useMailboxToasts = ({ isError, error }) => {
  useEffect(() => {
    if (isError) {
      toast.error(error.message || 'Something went wrong', {
        containerId: 'error',
      })
    }
    if (isError) {
      toast.dismiss()
    }

    return () => toast.dismiss()
  }, [isError])
}
export default useMailboxToasts
