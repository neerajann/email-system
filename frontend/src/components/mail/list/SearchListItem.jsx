import { memo } from 'react'
import highlightText from '../../../utils/highlightText.jsx'
import BaseMailListItem from './BaseMailListItem.jsx'

const SearchListItem = memo((props) => {
  const { mail, query } = props
  const highlightedSubject = highlightText(mail.subject, query)
  const highlightedSnippet = highlightText(mail.body, query)

  return (
    <BaseMailListItem
      snippet={highlightedSnippet}
      subject={highlightedSubject}
      navigateTo={`/search/${mail.mailboxId}?q=${query}`}
      {...props}
    >
      <div className='ml-2 flex gap-1.5'>
        {mail.isDeleted ? (
          <span className='border border-border px-2 py-0.5 rounded-xl text-xs'>
            Trash
          </span>
        ) : (
          mail.labels.map((label) => (
            <span
              key={label}
              className='border border-border px-2 py-0.5 rounded-xl text-xs'
            >
              {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
            </span>
          ))
        )}
      </div>
    </BaseMailListItem>
  )
})
export default SearchListItem
