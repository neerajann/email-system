import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { useUI } from '../../contexts/UIContext'
import api from '../../services/api.js'
import ThreadItem from '../../components/mail/thread/ThreadItem.jsx'
import ThreadActionButtons from '../../components/mail/thread/ThreadActionButtons.jsx'
import useMailUpdate from '../../hooks/mailbox/useMailUpdate.js'
import ConfirmationPopupModal from '../../components/ui/ConfirmationPopupModal'

const Thread = () => {
  const { showThread, setShowThread } = useUI()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showHidden, setShowHidden] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const { data, isError, isLoading } = useQuery({
    queryKey: ['mail', id],
    queryFn: async () => {
      const { data } = await api.get(`/mail/${id}`)
      return data
    },

    enabled: !!id,
    retry: 1,
  })

  const mails = data?.mails || []

  useEffect(() => {
    if (isError) {
      navigate('..', { relative: 'path' })
    }
  }, [isError, navigate])

  const patchMailMutation = useMailUpdate(['mail', id], {
    isInfiniteQuery: false,
  })
  const patchMail = (e, data) => {
    e.preventDefault()
    e.stopPropagation()
    patchMailMutation.mutate({
      mailboxIds: [mails[0].mailboxId],
      data,
    })
  }

  const deleteForever = async (mailboxId) => {
    await api.delete(`/mail/${mailboxId}`)
    queryClient.invalidateQueries(['mailboxes', 'trash'])
    setShowThread(false)
    navigate('..', { relative: 'path' })
  }

  if (isLoading) {
    return (
      <div className='h-dvh w-full lg:w-auto flex flex-1 min-w-0 sm:p-7 p-2.5  items-center justify-center text-sm text-muted-foreground '>
        Loading please wait...
      </div>
    )
  }

  let hiddenCount = 0
  let latestMessages = []
  let oldMessage = []
  if (!mails.length) return null

  if (mails.length > 3) {
    oldMessage = mails.slice(0, 1)
    hiddenCount = Math.max(0, mails.length - 3)
    latestMessages = mails.slice(mails.length - 2, mails.length)
  }

  return (
    <div className='h-dvh w-full lg:w-auto flex flex-1 min-w-0 sm:p-7 p-2.5  flex-col overflow-y-auto '>
      <div
        className={`${showThread ? 'flex lg:hidden' : 'hidden'} items-center justify-between mb-7 mt-2`}
      >
        <div
          className='text-sm flex items-center gap-2 border w-fit px-3 py-1.5 rounded border-border cursor-pointer hover:bg-input'
          onClick={() => {
            setShowThread(false)
            navigate('..', { relative: 'path' })
          }}
        >
          <FaArrowLeftLong />
          Back
        </div>
        <ThreadActionButtons
          mail={mails[0]}
          patchMail={patchMail}
          setShowConfirmationModal={setShowConfirmationModal}
          setShowThread={setShowThread}
          navigate={navigate}
        />
      </div>

      <div className='mb-8 w-full'>
        <div className='flex items-start justify-between gap-3 mb-2'>
          <h2 className='text-xl font-semibold'>{mails[0]?.subject}</h2>
          <div
            className={`${showThread ? 'hidden lg:flex' : 'flex'} shrink-0 gap-3`}
          >
            <ThreadActionButtons
              mail={mails[0]}
              patchMail={patchMail}
              setShowConfirmationModal={setShowConfirmationModal}
              navigate={navigate}
              setShowThread={setShowThread}
            />
          </div>
        </div>
      </div>

      <div className='grid gap-5 min-w-0 *:min-w-0 mb-8'>
        {!showHidden && hiddenCount > 0 && (
          <>
            {oldMessage.map((o) => {
              return (
                <ThreadItem
                  key={o.emailId}
                  mail={o}
                  defaultExpanded={false}
                  mails={mails}
                />
              )
            })}
            <div
              className='flex items-center text-sm text-muted-foreground cursor-pointer my-2'
              onClick={() => setShowHidden(true)}
            >
              <div className='grow border-t border-border' />
              <span className='px-2 hover:text-foreground text-xs'>
                Show {hiddenCount} more message{hiddenCount > 1 ? 's' : ''}
              </span>
              <div className='grow border-t border-border' />
            </div>
            {latestMessages.map((latest, index) => {
              return (
                <ThreadItem
                  key={latest.emailId}
                  mail={latest}
                  defaultExpanded={index === latestMessages.length - 1}
                  mails={mails}
                />
              )
            })}
          </>
        )}

        {(showHidden || hiddenCount === 0) &&
          mails.map((mail, index) => {
            return (
              <ThreadItem
                key={mail.emailId}
                mail={mail}
                defaultExpanded={index === mails.length - 1}
                mails={mails}
              />
            )
          })}
      </div>
      {showConfirmationModal && (
        <ConfirmationPopupModal
          handlerFunction={deleteForever}
          message={'Are you sure you want to delete this mail forever?'}
          setShowConfirmationModal={setShowConfirmationModal}
          mailboxId={mails[0].mailboxId}
        />
      )}
      <div className='h-40 w-full shrink-0'></div>
    </div>
  )
}

export default Thread
