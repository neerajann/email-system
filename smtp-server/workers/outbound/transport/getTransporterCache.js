import nodemailer from 'nodemailer'

const transporterCache = new Map()

const getTransporterCache = ({ mxHost }) => {
  if (transporterCache.has(mxHost)) {
    return transporterCache.get(mxHost)
  }

  const transporter = nodemailer.createTransport({
    host: mxHost,
    port: 25,
    connectionTimeout: 5000,
    tls: { rejectUnauthorized: false },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10,
    rateDelta: 1000,
  })

  transporterCache.set(mxHost, transporter)
  return transporter
}
export default getTransporterCache
