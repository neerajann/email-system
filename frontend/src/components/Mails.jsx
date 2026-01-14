import Mail from './Mail'

const Mails = (props) => {
  const mails = props.mails

  return (
    <div className='h-full flex-1 grid auto-rows-[90px] overflow-y-auto '>
      {mails?.length ? (
        mails.map((mail) => (
          <Mail key={mail.threadId} queryKey={props.queryKey} mail={mail} />
        ))
      ) : (
        <div className=' flex h-full  justify-center items-center '>
          No emails in this folder
        </div>
      )}
    </div>
  )
}
export default Mails
