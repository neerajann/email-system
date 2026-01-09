const formatMailDate = (isoString) => {
  const date = new Date(isoString)
  const now = new Date()

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const time = timeFormatter.format(date)

  // Today
  if (isSameDay(date, now)) {
    return time
  }

  // Yesterday
  if (isSameDay(date, yesterday)) {
    return `Yesterday ${time}`
  }

  // This week
  if (date >= startOfWeek) {
    const day = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
    }).format(date)
    return `${day} ${time}`
  }

  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    const dateStr = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
    return `${dateStr}, ${time}`
  }

  // Previous years
  const fullDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)

  return `${fullDate}, ${time}`
}
export default formatMailDate
