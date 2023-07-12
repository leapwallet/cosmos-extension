/**
 * Secret.js overrides fetch with a polyfill that uses XMLHttpRequest. XMLHttpRequest does not work in service workers.
 * Here we preserve the original fetch function and use it in the service worker. In the handleTx function.
 *
 * This will be imported on the first line of the background.js file.
 *
 * */
export const originalFetch = fetch
