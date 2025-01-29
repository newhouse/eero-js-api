import { config } from '../dist/config.js'
import { Eero } from '../dist/eero.js'

// console.log('Eero:', Eero)
// console.log('config:', config)

const {
  apiKey,
  emailOrPhone,
  verificationCode,
  networkUrlOrId,
  forwardId,
} = config

// console.log({
//   apiKey,
//   emailOrPhone,
//   verificationCode,
//   networkUrlOrId,
//   forwardId,
// })

const eero = new Eero({
  // apiKey,
})

// console.log(eero)

// const account = await eero.getAccount()
// console.log('getAccount:', JSON.stringify(account))

// const networks = await eero.getNetworks()
// console.log('getNetworks:', JSON.stringify(networks))

// const network = await eero.getNetwork(networkUrlOrId)
// console.log('getNetwork:', JSON.stringify(network))

// const devices = await eero.getDevices(networkUrlOrId)
// console.log('getDevices:', JSON.stringify(devices))

// const eeros = await eero.getEeros(networkUrlOrId)
// console.log('getEeros:', JSON.stringify(eeros))

// const forwards = await eero.getForwards({
//   networkId: networkUrlOrId,
// })
// console.log('getForwards:', JSON.stringify(forwards))


// const forward = await eero.getForward({
//   networkId: networkUrlOrId,
//   forwardId: 2441347,
// })
// console.log('getForward:', JSON.stringify(forward))


const enableForward = await eero.enableForward({
  networkId: networkUrlOrId,
  forwardId,
})
console.log('enableForward:', JSON.stringify(enableForward))


// const disableForward = await eero.disableForward({
//   networkId: networkUrlOrId,
//   forwardId,
// })
// console.log('disableForward:', JSON.stringify(disableForward))

// const reboot = await eero.reboot()
// console.log('reboot:', JSON.stringify(reboot))
