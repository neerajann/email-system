import { cacheRRsets } from '../services/cacheService.js'
import dnsPacket from 'dns-packet'

const handleUpstreamResponse = async ({
  response,
  server,
  pendingRequests,
}) => {
  const decoded = dnsPacket.decode(response)
  await cacheRRsets(decoded.answers)

  const request = pendingRequests.get(decoded.id)
  if (!request) return

  server.send(response, request.port, request.address)
  pendingRequests.delete(decoded.id)
}

export { handleUpstreamResponse }
