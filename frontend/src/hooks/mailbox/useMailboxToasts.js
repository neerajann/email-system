import { useEffect } from 'react'
import { toast } from 'react-toastify'

const useMailboxToasts = ({ isLoading, isError, error }) => {
  useEffect(() => {
    if (isLoading) {
      toast.loading('Loading...', {
        containerId: 'loading',
      })
      return
    }
    toast.dismiss()

    if (isError) {
      toast.error(error.message || 'Something went wrong', {
        containerId: 'loading',
      })
    }

    if (!isLoading && !isError) {
      toast.dismiss()
    }

    return () => toast.dismiss()
  }, [isLoading, isError])
}
export default useMailboxToasts
