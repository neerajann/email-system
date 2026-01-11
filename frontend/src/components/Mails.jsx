import Mail from './Mail'

const Mails = (props) => {
  const mails = props.data
  return (
    <div className='flex-1 mx-4 my-10 grid gap-6  h-screen auto-rows-[90px] overflow-y-auto '>
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
      {mails.length
        ? mails.map((mail) => <Mail key={mail.threadId} data={mail} />)
        : "You don't have any mails at the moment."}
    </div>
  )
}
export default Mails
