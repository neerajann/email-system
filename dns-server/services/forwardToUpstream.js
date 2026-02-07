import dnsPacket from 'dns-packet'
import { UPSTREAM_DNS } from '../config/constant.js'

const forwardToUpStream = async ({ msg, rinfo, pendingRequests, upstream }) => {
  const decoded = dnsPacket.decode(msg)
  pendingRequests.set(decoded.id, {
    address: rinfo.address,
    port: rinfo.port,
  })

  upstream.send(msg, UPSTREAM_DNS[0].port, UPSTREAM_DNS[0].address)
}

export { forwardToUpStream }
