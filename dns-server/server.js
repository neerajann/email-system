import dgram, { Socket } from 'node:dgram'
import dnsPacket from 'dns-packet'
import { MongoClient } from 'mongodb'
import env from 'dotenv'

env.config()

const server = dgram.createSocket('udp4')
const upstream = dgram.createSocket('udp4')

const client = new MongoClient('mongodb://127.0.0.1:27017/')
await client.connect()

const db = client.db('dns')
const records = db.collection('records')
const upstreamdns = db.collection('upstreamdns')
const blockedCollection = db.collection('blocklist')

const blockedDomains = new Set()

await loadBlockList()

server.on('message', async (msg, rinfo) => {
  try {
    const incomingMessage = dnsPacket.decode(msg)
    if (blockedDomains.has(incomingMessage.questions[0].name)) {
      return sendResponse({
        incomingMessage,
        rinfo,
        blocked: true,
      })
    }
    if (
      incomingMessage.questions[0].type == 'PTR' &&
      incomingMessage.questions[0].name == process.env.REVERSE_DNS_DOMAIN
    ) {
      return sendResponse({
        incomingMessage,
        rinfo,
        ptr: true,
      })
    }
    const recordFromDB = await findRecord(incomingMessage)
    if (!recordFromDB) {
      return await forwardToUpStream(msg, rinfo)
    } else {
      return sendResponse({
        incomingMessage,
        rinfo,
        recordFromDB: recordFromDB,
      })
    }
  } catch (error) {
    console.log(error)
  }
})

async function loadBlockList() {
  const docs = await blockedCollection
    .find({}, { projection: { name: 1 } })
    .toArray()
  blockedDomains.clear()
  for (const doc of docs) {
    blockedDomains.add(doc.name)
  }
  console.log(`Loaded ${blockedDomains.size} blocked domains`)
}

const findRecord = async (incomingMessage) => {
  return await records.findOne(
    {
      name: incomingMessage.questions[0].name,
      'records.type': incomingMessage.questions[0].type,
    },
    {
      projection: {
        records: {
          $elemMatch: { type: incomingMessage.questions[0].type },
        },
        _id: 0,
      },
    }
  )
}
const sendResponse = ({
  incomingMessage,
  rinfo,
  recordFromDB,
  ptr,
  blocked,
}) => {
  let data = recordFromDB?.records[0]?.content
  let type = incomingMessage.questions[0].type
  if (ptr) {
    type = 'PTR'
    data = process.env.DNS_DOMAIN
  }
  if (blocked) {
    data = '0.0.0.0'
    type = incomingMessage.questions[0].type
  }

  const answer = dnsPacket.encode({
    id: incomingMessage.id,
    type: 'response',
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: incomingMessage.questions,
    answers: [
      {
        type,
        class: 'IN',
        name: incomingMessage.questions[0].name,
        ttl: 300,
        data,
      },
    ],
  })
  server.send(answer, rinfo.port, rinfo.address)
}

const forwardToUpStream = async (msg, rinfo) => {
  const UPSTREAM_DNS = await upstreamdns.find({}).toArray()
  upstream.send(msg, UPSTREAM_DNS[1].port, UPSTREAM_DNS[1].address)
  upstream.on('message', (response) => {
    server.send(response, rinfo.port, rinfo.address)
  })
}

server.bind(53, () => {
  console.log('DNS Server running ')
})
