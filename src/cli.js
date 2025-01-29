import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

import config from './config.js'
import { Client } from '../dist/client.js'

const {
  defaultCliPrompt,
} = config


export function createReadlineInterface ({
  input: inputToUse = input,
  output: outputToUse = output,
  prompt = defaultCliPrompt,
} = {}) {
  return readline.createInterface({
    input: inputToUse,
    output: outputToUse,
    prompt,
  })
}
export async function questionAnswer ({ readline, question, ensureTruthy }) {
  let res
  do {
    res = await readline.question(question)
  } while (!res && ensureTruthy)

  return res
}

// Do the whole thing
export async function login ({
  client = new Client(),
  readline = createReadlineInterface(),
  logUserToken = true,
} = {}) {

  const emailOrPhone = await getEmailOrPhone({ readline })
  const userToken = await initiateLogin({ email: emailOrPhone, client })
  const verificationCode = await getVerificationCode({ readline })
  const userTokenAgain = await verifyCode({ code: verificationCode, client })
  if (userToken && userToken !== userTokenAgain) {
    console.error('User Tokens were not the same:', { startingUserToken: userToken, endingUserToken: userTokenAgain })
  } else {
    let msg = 'Login successful!'
    if (logUserToken) {
      msg += ` Your User Token is: "${userToken}"`
    }
    console.log(msg)
  }

  readline.close()
  return userToken
}




export function getEmailOrPhone ({ readline, ensureTruthy = true }) {
  return questionAnswer({ readline, ensureTruthy, question: 'Enter your Eero account phone number or e-mail to receive a verification code: '})
}

export async function initiateLogin ({ email, phone, client }) {
  const userToken = await client.initiateLogin(email || phone)

  if (userToken) {
    console.log(`Login initiation successful. You should receive a verifiction code soon.`)
    return userToken
  }

  console.error('Something is not right')
  return false
}

export function getVerificationCode ({ readline, ensureTruthy = true }) {
  return questionAnswer({ readline, ensureTruthy, question: 'Enter the verification code you received: ' })
}

export async function verifyCode ({ code, client }) {
  if (await client.verifyLogin(code)) {
    console.log(`Login initiation successful!`)
    return client.getUserToken()
  }

  console.error('Something is not right')
  return false
}