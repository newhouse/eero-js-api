import { config } from '../dist/config.js'
import { Client } from '../dist/client.js'

console.log({Client})

const {
  apiKey,
  // emailOrPhone,
  // verificationCode,
  // networkUrlOrId,
  // forwardId,
} = config

const cookies = { s: apiKey }

const client = new Client({
  // cookies: {
  //   s: apiKey,
  // }
})

// console.log(client)
async function initiateLogin (emailOrPhone) {
  console.log('initiateLogin:')
  const res = await client.initiateLogin(emailOrPhone)
  console.log('client res:', JSON.stringify(res))
  console.log('client:', client)
}

async function verifyLogin (code, { cookies } = {}) {
  console.log('verifyLogin:')
  const res = await client.verifyLogin(code, { cookies })
  console.log('client res:', JSON.stringify(res))
  console.log('client:', client)
}

async function loginRefresh (_, { cookies } = {}) {
  console.log('loginRefresh:')
  const res = await client.loginRefresh({ cookies })
  console.log('client res:', JSON.stringify(res))
  console.log('client:', client)
}
async function get (path, { cookies }) {
  console.log('get:', { path })
  const res = await client.get({ path, cookies })
  console.log('client res:', JSON.stringify(res))
  console.log('client:', client)
}

async function getNetworks (_, { cookies }) {
  console.log('getNetworks:')
  await get('networks', { cookies })
}

// await verifyLogin(
//   code,
//   {
//     cookies,
//   },
// )
// await loginRefresh(undefined, { cookies })
// await getNetworks(undefined, { cookies })
await get('account', { cookies })