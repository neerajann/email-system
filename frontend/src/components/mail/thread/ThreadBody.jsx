const ThreadBody = ({ mail }) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: mail.body.html, // The html is sanitized by backend so its safe
      }}
      className='mt-7 text-sm text-foreground overflow-x-auto wrap-break-word'
    />
  )
}
export default ThreadBody
