import { useState } from 'react'

const useThreadState = ({ defaultExpanded }) => {
  const [showMore, setShowMore] = useState(false)
  const [expand, setExpand] = useState(defaultExpanded)
  const [showReply, setShowReply] = useState(false)
  const [showQuotedBlock, setShowQuotedBlock] = useState(false)
  return {
    showMore,
    setShowMore,
    expand,
    setExpand,
    showReply,
    setShowReply,
    showQuotedBlock,
    setShowQuotedBlock,
  }
}
export default useThreadState
