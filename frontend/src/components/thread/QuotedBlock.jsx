const QuotedBlock = ({ quotes, index = 0 }) => {
  if (index >= quotes.length) return null

  const q = quotes[index]

  return (
    <blockquote className='border-l pl-3 ml-3 mt-8 text-xs text-muted-foreground'>
      <div className='mb-2'>
        On{' '}
        {new Date(q.receivedAt).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}{' '}
        {q.sender?.name}{' '}
        <span className='text-foreground'>{`<${q.sender.address}>`}</span>{' '}
        wrote:
      </div>

      <div className='mb-3 whitespace-pre-wrap'>{q.body}</div>

      <QuotedBlock quotes={quotes} index={index + 1} />
    </blockquote>
  )
}

export default QuotedBlock
