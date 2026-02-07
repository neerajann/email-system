import { getRedis } from '../config/redis.js'

const resolveRRset = async ({ name, type }) => {
  const cache = getRedis()
  const rrsetStr = await cache.get(`${name}:${type}`)

  if (rrsetStr) {
    const rrset = JSON.parse(rrsetStr)
    return {
      records: rrset.map((data) => {
        let content = data
        if (
          data &&
          typeof data === 'object' &&
          data.type === 'Buffer' &&
          Array.isArray(data.data)
        ) {
          content = Buffer.from(data.data)
        }
        return {
          type,
          content,
        }
      }),
    }
  }

  const cnameStr = await cache.get(`${name}:CNAME`)
  if (cnameStr) {
    const cname = JSON.parse(cnameStr)
    return resolveRRset({ name: cname, type })
  }
  return null
}

const cacheRRsets = async (answers) => {
  const cache = getRedis()
  const rrsets = {}

  for (const rr of answers) {
    const key = `${rr.name}:${rr.type}`
    if (!rrsets[key]) rrsets[key] = []
    rrsets[key].push(rr.data)
  }

  for (const [key, dataArray] of Object.entries(rrsets)) {
    const ttl = Math.min(
      ...answers.filter((r) => `${r.name}:${r.type}===key`).map((r) => r.ttl),
    )
    if (ttl > 0) {
      await cache.set(key, JSON.stringify(dataArray), 'EX', ttl)
    }
  }
}
export { resolveRRset, cacheRRsets }
