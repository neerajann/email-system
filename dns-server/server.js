import dgram from 'node:dgram'
import dnsPacket from 'dns-packet'
import { MongoClient } from 'mongodb'
import env from 'dotenv'
import Redis from 'ioredis'
env.config({ quiet: true })

const server = dgram.createSocket('udp4')
const upstream = dgram.createSocket('udp4')

const client = new MongoClient(process.env.MONGO_DB_URL)
await client.connect()

const db = client.db('dns')
const records = db.collection('records')

const UPSTREAM_DNS = [
  {
    address: '1.1.1.1',
    port: 53,
  },
  {
    address: '8.8.8.8',
    port: 53,
  },
]

const redis = new Redis({
  maxRetriesPerRequest: null,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

const pendingRequests = new Map()
const blockedDomains = new Set()

const blockedCollection = db.collection('blocklist')
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

    const recordFromDB = await findRecord({
      name: incomingMessage.questions[0].name,
      type: incomingMessage.questions[0].type,
    })

    if (recordFromDB) {
      return sendResponse({
        incomingMessage,
        rinfo,
        rrset: recordFromDB,
      })
    }

    const rrset = await resolveRRset({
      name: incomingMessage.questions[0].name,
      type: incomingMessage.questions[0].type,
    })

    if (rrset) {
      console.log(
        'Question',
        incomingMessage.questions[0].name,
        incomingMessage.questions[0].type,
      )

      console.log('From cache', rrset)
      return sendResponse({
        incomingMessage,
        rinfo,
        rrset,
      })
    }

    return await forwardToUpStream(msg, rinfo)
  } catch (error) {
    console.log(error)
  }
})

const findRecord = async ({ name, type }) => {
  if (type === 'PTR') {
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
    const ipAddress = octets.join('.')

    const result = await records.findOne(
      {
        'records.type': 'A',
        'records.content': ipAddress,
      },
      {
        projection: {
          name: 1,
          _id: 0,
        },
      },
    )

    return result
  }

  return await records.findOne(
    {
      name: name,
      'records.type': type,
    },
    {
      projection: {
        records: {
          $elemMatch: { type },
        },
        _id: 0,
      },
    },
  )
}

const sendResponse = ({ incomingMessage, rinfo, blocked, rrset }) => {
  const questions = incomingMessage.questions[0]
  const qtype = questions.type
  let answers = []

  if (blocked) {
    answers.push({
      name: questions.name,
      type: 'A',
      class: 'IN',
      ttl: 20,
      data: '0.0.0.0',
    })
  } else if (qtype === 'PTR') {
    answers = rrset.records.map((r) => ({
      name: questions.name,
      type: 'PTR',
      class: 'IN',
      ttl: r.ttt ?? 20,
      data: r.content,
    }))
  } else if (qtype === 'MX') {
    answers = rrset.records.map((r) => ({
      name: questions.name,
      type: 'MX',
      class: 'IN',
      ttl: r.ttl ?? 30,
      data: {
        preference: r.priority ?? 10,
        exchange: r.content,
      },
    }))
  } else if (qtype === 'TXT') {
    answers = rrset.records.flatMap((r) => {
      let txtData = r.content
      if (!Array.isArray(txtData)) txtData = [txtData]

      const splitData = []
      for (const str of txtData) {
        if (Buffer.byteLength(str) <= 255) {
          splitData.push(str)
        } else {
          for (let i = 0; i < str.length; i += 255) {
            splitData.push(str.substring(i, i + 255))
          }
        }
      }
      return splitData.map((data) => ({
        name: questions.name,
        type: 'TXT',
        class: 'IN',
        ttl: r.ttl ?? 50,
        data,
      }))
    })
  } else {
    answers = rrset.records.map((r) => ({
      name: questions.name,
      type: qtype,
      class: 'IN',
      ttl: r.ttl ?? 50,
      data: r.content,
    }))
  }

  const response = dnsPacket.encode({
    id: incomingMessage.id,
    type: 'response',
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: [questions],
    answers,
  })
  server.send(response, rinfo.port, rinfo.address)
}

const resolveRRset = async ({ name, type }) => {
  const rrsetStr = await redis.get(`${name}:${type}`)

  if (rrsetStr) {
    const rrset = JSON.parse(rrsetStr)
    return {
      records: rrset.map((data) => ({
        type,
        content: data,
      })),
    }
  }
  const cnameStr = await redis.get(`${name}:CNAME`)
  if (cnameStr) {
    const cname = JSON.parse(cnameStr)
    return resolveRRset({ name: cname, type })
  }
  return null
}

const forwardToUpStream = async (msg, rinfo) => {
  const decoded = dnsPacket.decode(msg)
  pendingRequests.set(decoded.id, {
    address: rinfo.address,
    port: rinfo.port,
  })

  upstream.send(msg, UPSTREAM_DNS[0].port, UPSTREAM_DNS[0].address)
}

upstream.on('message', async (response) => {
  const decoded = dnsPacket.decode(response)
  const rrsets = {}
  for (const rr of decoded.answers) {
    const key = `${rr.name}:${rr.type}`
    if (!rrsets[key]) rrsets[key] = []
    rrsets[key].push(rr.data)
  }

  for (const [key, dataArray] of Object.entries(rrsets)) {
    const ttl = Math.min(
      ...decoded.answers
        .filter((r) => `${r.name}:${r.type}===key`)
        .map((r) => r.ttl),
    )
    if (ttl > 0) {
      await redis.set(key, JSON.stringify(dataArray), 'EX', ttl)
    }
  }

  const request = pendingRequests.get(decoded.id)
  if (!request) return

  server.send(response, request.port, request.address)
  pendingRequests.delete(decoded.id)
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

server.on('error', (err) => {
  console.error('DNS Server error:\n', err)
})

server.bind(53, '0.0.0.0', () => {
  console.log('DNS Server running on port 53 ')
})
