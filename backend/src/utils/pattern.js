const domain = process.env.DOMAIN_NAME
const domainEmailPattern = new RegExp(
  `^[a-zA-Z0-9.]+@${domain.replace('.', '\\.')}$`
)

const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/

export { domainEmailPattern, passwordPattern, emailPattern }
