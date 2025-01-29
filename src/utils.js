import crypto from 'node:crypto'

import config from './config.js'

export const createHash = (thing) => {
  if (!thing) {
    return false
  }
  if (thing.constructor.name === 'Object') {
    thing = JSON.stringify(thing)
  } else if (typeof thing !== 'string') {
    return false
  }

  return crypto.createHash('md5').update(thing).digest('hex')
}

export const logger = {
  debug: config.isProd ? () => {} : console.log,
  info: console.log,
  warn: console.log,
  error: console.error,
}