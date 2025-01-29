import config from './config.js'
import { Client } from './client.js'

export class Eero {

  constructor ({
    userToken, // alias for apiKey
    apiKey = userToken || config.apiKey, // convenience option for adding the session header to the cookies
    // code,
    client,
    clientOptions,
  } = {}) {
    this.client = client || new Client()
    if (apiKey) {
      clientOptions ??= {}
      clientOptions.apiKey = apiKey
    }

    if (clientOptions) {
      this.client.applyOptions(clientOptions)
    }
  }

  // LOGIN / AUTH STUFF

  async initiateLogin (emailOrPhone) {
    return this.client.initiateLogin(emailOrPhone)
  }

  async verifyLogin (verificationCode) {
    return this.client.verifyLogin(verificationCode)
  }

  async loginRefresh () {
    return this.client.loginRefresh()
  }

  // GETS

  async getAccount ({ useCache } = {}) {
    return this.client.get({ path: 'account', useCache })
  }

  async getNetworks ({ useCache } = {}) {
    return this.client.get({ path: 'networks', useCache })
  }

  async getNetwork ({ networkUrl, networkId, useCache }) {
    const networkPath = getNetworkPath(networkUrl || networkId)
    if (!networkPath) {
      return false
    }

    return this.client.get({ path: networkPath, useCache })
  }

  async getDevices ({ networkUrl, networkId, useCache }) {
    const networkPath = getNetworkPath(networkUrl || networkId)
    if (!networkPath) {
      return false
    }

    return this.client.get({ path: `${networkPath}/devices`, useCache })
  }

  async getEeros ({ networkUrl, networkId, useCache }) {
    const networkPath = getNetworkPath(networkUrl || networkId)
    if (!networkPath) {
      return false
    }

    return this.client.get({ path: `${networkPath}/eeros`, useCache })
  }

  async getForwards ({
    networkUrl,
    networkId,
    useCache,
  }) {
    const networkPath = getNetworkPath(networkId || networkUrl)
    if (!networkPath) {
      return false
    }

    return this.client.get({ path: `${networkPath}/forwards`, useCache })
  }

  async getForward ({
    networkUrl,
    networkId,
    forwardId,
    useCache,
  }) {
    if (!forwardId) {
      return false
    }

    if (typeof forwardId === 'number') {
      forwardId += ''
    }

    const forwards = await this.getForwards({
      networkUrl,
      networkId,
      useCache,
    })

    if (!(forwards.ok && Array.isArray(forwards.data))) {
      return false
    }

    const forward = forwards.data.find((forward) => extractForwardId(forward?.url) === forwardId)
    if (!forward) {
      return false
    }

    return {
      ok: true,
      data: forward,
    }
  }

  async enableForward (options) {
    return this._xableForward({
      ...options,
      enabled: true,
    })
  }

  async disableForward (options) {
    return this._xableForward({
      ...options,
      enabled: false,
    })
  }

  async _xableForward ({
    enabled,

    networkUrl,
    networkId,

    forwardId,

    useCache,

    ...rest
    // description,
    // clientPort,
    // gatewayPort,
    // protocol,
  }) {
    const networkPath = getNetworkPath(networkId || networkUrl)
    if (!networkPath) {
      return false
    }

    if (!forwardId) {
      return false
    }

    const requiredData = {
      enabled,
    }
    let forward

    for (const [propertyOptionName, propertyApiName] of [
      ['description', 'description'],
      ['clientPort', 'client_port'],
      ['gatewayPort', 'gateway_port'],
      ['protocol', 'protocol'],
      ['ip', 'ip'],
    ]) {

      if (typeof rest[propertyOptionName] === 'undefined') {
        forward ??= await this.getForward({
          networkId,
          networkUrl,
          forwardId,
        })
        if (forward && typeof forward.data[propertyApiName] !== 'undefined') {
          requiredData[propertyApiName] = forward.data[propertyApiName]
        }
      } else {
        requiredData[propertyApiName] = rest[propertyOptionName]
      }
    }

    return this.client.put({
      path: `${networkPath}/forwards/${forwardId}`,
      data: requiredData,
      useCache,
    })
  }

  async reboot (deviceId) {
    if (!deviceId) {
      return false
    }
    return this.client.get({ path: `eeros/${deviceId}/reboot` })
  }
}

function getNetworkPath (networkUrlOrId) {
  const networkId = extractNetworkId(networkUrlOrId)
  if (!networkId) {
    return false
  }

  return `networks/${networkId}`
}

function extractNetworkId (networkUrlOrId) {
  return extractId(networkUrlOrId, '/networks/')
}


function extractForwardId (networkUrlOrId) {
  return extractId(networkUrlOrId, '/forwards/')
}

function extractId (networkUrlOrId, splitPattern) {
  if (!networkUrlOrId) {
    return false
  }

  switch (typeof networkUrlOrId) {
    case 'string': {
      // Get just the ID in case it's the full "url"
      return networkUrlOrId.split(splitPattern).pop()
    }

    case 'number': {
      // Coerce to a string
      return networkUrlOrId += ''
    }

    default: {
      return false
    }
  }
}