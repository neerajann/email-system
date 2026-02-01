import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api.js'

const useMailUpdate = (queryKey, options = {}) => {
  const queryClient = useQueryClient()

  const {
    invalidateKeys = [['mailboxes'], ['search']],
    isInfiniteQuery = true,
  } = options

  return useMutation({
    mutationFn: ({ mailboxIds, data }) => {
      if (!mailboxIds || mailboxIds.length === 0) {
        return Promise.resolve(null)
      }

      return api.patch('/mail', { mailboxIds, ...data })
    },

    onMutate: async ({ mailboxIds, data }) => {
      try {
        if (!mailboxIds || mailboxIds.length === 0) return
        await queryClient.cancelQueries({ queryKey })

        const previousData = queryClient.getQueryData(queryKey)

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old

          if (isInfiniteQuery) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                mails: page.mails.map((mail) =>
                  mailboxIds.includes(mail.id) ? { ...mail, ...data } : mail,
                ),
              })),
            }
          }

          const updatedMails = old.mails.map((mail) =>
            mailboxIds.includes(mail.id) ? { ...mail, ...data } : mail,
          )

          return { ...old, mails: updatedMails }
        })
        return { previousData }
      } catch (error) {
        console.log(error)
      }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },

    onSettled: (_data, _error, variables) => {
      const { mailboxIds } = variables
      if (!mailboxIds || mailboxIds.length === 0) return

      mailboxIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ['mail', id] })
      })

      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

export default useMailUpdate
