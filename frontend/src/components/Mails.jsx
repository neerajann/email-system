import Mail from './Mail'

const Mails = (props) => {
  const mails = props.mails

  return (
    <div className='h-full flex-1 grid auto-rows-[90px] overflow-y-auto '>
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}{' '}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails?.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
    </div>
  )
}
export default Mails
