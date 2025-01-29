const DEVELOPMENT = 'development'
const PRODUCTION = 'production'
const TEST = 'test'

const NODE_ENV = process.env.NODE_ENV || PRODUCTION

const isDev = NODE_ENV === DEVELOPMENT
const isProd = NODE_ENV === PRODUCTION
const isTest = NODE_ENV === TEST



if (isDev || isTest) {
  require('dotenv/config')
}

export const config = {
  isDev,
  isProd,
  isTest,
  apiKey: process.env.EERO_JS_API_API_KEY,
  emailOrPhone: process.env.EERO_JS_API_EMAIL_OR_PHONE,
  verificationCode: process.env.EERO_JS_API_VERIFICATION_CODE,
  networkUrlOrId: process.env.EERO_JS_API_NETWORK_URL_OR_ID,
  forwardId: process.env.EERO_JS_API_FORWARD_ID,
}

export default config