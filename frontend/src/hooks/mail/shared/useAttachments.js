import { useRef, useState } from 'react'
import {
  handleFiles,
  removeAttachment,
} from '../../../services/attachmentService'

const useAttachments = ({ email, uploadedAttachments }) => {
  const controllersRef = useRef({})
  const fileInputRef = useRef(null)
  const uploadErrorRef = useRef(null)
  const [attachmentsInfo, setAttachmentsInfo] = useState(
    uploadedAttachments || [],
  )

  const onFiles = (e) =>
    handleFiles({
      e,
      email,
      uploadErrorRef,
      controllersRef,
      setAttachmentsInfo,
    })
  const remove = (id) => {
    removeAttachment({
      id: id,
      attachmentsInfo,
      setAttachmentsInfo,
      controllersRef,
      email,
    })
  }
  return {
    attachmentsInfo,
    fileInputRef,
    uploadErrorRef,
    controllersRef,
    onFiles,
    remove,
  }
}
export default useAttachments
