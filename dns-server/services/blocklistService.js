import { getBlocklistCollection } from '../config/mongo.js'
const blockedDomains = new Set()

const loadBlockList = async () => {
  const blockedCollection = getBlocklistCollection()

  const docs = await blockedCollection
    .find({}, { projection: { name: 1 } })
    .toArray()
  blockedDomains.clear()
  for (const doc of docs) {
    blockedDomains.add(doc.name)
  }
  console.log(`Loaded ${blockedDomains.size} blocked domains`)
}

const isBlocked = (domain) => {
  return blockedDomains.has(domain)
}

export { loadBlockList, isBlocked }
