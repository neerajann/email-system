const domain = import.meta.env.VITE_DOMAIN_NAME

const escapedDomain = domain.replace(/\./g, '\\.')

const domainEmailPattern = new RegExp(`^[a-zA-Z0-9.]+@${escapedDomain}$`)
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/

const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
export { domainEmailPattern, passwordPattern, emailPattern }
