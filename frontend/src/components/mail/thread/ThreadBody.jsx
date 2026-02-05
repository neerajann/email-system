const ThreadBody = ({ mail }) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: mail.body.html,
      }}
      className='mt-7 text-sm text-foreground overflow-x-auto wrap-break-word'
    />
  )
}
export default ThreadBody
