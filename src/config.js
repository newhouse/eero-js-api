import pkg from "../package.json"

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

  userAgent: process.env.EERO_JS_API_USER_AGENT || 'eero-ios/6.51.2 (iPhone17,1; iOS 18.2.1)',
  defaultHost:  process.env.EERO_JS_API_DEFAULT_HOST || 'api-user.e2ro.com',
  defaultProtocol: process.env.EERO_JS_API_DEFAULT_PROTOCOL || 'https',
  defaultPort: process.env.EERO_JS_API_DEFAULT_PORT || false,
  defaultApiVersion: process.env.EERO_JS_API_DEFAULT_API_VERSION || '2.2',
  sessionTokenCookieKey: process.env.EERO_JS_API_SESSION_TOKEN_COOKIE_KEY || 's', // I've seen "X-User-Token" as well

  defaultCliPrompt: process.env.EERO_JS_API_DEFAULT_CLI_PROMPT || pkg.name + '> ',

  emailOrPhone: process.env.EERO_JS_API_EMAIL_OR_PHONE,
  verificationCode: process.env.EERO_JS_API_VERIFICATION_CODE,
  networkUrlOrId: process.env.EERO_JS_API_NETWORK_URL_OR_ID,
  forwardId: process.env.EERO_JS_API_FORWARD_ID,
}

export default config