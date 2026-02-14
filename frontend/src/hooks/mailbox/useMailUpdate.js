import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api.js'

const useMailUpdate = (queryKey, options = {}) => {
  const queryClient = useQueryClient()

  const {
    invalidateKeys = [['mailboxes'], ['search']], // Additional queries to refresh after update
    isInfiniteQuery = true, // Whether the queryKey points to an infinite query
  } = options

  return useMutation({
    mutationFn: ({ mailboxIds, data }) => {
      if (!mailboxIds || mailboxIds.length === 0) {
        return Promise.resolve(null)
      }

      return api.patch('/mail', { mailboxIds, ...data })
    },

    // Optimistically update UI before server responds
    onMutate: async ({ mailboxIds, data }) => {
      try {
        if (!mailboxIds || mailboxIds.length === 0) return
        // Cancel outgoing refetches to avoid overwriting optimistic update
        await queryClient.cancelQueries({ queryKey })

        const previousData = queryClient.getQueryData(queryKey)

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old

          // Handle paginated infinite query structure
          if (isInfiniteQuery) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                mails: page.mails.map((mail) =>
                  mailboxIds.includes(mail.mailboxId)
                    ? { ...mail, ...data }
                    : mail,
                ),
              })),
            }
          }
          // Handle regular query structure
          const updatedMails = old.mails.map((mail) =>
            mailboxIds.includes(mail.mailboxId) ? { ...mail, ...data } : mail,
          )

          return { ...old, mails: updatedMails }
        })
        // Return previous data for potential rollback
        return { previousData }
      } catch (error) {
        console.log(error)
      }
    },

    // Rollback optimistic update if mutation fails
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },

    // Refetch related queries after mutation completes (success or failure)
    onSettled: (_data, _error, variables) => {
      const { mailboxIds } = variables
      if (!mailboxIds || mailboxIds.length === 0) return

      // Refresh individual mail queries
      mailboxIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ['mail', id] })
      })

      // Refresh mailboxes and search results (All mailboxes are refetched cause we don't know what and where it actually changed)
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

export default useMailUpdate
