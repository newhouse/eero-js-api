// https://www.npmjs.com/package/node-fetch
import nodeFetch from 'node-fetch'
import memoize from 'lodash.memoize'

import config from './config.js'
import { createHash, logger } from './utils.js'

const STASH = Symbol('og')

const {
  userAgent,
  defaultHost,
  defaultProtocol,
  defaultPort,
  defaultApiVersion,
  sessionTokenCookieKey,
} = config
const HEADERS_BASE = {}
if (userAgent) {
  HEADERS_BASE['User-Agent'] = userAgent
}
Object.freeze(HEADERS_BASE)

const memoizedFetch = memoize(
  async (...args) => {
    logger.debug('\n\n\n fetching \n\n\n')
    const response = await nodeFetch(...args)
    response[STASH] = {
      text: await response.text(),
    }
    response.text = () => response[STASH].text

    if (response[STASH].text) {
      try {
        response[STASH].json = JSON.parse(response[STASH].text)
        response.json = () => response[STASH].json
      } catch (err) {
        logger.error(err)
        // do nothing
      }
    }

    response.json = () => response[STASH].json


    return response
  },
  (url, options) => {
    return createHash({ url, options })
  }
)

const fetch = (
  url,
  {
    useCache = false,
    // setCache = true,
    ...options
  } = {},
  ...rest
) => (useCache ? memoizedFetch : nodeFetch)(url, options, ...rest)

export class Client {
  constructor ({
    protocol = defaultProtocol,
    host = defaultHost,
    port = defaultPort,

    apiVersion = defaultApiVersion,
    additionalPath,

    apiKey,

    state = {},
    cookies = {}
  } = {}) {
    this.applyOptions({
      protocol,
      host,
      port,
      apiVersion,
      additionalPath,
      apiKey,

      state,
      cookies,
    })

    this.state = state
    this.cookies = cookies
  }

  applyOptions (options = {}) {
    for (const property of [
      'protocol',
      'host',
      'port',
      'apiVersion',
      'additionalPath',
      'apiKey',
    ]) {
      if (property === 'port' && typeof options[property] === 'number') {
        options[property] = options[property] + ''
      }

      if (typeof options[property] !== 'undefined') {
        this[property] = this._stripSlashes(options[property])
      }
    }

    for (const property of ['state', 'cookies']) {
      if (typeof options[property] !== 'undefined') {
        this[property] = options[property]
      }
    }

    if (options.apiKey) {
      this.cookies ??= {}
      this.cookies[sessionTokenCookieKey] = options.apiKey
    }
  }

  async get ({
    cookies,
    useCache,
    ...buildUrlOptions
  } = {}) {
    const headers = Object.assign({}, HEADERS_BASE)

    const cookieHeader = this.getCookieHeader(cookies)
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }

    const url = this.buildUrl(buildUrlOptions)

    logger.debug('get:calling:', JSON.stringify({
      url,
      useCache,
      method: 'get',
      headers,
    }))


    const response = await fetch(url, {
      useCache,
      method: 'get',
      headers,
    })

    const {
      meta,
      data: dataOut,
      ...rest
    } = await response.json() || {}

    logger.debug('get:result:', JSON.stringify({ meta, data: dataOut, ...rest }))

    // this.handleSetCookies({ response })

    return {
      ...meta,
      ok: response.ok,
      data: dataOut,
      response,
    }
  }

  put (...args) {
    return this.postOrPut('put', ...args)
  }

  post (...args) {
    return this.postOrPut('post', ...args)
  }


  async postOrPut (method, {
    data: dataIn,
    isJson = dataIn?.constructor.name === 'Object',
    cookies,
    // useCache, // Should this be allowed in a put/post? I don't think so.
    ...buildUrlOptions
  }) {
    const headers = Object.assign({}, HEADERS_BASE)
    if (isJson) {
      headers['Content-Type'] = 'application/json'
    }

    const cookieHeader = this.getCookieHeader(cookies)
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }

    const url = this.buildUrl(buildUrlOptions)

    const body = typeof dataIn === 'string' ? dataIn : JSON.stringify(dataIn)

    logger.debug('postOrPut:calling:', JSON.stringify({
      url,
      // useCache,
      method,
      body,
      headers,
    }))

    const response = await fetch(url, {
      // useCache,
      method,
      body,
      headers,
    })

    const {
      meta,
      data: dataOut,
      ...rest
    } = await response.json() || {}

    logger.debug('post:response:', JSON.stringify({ meta, data: dataOut, ...rest }))

    this.handleSetCookies({ response })

    return {
      ...meta,
      ok: response.ok,
      data: dataOut,
      response,
    }

    // post result: Response {
    //   size: 0,
    //   [Symbol(Body internals)]: {
    //     body: PassThrough {
    //       _events: [Object],
    //       _readableState: [ReadableState],
    //       _writableState: [WritableState],
    //       allowHalfOpen: true,
    //       _maxListeners: undefined,
    //       _eventsCount: 3,
    //       [Symbol(shapeMode)]: true,
    //       [Symbol(kCapture)]: false,
    //       [Symbol(kCallback)]: null
    //     },
    //     stream: PassThrough {
    //       _events: [Object],
    //       _readableState: [ReadableState],
    //       _writableState: [WritableState],
    //       allowHalfOpen: true,
    //       _maxListeners: undefined,
    //       _eventsCount: 3,
    //       [Symbol(shapeMode)]: true,
    //       [Symbol(kCapture)]: false,
    //       [Symbol(kCallback)]: null
    //     },
    //     boundary: null,
    //     disturbed: false,
    //     error: null
    //   },
    //   [Symbol(Response internals)]: {
    //     type: 'default',
    //     url: 'https://api-user.e2ro.com/2.2/login',
    //     status: 200,
    //     statusText: 'OK',
    //     headers: {
    //       'content-length': '122',
    //       'content-type': 'application/json',
    //       date: 'Tue, 28 Jan 2025 23:24:21 GMT',
    //       server: 'envoy',
    //       'set-cookie': 's=43569287|vahjtkk0r47df17tth20308ksj; Path=/; Secure; HTTPOnly',
    //       vary: 'Origin',
    //       'x-envoy-upstream-service-time': '41',
    //       'x-request-id': '9d8198f5-ad7e-48f1-a48a-031009ef0aa7'
    //     },
    //     counter: 0,
    //     highWaterMark: 16384
    //   }
    // }
  }

  async initiateLogin (
    emailOrPhone,
    {
      path = 'login',
      force,
    } = {}
  ) {

    if (this.isLoggedIn() && !force) {
      logger.warn('Client is already logged in')
      return this.getUserToken()
    }

    // TODO: verify email/phone regex
    const {
      ok,
      data: {
        user_token: userToken,
      } = {},
      // response,
    } = await this.post({
      path,
      data: {
        login: emailOrPhone,
      }
    })

    if (!(ok && userToken)) {
      // WTF?
      return false
    }

    this.state.login ??= {}
    // This userToken and the "s" cookie that gets set seem to be the same thing
    this.state.login.userToken = userToken

    return userToken
  }

  isLoggedIn () {
    return !!(this.getSessionTokenCookieValue() && this.getUserToken())
  }

  getSessionTokenCookieValue () {
    this.cookies[sessionTokenCookieKey]
  }

  getUserToken () {
    return this.state.login.userToken || false
  }

  async verifyLogin (
    code,
    {
      path = 'login/verify',
      cookies,
    } = {},
  ) {

    // TODO: verify the code regex
    const {
      ok,
      // data,
      // response,
      // ...rest
    } = await this.post({
      path,
      data: {
        code,
      },
      cookies,
    })


    if (!(ok)) {
      // WTF?
      return false
    }

    return true
  }

  async loginRefresh ({
    path = 'login/refresh',
    cookies,
  } = {}) {
    const {
      ok,
      // data,
      data: {
        user_token: userToken,
      } = {},
      // response,
      // ...rest
    } = await this.post({
      path,
      cookies,
    })

    if (!(ok && userToken)) {
      // WTF?
      return false
    }

    this.state.login ??= {}
    // This userToken and the "s" cookie that gets set seem to be the same thing
    this.state.login.userToken = userToken

    return true
  }

  getCookieHeader (cookies = this.cookies) {

    if (!(cookies && cookies.constructor.name === 'Object')) {
      return null
    }

    return Object.entries(cookies).reduce(
      (acc, [k, v]) => {
        if (k && v) {
          acc.push(k + '=' + v)
        }
        return acc
      },
      [],
    ).join('; ') || null
  }

  handleSetCookies ({ response }) {
    for (const setCookieString of (response.headers.raw()['set-cookie'] || [])) {
      const [cookieString] = setCookieString.split(';')
      if (cookieString) {
        const idx = cookieString.indexOf('=')
        if (idx) {
          this.setCookie(cookieString.slice(0, idx), cookieString.slice(idx + 1))
        }
      }
    }
  }

  setCookie (k, v) {
    if (k && v) {
      this.cookies ??= {}
      this.cookies[k] = v
    }

    return this.cookies
  }

  buildUrl ({
    path,
    queryParams,
    ...rest
    // protocol = this.protocol,
    // host = this.host,
    // port = this.port,
    // apiVersion = this.apiVersion,
    // additionalPath = this.additionalPath,
  } = {}) {
    let url = this.buildRoot(rest)
    if (path) {
      path = this._buildPath(path)
      if (path) {
        url += '/' + path
      }
    }

    if (queryParams) {
      queryParams = (new URLSearchParams(queryParams)).toString()
      if (queryParams) {
        url += '?' + queryParams
      }
    }

    return url
  }

  buildRoot ({
    protocol = this.protocol,
    host = this.host,
    port = this.port,
    apiVersion = this.apiVersion,
    additionalPath = this.additionalPath,
  } = {}) {
    const base = this._stripSlashes(`${protocol}://${host}${port ? ':' + port : ''}`)
    const path = this._buildPath([apiVersion, additionalPath])
    return [base, path].filter(Boolean).join('/')
  }

  // Returns a path with no leading or trailing '/'
  _buildPath (paths) {
    return this._sanitizePaths(paths).join('/')
  }

  _sanitizePaths (paths) {
    if (typeof paths === 'string') {
      paths = [paths]
    }

    return (paths || []).map(path => this._sanitizePath(path)).filter(Boolean)
  }

  _sanitizePath (path) {
    if (typeof path !== 'string') {
      return false
    }

    return this._stripSlashes(path)
  }

  _stripSlashes (str) {
    if (typeof str !== 'string') {
      return str
    }

    if (str.startsWith('/')) {
      str = str.slice(1)
    }

    if (str.endsWith('/')) {
      str = str.slice(0, -1)
    }

    return str
  }
}
