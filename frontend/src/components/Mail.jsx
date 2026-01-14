import { memo } from 'react'
import formatMailDate from '../utils/fomatMailDate'
import { Link } from 'react-router-dom'
import {
  MdOutlineMarkEmailUnread,
  MdOutlineMarkEmailRead,
} from 'react-icons/md'
import { IoStarOutline, IoStarSharp, IoTrashOutline } from 'react-icons/io5'
import api from '../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const Mail = memo((props) => {
  const { mail, queryKey } = props

  const queryClient = useQueryClient()

  const mailUpdateMutation = useMutation({
    mutationFn: ({ threadId, data }) => api.patch(`/mail/${threadId}`, data),

    onMutate: async ({ threadId, data }) => {
      await queryClient.cancelQueries({ queryKey })

      const previousMails = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old) => {
        if (!old || !Array.isArray(old.mails)) return old

        return {
          ...old,
          mails: old.mails.map((mail) =>
            mail.threadId === threadId ? { ...mail, ...data } : mail
          ),
        }
      })

      return { previousMails }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousMails) {
        queryClient.setQueryData(queryKey, context.previousMails)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['mail'] })
    },
  })

  return (
    <Link
      to={mail.threadId}
      className='flex border-y border-border py-4 flex-1   justify-center items-center bg-background mb-2 group relative'
    >
      <div className=' flex  items-center  flex-1 px-10   justify-between'>
        <div className='flex items-center'>
          <div className='mr-10'>
            {mail.isStarred ? <IoStarSharp /> : <IoStarOutline />}
          </div>
          <div className='flex flex-col justify-between'>
            <h3 className='font-medium text-sm truncate text-foreground mb-1'>
              {mail.from.name ?? mail.from.address}
            </h3>
            <h3 className='text-sm truncate text-muted-foreground mb-1'>
              {mail.subject}
            </h3>
            <p className=' text-xs text-muted-foreground line-clamp-1 '>
              {mail.snippet}
            </p>
          </div>
        </div>
        <div className='flex items-center '>
          <div className=' lg:opacity-0 group-hover:opacity-100 transition-all ease-in relative z-100'>
            <button
              className=' border border-border p-2 rounded mr-2 disabled:opacity-50'
              disabled={mail.isDeleted}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                mailUpdateMutation.mutate({
                  threadId: mail.threadId,
                  data: {
                    isStarred: !mail.isStarred,
                  },
                })
              }}
            >
              <IoStarOutline />
            </button>
            <button
              disabled={mail.isDeleted}
              className='border border-border p-2 rounded mr-2 disabled:opacity-50'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                mailUpdateMutation.mutate({
                  threadId: mail.threadId,
                  data: {
                    isDeleted: true,
                  },
                })
              }}
            >
              <IoTrashOutline />
            </button>
            <button
              className=' border border-border p-2 rounded mr-2 '
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                mailUpdateMutation.mutate({
                  threadId: mail.threadId,
                  data: {
                    isRead: !mail.isRead,
                  },
                })
              }}
            >
              {mail.isRead ? (
                <MdOutlineMarkEmailUnread />
              ) : (
                <MdOutlineMarkEmailRead />
              )}
            </button>
          </div>
          <p className='text-xs ml-3'>{formatMailDate(mail.receivedAt)}</p>
        </div>
      </div>
    </Link>
  )
})
export default Mail
