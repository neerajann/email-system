const parsePTRQuery = (name) => {
  const suffix = '.in-addr.arpa'
  if (!name.endsWith(suffix)) {
    return null
  }
  const labels = name.slice(0, -suffix.length).split('.')
  if (labels.length !== 4) return null
  const octets = labels.reverse()

  for (const o of octets) {
    const n = Number(o)
    if (!Number.isInteger(n) || n < 0 || n > 255) return null
  }
  return octets.join('.')
}

export { parsePTRQuery }
