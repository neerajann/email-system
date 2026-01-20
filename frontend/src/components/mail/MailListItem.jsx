import { memo } from 'react'
import formatMailDate from '../../utils/fomatMailDate'
import { NavLink } from 'react-router-dom'
import {
  MdOutlineMarkEmailUnread,
  MdOutlineMarkEmailRead,
} from 'react-icons/md'
import { IoStarOutline, IoStarSharp, IoTrashOutline } from 'react-icons/io5'
import api from '../../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUI } from '../../contexts/UIContext'

const MailListItem = memo((props) => {
  const { mail, queryKey } = props
  const { setShowThread } = useUI()

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
            mail.threadId === threadId ? { ...mail, ...data } : mail,
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

    onSettled: (_data, _error, variables) => {
      const { threadId } = variables
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] })
      queryClient.invalidateQueries({ queryKey: ['mail'] })
    },
  })

  return (
    <NavLink
      to={mail.threadId}
      className={({ isActive }) =>
        `flex border-y border-border py-4 flex-1 items-center bg-background mb-2 group relative hover:shadow-sm min-w-0${
          isActive && 'border-r border-3 '
        }`
      }
      onClick={(e) => {
        if (window.innerWidth < 1024) {
          setShowThread(true)
        }
        mailUpdateMutation.mutate({
          threadId: mail.threadId,
          data: {
            isRead: true,
          },
        })
      }}
    >
      <div className=' flex items-center flex-1 px-10 min-w-0 w-full'>
        {/* mail content */}
        <div className='flex items-center flex-1 min-w-0 w-0'>
          <div className='mr-10 shrink-0'>
            {mail.isStarred ? <IoStarSharp /> : <IoStarOutline />}
          </div>
          <div className='flex flex-col justify-between flex-1 min-w-0 w-0'>
            <h3
              className={`text-sm truncate text-foreground mb-1.5 ${
                !mail.isRead && 'font-semibold'
              }`}
            >
              {mail.from.name ?? mail.from.address}
            </h3>
            <h3
              className={`text-sm truncate  mb-1.5 ${
                !mail.isRead && 'font-semibold'
              }`}
            >
              {mail.subject}
            </h3>
            <p className=' text-xs text-muted-foreground truncate '>
              {mail.snippet}
            </p>
          </div>
        </div>
        {/* buttons and time */}
        <div className='flex shrink-0 items-center ml-2'>
          {/* action buttons  */}
          <div className='hidden group-hover:flex items-center pointer-events-none group-hover:pointer-events-auto '>
            <button
              className=' border border-border p-2 rounded mr-2 disabled:opacity-50 cursor-pointer '
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
              className='border border-border p-2 rounded mr-2 disabled:opacity-50 cursor-pointer'
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
              className=' border border-border p-2 rounded mr-2 cursor-pointer'
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

          {/* date and time */}
          <div className='group-hover:hidden'>
            <p className={`text-xs ml-3 ${!mail.isRead && 'font-semibold'} `}>
              {formatMailDate(mail.receivedAt)}
            </p>
          </div>
        </div>
      </div>
    </NavLink>
  )
})
export default MailListItem
