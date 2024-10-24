/* eslint-disable @typescript-eslint/no-explicit-any */
import { WindowPostMessageStream } from '@metamask/post-message-stream'
import PortStream from 'extension-port-stream'
import { DEBUG } from 'utils/debug'
import browser from 'webextension-polyfill'

import { isCompassWallet } from '../utils/isCompassWallet'

const WORKER_RESET_INTERVAL = 1_000
const WORKER_RESET_MESSAGE = 'WORKER_RESET_MESSAGE'

let extensionPort: any
let extensionStream: any
let pageStream: any

browser.runtime.onMessage.addListener((data, sender) => {
  if (sender.id !== browser.runtime.id) return

  if (data?.event === 'leap_keystorechange') {
    const customEvent = new CustomEvent('leap_keystorechange', { detail: {} })
    window.dispatchEvent(customEvent)
  }

  if (data?.event === 'chainChanged') {
    const customEvent = new CustomEvent('chainChanged', { detail: { data: data?.data } })
    window.dispatchEvent(customEvent)
  }

  if (data?.event === 'accountsChanged') {
    const customEvent = new CustomEvent('accountsChanged', { detail: { data: data?.data } })
    window.dispatchEvent(customEvent)
  }

  if (data?.event === 'disconnect') {
    const customEvent = new CustomEvent('disconnect', { detail: { data: data?.data } })
    window.dispatchEvent(customEvent)
  }
})

function initKeepWorkerAlive() {
  const interval = setInterval(async () => {
    try {
      await browser.runtime.sendMessage({ name: WORKER_RESET_MESSAGE })
    } catch (e: any) {
      if (e.message === 'Extension context invalidated.') {
        clearInterval(interval)
      }
    }
  }, WORKER_RESET_INTERVAL)
}

function injectScript() {
  try {
    const container = document.head || document.documentElement
    const scriptTag = document.createElement('script')
    scriptTag.setAttribute('src', chrome.runtime.getURL('injectLeap.js'))
    container.insertBefore(scriptTag, container.children[0])
    container.removeChild(scriptTag)
  } catch (e: any) {
    DEBUG('MsgDemo provider injection failed.', e)
  }
}

/**
 * Checks the doctype of the current document if it exists
 *
 * @returns {boolean} {@code true} - if the doctype is html or if none exists
 */
function doctypeCheck() {
  const { doctype } = window.document
  if (doctype) {
    return doctype.name === 'html'
  }
  return true
}

/**
 * Returns whether the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that we should not inject the provider into. This check is indifferent of
 * query parameters in the location.
 *
 * @returns {boolean} - whether or not the extension of the current document is prohibited
 */
function suffixCheck() {
  const prohibitedTypes = [
    /\.xml$/,
    /\.pdf$/,
    /\.asp$/,
    /\.jsp$/,
    /\.php$/,
    /\.md$/,
    /\.svg$/,
    /\.docx$/,
    /\.odt$/,
    /\.eml$/,
  ]
  const currentUrl = window.location.pathname
  for (let i = 0; i < prohibitedTypes.length; i += 1) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false
    }
  }
  return true
}

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} - if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName
  if (documentElement) {
    return documentElement.toLowerCase() === 'html'
  }
  return true
}

/**
 * Determines if the provider should be injected
 *
 * @returns {boolean} {@code true} - if the provider should be injected
 */
function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck()
}

/**
 * Returns a promise that resolves when the DOM is loaded (does not wait for images to load)
 */
function domIsReady() {
  // already loaded
  if (['interactive', 'complete'].includes(document.readyState)) {
    return Promise.resolve()
  }

  // wait for load
  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true }),
  )
}

// creates extension stream to connect with the inpage stream
function setupExtensionStream() {
  extensionPort = browser.runtime.connect({
    name: 'LeapCosmosExtension',
  })

  extensionStream = new PortStream(extensionPort)
  pageStream.pipe(extensionStream)
  extensionStream.pipe(pageStream)
}

function setUpPageStreams() {
  const identifier = isCompassWallet() ? 'compass' : 'leap'
  pageStream = new WindowPostMessageStream({
    name: `${identifier}:content`,
    target: `${identifier}:inpage`,
  })
}

// resets the extension stream with new streams to connect with inpage streams.
function resetExtensionStreamListeners() {
  extensionPort.onDisconnect.removeListener(resetExtensionStreamListeners)
  extensionStream.destroy()
  setupExtensionStream()
  extensionPort.onDisconnect.addListener(resetExtensionStreamListeners)
}

// creates two-way communication between leap wallet extension and the injected script. Also resets the streams if the service worker resets.
function setupStreams() {
  setUpPageStreams()
  setupExtensionStream()

  extensionPort.onDisconnect.addListener(resetExtensionStreamListeners)
}
/**
 * Sets up the stream communication and submits site metadata
 *
 */
async function start() {
  await setupStreams()
  await domIsReady()
}

if (shouldInjectProvider()) {
  injectScript()
  start()
  initKeepWorkerAlive()
}
