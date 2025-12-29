import dgram, { Socket } from 'node:dgram'
import dnsPacket from 'dns-packet'
import { MongoClient } from 'mongodb'

const server = dgram.createSocket('udp4')

const client = new MongoClient('mongodb://127.0.0.1:27017/')
// const client = new MongoClient('mongodb://admin:qwerty@mongo:27017')
await client.connect()

const db = client.db('dns')
const records = db.collection('records')
const upstreamdns = db.collection('upstreamdns')
const blockedCollection = db.collection('blocklist')

const blockedDomains = new Set()

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
await loadBlockList()

server.on('message', async (msg, rinfo) => {
  try {
    const incomingMessage = dnsPacket.decode(msg)
    console.log(incomingMessage)
    if (blockedDomains.has(incomingMessage.questions[0].name)) {
      const answer = dnsPacket.encode({
        id: incomingMessage.id,
        type: 'response',
        flags: dnsPacket.AUTHORITATIVE_ANSWER,
        questions: incomingMessage.questions,
        answers: [
          {
            type: 'A',
            class: 'IN',
            name: incomingMessage.questions[0].name,
            data: '0.0.0.0',
            ttl: 300,
          },
        ],
      })
      return server.send(answer, rinfo.port, rinfo.address)
    }
    const ipFromDB = await records.findOne({
      name: incomingMessage.questions[0].name,
    })

    if (!ipFromDB) {
      const UPSTREAM_DNS = await upstreamdns.find({}).toArray()
      const upstream = dgram.createSocket('udp4')
      upstream.send(msg, UPSTREAM_DNS[1].port, UPSTREAM_DNS[1].address)
      upstream.on('message', (response) => {
        console.log(dnsPacket.decode(response))
        server.send(response, rinfo.port, rinfo.address)
        upstream.close()
      })
    } else {
      const answer = dnsPacket.encode({
        id: incomingMessage.id,
        type: 'response',
        flags: dnsPacket.AUTHORITATIVE_ANSWER,
        questions: incomingMessage.questions,
        answers: [
          {
            type: ipFromDB.type,
            class: 'IN',
            name: incomingMessage.questions[0].name,
            data: ipFromDB.address,
          },
        ],
      })
      server.send(answer, rinfo.port, rinfo.address)
    }
  } catch (error) {
    console.log(error)
  }
})

server.bind(53, () => {
  console.log('DNS Server running ')
})
