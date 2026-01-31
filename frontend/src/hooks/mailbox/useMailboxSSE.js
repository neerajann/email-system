import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

const useMailboxSSE = ({ mailboxType, queryKey, didMount, refetch }) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (mailboxType !== 'inbox') return
    if (didMount.current) {
      refetch()
    } else {
      didMount.current = true
    }

    const sse = new EventSource(`${import.meta.env.VITE_API_URL}/events`, {
      withCredentials: true,
    })

    sse.onmessage = (e) => {
      const newMail = JSON.parse(e.data)
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData.pages) return oldData

        const updatedPages = oldData.pages.map((page, index) => {
          const filtered = page.mails.filter(
            (mail) => mail.mailboxId !== newMail.mailboxId,
          )
          if (index === 0) {
            return { ...page, mails: [newMail, ...filtered] }
          }
          return { ...page, mails: filtered }
        })
        return { ...oldData, pages: updatedPages }
      })
      queryClient.invalidateQueries({ queryKey: queryKey })
    }

    sse.onerror = () => {
      sse.close()
    }
    return () => sse.close()
  }, [mailboxType, queryKey])
}

export default useMailboxSSE
