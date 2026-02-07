import dgram from 'node:dgram'
import { handleQuery } from './handlers/queryHandler.js'
import { handleUpstreamResponse } from './handlers/upstreamHandler.js'
import { connectDatabase } from './config/mongo.js'
import { connectRedis } from './config/redis.js'
import { loadBlockList } from './services/blocklistService.js'

await connectDatabase()
await connectRedis()
await loadBlockList()

const pendingRequests = new Map()
const server = dgram.createSocket('udp4')
const upstream = dgram.createSocket('udp4')

server.on('message', async (msg, rinfo) => {
  await handleQuery({ msg, rinfo, server, pendingRequests, upstream })
})

upstream.on('message', async (response) => {
  await handleUpstreamResponse({ response, server, pendingRequests })
})

server.on('error', (err) => {
  console.error('DNS Server error:\n', err)
})

server.bind(53, '0.0.0.0', () => {
  console.log('DNS Server running on port 53 ')
})
