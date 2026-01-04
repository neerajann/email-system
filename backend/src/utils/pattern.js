const domain = process.env.DOMAIN_NAME
const domainEmailPattern = `^[a-zA-Z0-9.]+@${domain.replace('.', '\\.')}$`

const emailPattern = '^[w-.]+@([w-]+.)+[w-]{2,4}$'
const passwordPattern =
  '^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*#?&])[A-Za-zd@$!%*#?&]{6,}$'

const mongooseObjectIdPattern = '^[0-9a-fA-F]{24}$'

export {
  domainEmailPattern,
  passwordPattern,
  emailPattern,
  mongooseObjectIdPattern,
}
