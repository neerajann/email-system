import nodemailer from 'nodemailer'

// In memory cache storage
const transporterCache = new Map()

const getTransporterCache = ({ mxHost }) => {
  // If mxHost exist in cache, return it
  if (transporterCache.has(mxHost)) {
    return transporterCache.get(mxHost)
  }

  // Create a new transporter
  const transporter = nodemailer.createTransport({
    host: mxHost,
    port: 25,
    connectionTimeout: 5000, // If server doesnot repsond within 5 sec, fail
    tls: { rejectUnauthorized: false }, // Accept self-signed / invalid certificates. You can set this to true if you have valid certificate
    pool: true, // Reuse the connection
    maxConnections: 5, // Up to 5 simultaneous connections to this MX host
    maxMessages: 100, // Each connection can send up to 100 messages before recycling
    rateLimit: 10, // 10 message per 1000 ms
    rateDelta: 1000, // 1000 ms time window for rate limit
  })

  // Set the transporter cache with key mxHost
  transporterCache.set(mxHost, transporter)
  return transporter
}
export default getTransporterCache
