/* eslint-disable no-unused-vars */
import { Client } from '../dist/client.js'
import {
  createReadlineInterface,
  getEmailOrPhone,
  initiateLogin,
  getVerificationCode,
  verifyCode,
  login,
} from '../dist/cli.js'


// const client = new Client()
// const readline = createReadlineInterface()

// const emailOrPhone = await getEmailOrPhone({ readline })
// console.log({emailOrPhone})

// const userToken = await initiateLogin({ email: emailOrPhone, client })
// console.log({userToken})

// const verificationCode = await getVerificationCode({ readline })
// console.log({verificationCode})

// const userTokenAgain = await verifyCode({ code: verificationCode, client })
// console.log({userTokenAgain})

// readline.close()

await login()