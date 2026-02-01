import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { useUI } from '../../contexts/UIContext'
import ThreadItem from '../../components/mail/thread/ThreadItem.jsx'
import ThreadActionButtons from '../../components/mail/thread/ThreadActionButtons.jsx'
import ConfirmationPopupModal from '../../components/ui/ConfirmationPopupModal'
import useThreadMessages from '../../hooks/thread/useThreadMessages.js'
import useThreadActions from '../../hooks/thread/useThreadActions.js'
import useThreadMails from '../../hooks/thread/useThreadMails.js'
import useThreadUI from '../../hooks/thread/useThreadUI.js'
import ThreadListSkeleton from '../../components/loading/skeleton/ThreadListSkeleton.jsx'
import { AnimatePresence, motion } from 'framer-motion'

const Thread = () => {
  const { showThread, setShowThread } = useUI()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    showHidden,
    showConfirmationModal,
    setShowConfirmationModal,
    setShowHidden,
  } = useThreadUI()

  const { data, isError, isLoading } = useThreadMails({ id })

  const mails = data?.mails || []

  const { patchMail, deleteForever } = useThreadActions({ mails, id })

  useEffect(() => {
    if (isError) {
      navigate('..', { relative: 'path' })
    }
  }, [isError, navigate])

  const { oldMessage, hiddenCount, latestMessages } = useThreadMessages({
    mails,
  })

  return (
    <div className='relative h-dvh w-full lg:w-auto flex flex-1  flex-col overflow-y-auto min-w-0 sm:p-7 p-2.5'>
      {isLoading ? (
        <AnimatePresence mode='wait'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeIn' }}
          >
            <ThreadListSkeleton />
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence mode='wait'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeIn' }}
          >
            <div
              className={` ${showThread ? 'flex lg:hidden' : 'hidden'} items-center justify-between mb-7 mt-2`}
            >
              <div
                className='text-sm flex items-center gap-2 border w-fit px-3 py-1.5 rounded border-border cursor-pointer hover:bg-input'
                onClick={() => {
                  setShowThread(false)
                  if (location.state?.from) {
                    navigate(location.state.from)
                  } else {
                    navigate('..', { relative: 'path' })
                  }
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

            {/*Thread header for larger devices */}
            <div className='mb-8 w-full'>
              <div className='flex items-start justify-between gap-3 mb-2'>
                <h2 className='text-xl font-semibold'>{mails[0]?.subject}</h2>
                {/* hidden on smaller */}
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
              {/* compact view of threads showing only 3 mails one oldest and 2 latest */}
              {!showHidden && hiddenCount > 0 && (
                <>
                  {/* one oldest mail */}
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
                      Show {hiddenCount} more message
                      {hiddenCount > 1 ? 's' : ''}
                    </span>
                    <div className='grow border-t border-border' />
                  </div>
                  {/* show latest 2 meessage */}
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

              {/* Show all mail in thread */}
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
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                >
                  <ConfirmationPopupModal
                    handlerFunction={deleteForever}
                    message={
                      'Are you sure you want to delete this mail forever?'
                    }
                    setShowConfirmationModal={setShowConfirmationModal}
                    mailboxId={mails[0].mailboxId}
                  />
                </motion.div>
              </AnimatePresence>
            )}

            <div className='h-40 w-full shrink-0'></div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default Thread
