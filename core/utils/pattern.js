const domain = process.env.DOMAIN_NAME

const escapedDomain = domain.replace(/\./g, '\\.')

const domainEmailPattern = new RegExp(`^[a-zA-Z0-9.]+@${escapedDomain}$`)

const emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/

const mongooseObjectIdPattern = /^[0-9a-fA-F]{24}$/

export {
  domainEmailPattern,
  passwordPattern,
  emailPattern,
  mongooseObjectIdPattern,
}
