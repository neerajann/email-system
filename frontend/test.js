import axios from 'axios'

const [{ data: result1 }, { data: result2 }, { data: result3 }] =
  await Promise.all([
    axios.post('http://192.168.16.200/api/auth/register', {
      name: 'racetest1',
      emailAddress: 'race2@inboxify.com',
      password: '#Neerajan@9821',
    }),
    axios.post('http://192.168.16.200/api/auth/register', {
      name: 'racetest1',
      emailAddress: 'race2@inboxify.com',
      password: '#Neerajan@9821',
    }),
    axios.post('http://192.168.16.200/api/auth/register', {
      name: 'racetest1',
      emailAddress: 'race2@inboxify.com',
      password: '#Neerajan@9821',
    }),
  ])
console.log(result1.data)
console.log(
  '-------------------------------------------------------------------',
)
console.log(result2.data)
console.log(
  '-------------------------------------------------------------------',
)
console.log(result3.data)
