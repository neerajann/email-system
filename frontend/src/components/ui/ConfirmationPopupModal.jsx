import { RxCross2 } from 'react-icons/rx'

const ConfirmationPopupModal = ({
  message,
  handlerFunction,
  setShowConfirmationModal,
  mailboxId,
}) => {
  const onConfirm = async () => {
    if (mailboxId) {
      handlerFunction(mailboxId)
      setShowConfirmationModal(false)
      return
    }
    handlerFunction()
    setShowConfirmationModal(false)
    return
  }

  return (
    <div className='fixed inset-0 h-dvh w-screen z-[70] flex items-center justify-center bg-black/30 backdrop-blur-xs'>
      <div className='relative bg-background text-sm font-medium  rounded-xl flex flex-col items-center justify-center shadow gap-8 border border-border w-75 md:w-auto  px-8 py-20 md:px-50 md:py-30'>
        <button
          variant='ghost'
          size='icon'
          className='border border-border p-1.5 rounded absolute top-4 right-4 hover:bg-input active:scale-[1.05] transition-all ease-in-out hover:scale-[0.95]'
          onClick={() => {
            setShowConfirmationModal(false)
          }}
        >
          <RxCross2 />
        </button>
        <h3 className='text-center'>{message}</h3>
        <div className='flex gap-10'>
          <button
            className='border border-border px-8 py-1 rounded hover:bg-input active:scale-[1.05] transition-all ease-in-out hover:scale-[0.95]'
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className='border border-border px-8 py-1 rounded hover:bg-input active:scale-[1.05] transition-all ease-in-out hover:scale-[0.95]'
            onClick={() => {
              setShowConfirmationModal(false)
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}
export default ConfirmationPopupModal
