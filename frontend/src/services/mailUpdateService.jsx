import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from './api'

const useMailUpdate = (queryKey, options = {}) => {
  const queryClient = useQueryClient()

  const {
    invalidateKeys = [['mailboxes'], ['search']],
    isInfiniteQuery = true,
  } = options

  return useMutation({
    mutationFn: ({ mailboxIds, data }) =>
      api.patch('/mail', { mailboxIds, ...data }),

    onMutate: async ({ mailboxIds, data }) => {
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
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },

    onSettled: (_data, _error, variables) => {
      const { mailboxIds } = variables

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
