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
import highlightText from '../../utils/highlightText'

const SearchListItem = memo((props) => {
  const { mail, query } = props
  const { setShowThread } = useUI()

  const queryClient = useQueryClient()

  const mailUpdateMutation = useMutation({
    mutationFn: ({ threadId, data }) => api.patch(`/mail/${threadId}`, data),

    onMutate: async ({ threadId, data }) => {
      await queryClient.cancelQueries({ query })

      const previousMails = queryClient.getQueryData(query)

      queryClient.setQueryData(query, (old) => {
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
        queryClient.setQueryData(query, context.previousMails)
      }
    },

    onSettled: (_data, _error, variables) => {
      const { threadId } = variables
      queryClient.invalidateQueries({ query: ['thread', threadId] })
      queryClient.invalidateQueries({ query: ['mail'] })
    },
  })

  return (
    <NavLink
      to={`/search/${mail.threadId}?q=${query}`}
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
      <div className=' flex items-center flex-1 px-5 sm:px-10 min-w-0 w-full'>
        {/* mail content */}
        <div className=' flex items-center flex-1 min-w-0 w-full'>
          <div className='mr-5 sm:mr-10 shrink-0'>
            {mail.isStarred ? <IoStarSharp /> : <IoStarOutline />}
          </div>
          <div className='flex flex-col justify-between flex-1 min-w-0 w-0'>
            <div className='flex items-center gap-1 mb-1.5  min-w-0'>
              <h3
                className={`text-sm truncate text-foreground ${
                  !mail.isRead && 'font-semibold'
                }`}
              >
                {mail.from.name ?? mail.from.address}
                {mail.messageCount > 1 && (
                  <span
                    className={`text-muted-foreground ml-2 ${!mail.isRead && 'font-semibold'}`}
                  >
                    {mail.messageCount}
                  </span>
                )}
              </h3>
              <span className='border border-border px-2 py-0.5 rounded-xl text-xs ml-2'>
                {mail.labels[0].charAt(0).toUpperCase() +
                  mail.labels[0].slice(1).toLowerCase()}
              </span>
            </div>
            <h3
              className={`text-sm truncate  mb-1.5 ${
                !mail.isRead && 'font-semibold'
              }`}
            >
              {highlightText(mail.subject, query)}
            </h3>
            <p className=' text-xs text-muted-foreground truncate '>
              {highlightText(mail.body, query)}
            </p>
          </div>
        </div>
        {/* buttons and time */}
        <div className='flex shrink-0 items-center ml-2'>
          {/* action buttons  */}
          <div className='hidden group-hover:flex items-center pointer-events-none group-hover:pointer-events-auto '>
            {/* star mail button  */}
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
            {/* trash mail button  */}
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
            {/* mail read/unread button  */}
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
export default SearchListItem
