import { toast } from 'react-toastify'
import { FiXCircle, FiCheckCircle } from 'react-icons/fi'

const handleApiError = (error) => {
  if (error.response) {
    toast.error(error.response.data?.error || 'An error occured', {
      containerId: 'result',
      icon: <FiXCircle className='text-red-500' size={18} />,
    })
    return
  }
  toast.error('Network error. Please try again.', {
    containerId: 'result',
    icon: <FiXCircle className='text-red-500' size={18} />,
  })
}

const handleApiSuccess = () => {
  toast.success('Mail sent sucessfully', {
    containerId: 'result',
    icon: <FiCheckCircle size={18} className='text-green-500' />,
  })
}
export { handleApiError, handleApiSuccess }
