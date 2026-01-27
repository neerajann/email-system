import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from './api'

const useMailUpdate = (queryKey, options = {}) => {
  const queryClient = useQueryClient()

  const { dataPath = 'mails', invalidateKeys = [['mail']] } = options

  return useMutation({
    mutationFn: ({ threadIds, data }) =>
      api.patch('/mail', { threadIds, ...data }),

    onMutate: async ({ threadIds, data }) => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old

        const mailsArray = dataPath ? old[dataPath] : old
        if (!Array.isArray(mailsArray)) return old

        const updatedMails = mailsArray.map((mail) =>
          threadIds.includes(mail.threadId) ? { ...mail, ...data } : mail,
        )

        return dataPath ? { ...old, [dataPath]: updatedMails } : updatedMails
      })

      return { previousData }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },

    onSettled: (_data, _error, variables) => {
      const { threadIds } = variables

      threadIds.forEach((threadId) => {
        queryClient.invalidateQueries({ queryKey: ['thread', threadId] })
      })

      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

export default useMailUpdate
