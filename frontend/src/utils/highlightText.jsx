const highlightText = (text = '', query = '') => {
  if (!query) return text
  const snippet = createSnippet(text, query)
  const regex = new RegExp(
    `(${query
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .split(/\s+/)
      .join('|')})`,
    'gi',
  )
  const parts = snippet.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className='bg-[#FFEB3B] text-black'>
        {part}
      </span>
    ) : (
      part
    ),
  )
}
export default highlightText

function createSnippet(text, query, snippetLength = 200) {
  const regex = new RegExp(query, 'i')
  const match = text.match(regex)

  if (match) {
    let start = match.index - Math.floor(snippetLength / 2)
    if (start < 0) start = 0

    let end = start + snippetLength
    if (end > text.length) {
      end = text.length
      start = Math.max(0, end - snippetLength)
    }

    return text.substring(start, end)
  }

  return text.substring(0, snippetLength)
}
