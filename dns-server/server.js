import dgram, { Socket } from 'node:dgram'
import dnsPacket from 'dns-packet'
import { MongoClient } from 'mongodb'
import env from 'dotenv'

env.config({ quiet: true })

const server = dgram.createSocket('udp4')
const upstream = dgram.createSocket('udp4')

const client = new MongoClient('mongodb://127.0.0.1:27017/')
await client.connect()

const db = client.db('dns')
const records = db.collection('records')
const upstreamdns = db.collection('upstreamdns')
const blockedCollection = db.collection('blocklist')

const pendingRequests = new Map()
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
      })
    }
    const recordFromDB = await findRecord(incomingMessage)

    if (!recordFromDB) {
      return await forwardToUpStream(msg, rinfo)
    } else {
      return sendResponse({
        incomingMessage,
        rinfo,
        recordFromDB,
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
const sendResponse = ({ incomingMessage, rinfo, recordFromDB, blocked }) => {
  let answers
  const questions = incomingMessage.questions[0]
  const qtype = questions.type
  if (blocked) {
    answers = [
      {
        data: '0.0.0.0',
        type: 'A',
        name: questions.name,
        ttl: 10,
        class: 'IN',
      },
    ]
  } else if (qtype == 'PTR') {
    answers = [
      {
        type: qtype,
        data: process.env.DNS_DOMAIN,
        name: questions.name,
        ttl: 10,
        class: 'IN',
      },
    ]
  } else if (qtype == 'MX') {
    answers = [
      {
        type: qtype,
        class: 'IN',
        name: questions.name,
        ttl: 10,
        data: {
          preference: recordFromDB.records[0].priority ?? 10,
          exchange: recordFromDB.records[0].content,
        },
      },
    ]
  } else {
    answers = [
      {
        type: qtype,
        class: 'IN',
        name: questions.name,
        ttl: 50,
        data: recordFromDB.records[0].content,
      },
    ]
  }

  const answer = dnsPacket.encode({
    id: incomingMessage.id,
    type: 'response',
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: [questions],
    answers,
  })
  server.send(answer, rinfo.port, rinfo.address)
}

const forwardToUpStream = async (msg, rinfo) => {
  const UPSTREAM_DNS = await upstreamdns.find({}).toArray()

  const decoded = dnsPacket.decode(msg)
  pendingRequests.set(decoded.id, {
    address: rinfo.address,
    port: rinfo.port,
  })

  upstream.send(msg, UPSTREAM_DNS[1].port, UPSTREAM_DNS[1].address)
}

upstream.on('message', (response) => {
  const decoded = dnsPacket.decode(response)
  const request = pendingRequests.get(decoded.id)

  if (!request) return

  server.send(response, request.port, request.address)
  pendingRequests.delete(decoded.id)
})

server.bind(53, () => {
  console.log('DNS Server running ')
})
