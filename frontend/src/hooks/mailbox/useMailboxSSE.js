import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

const useMailboxSSE = ({ mailboxType, queryKey }) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    // SSE only needed for inbox to show new incoming mail in real-time
    if (mailboxType !== 'inbox') return
    const sse = new EventSource(
      `${import.meta.env.VITE_API_URL || '/api'}/events`,
      {
        withCredentials: true,
      },
    )

    sse.onmessage = (e) => {
      const newMail = JSON.parse(e.data)
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData.pages) return oldData
        // Invalidate the individual mail's query to refresh its details
        queryClient.invalidateQueries(['mail', newMail.mailboxId])

        const updatedPages = oldData.pages.map((page, index) => {
          // Remove any existing instance of this mail (in case of updates)
          const filtered = page.mails.filter(
            (mail) => mail.mailboxId !== newMail.mailboxId,
          )
          // Add new mail to top of first page only
          if (index === 0) {
            return { ...page, mails: [newMail, ...filtered] }
          }
          return { ...page, mails: filtered }
        })
        return { ...oldData, pages: updatedPages }
      })
    }

    sse.onerror = () => {
      sse.close()
    }
    return () => sse.close()
  }, [mailboxType, queryKey])
}

export default useMailboxSSE
