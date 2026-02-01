import { useState } from 'react'
const useThreadUI = () => {
  const [showHidden, setShowHidden] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  return {
    showHidden,
    setShowHidden,
    setShowConfirmationModal,
    showConfirmationModal,
  }
}
export default useThreadUI
