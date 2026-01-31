import DOMPurify from 'dompurify'
const ThreadBody = ({ mail }) => {
  return (
    <>
      {mail.isSystem ? (
        <div
          dangerouslySetInnerHTML={{
            __html: mail.body.html,
          }}
          className='mt-7 text-sm text-foreground overflow-x-auto wrap-break-word'
        />
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(mail.body.html),
          }}
          className='mt-7 text-sm whitespace-pre-wrap text-foreground overflow-x-auto wrap-break-word'
        />
      )}
    </>
  )
}
export default ThreadBody
