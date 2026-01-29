import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { useUI } from '../../contexts/UIContext'
import api from '../../services/api'
import ThreadItem from '../../components/thread/ThreadItem'
import ThreadActionButtons from '../../components/thread/ThreadActionButtons'
import useMailUpdate from '../../services/mailUpdateService'
import ConfirmationPopupModal from '../../components/ui/ConfirmationPopupModal'

const Thread = () => {
  const { showThread, setShowThread } = useUI()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showHidden, setShowHidden] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const { data, isError } = useQuery({
    queryKey: ['mail', id],
    queryFn: async () => {
      const { data } = await api.get(`/mail/${id}`)
      return data
    },

    enabled: !!id,
    retry: 1,
  })
  const emails = data?.mails || []

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
      mailboxIds: [emails[0].mailboxId],
      data,
    })
  }

  const deleteForever = async (mailboxId) => {
    await api.delete(`/mail/${mailboxId}`)
    queryClient.invalidateQueries(['mailboxes', 'trash'])
    setShowThread(false)
    navigate('..', { relative: 'path' })
  }

  let hiddenCount = 0
  let latestMessages = []
  let oldMessage = []
  if (!emails.length) return null

  if (emails.length > 3) {
    oldMessage = emails.slice(0, 1)
    hiddenCount = Math.max(0, emails.length - 3)
    latestMessages = emails.slice(emails.length - 2, emails.length)
  }
  console.log(emails[0].mailboxId)

  return (
    <div className='h-dvh w-full lg:w-auto flex flex-1 min-w-0 sm:p-7 p-2.5  flex-col overflow-y-auto '>
      <div
        className={`${showThread ? 'flex lg:hidden' : 'hidden'} items-center justify-between mb-7 mt-2`}
      >
        <div
          className='text-sm flex items-center gap-2 border w-fit px-3 py-1.5 rounded border-border cursor-pointer hover:bg-input'
          onClick={() => setShowThread(false)}
        >
          <FaArrowLeftLong />
          Back
        </div>
        <ThreadActionButtons
          email={emails[0]}
          patchMail={patchMail}
          setShowConfirmationModal={setShowConfirmationModal}
          setShowThread={setShowThread}
          navigate={navigate}
        />
      </div>

      <div className='mb-8 w-full'>
        <div
          className={`${showThread ? 'hidden lg:flex' : 'flex'} shrink-0 gap-3 ml-1 float-right`}
        >
          <ThreadActionButtons
            email={emails[0]}
            patchMail={patchMail}
            setShowConfirmationModal={setShowConfirmationModal}
            navigate={navigate}
          />
        </div>

        <h2 className='text-xl font-semibold'>{emails[0]?.subject}</h2>
      </div>

      <div className='grid gap-5 min-w-0 *:min-w-0 mb-8'>
        {!showHidden && hiddenCount > 0 && (
          <>
            {oldMessage.map((o) => {
              return (
                <ThreadItem
                  key={o.emailId}
                  email={o}
                  defaultExpanded={false}
                  emails={emails}
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
                  email={latest}
                  defaultExpanded={index === latestMessages.length - 1}
                  emails={emails}
                />
              )
            })}
          </>
        )}

        {(showHidden || hiddenCount === 0) &&
          emails.map((email, index) => {
            return (
              <ThreadItem
                key={email.emailId}
                email={email}
                defaultExpanded={index === emails.length - 1}
                emails={emails}
              />
            )
          })}
      </div>
      {showConfirmationModal && (
        <ConfirmationPopupModal
          handlerFunction={deleteForever}
          message={'Are you sure you want to delete this mail forever?'}
          setShowConfirmationModal={setShowConfirmationModal}
          mailboxId={emails[0].mailboxId}
        />
      )}
      <div className='h-40 w-full shrink-0'></div>
    </div>
  )
}

export default Thread
