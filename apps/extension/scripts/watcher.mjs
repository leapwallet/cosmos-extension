// This file runs the watcher server that will send a message to the extension
// when a file in the dist folder changes. This is used to reload the extension.

import * as chokidar from 'chokidar'
import { WebSocketServer } from 'ws'

// create a websocket server
const wss = new WebSocketServer({ port: 6969 })

// use chokidar to watch the ./dist folder
const watcher = chokidar.watch('./dist', {
  // ignore dotfiles
  ignored: /(^|[/\\])\../,
  persistent: true,
})

watcher
  .on('add', () => {
    wss.clients.forEach((client) => {
      client.send('reload')
    })
  })
  .on('change', () => {
    wss.clients.forEach((client) => {
      client.send('reload')
    })
  })
  .on('unlink', () => {
    wss.clients.forEach((client) => {
      client.send('reload')
    })
  })
  .on('ready', () => {
    wss.clients.forEach((client) => {
      client.send('ready')
    })
  })

wss
  .on('listening', function () {
    // eslint-disable-next-line no-console
    console.log('watcher listening on port 6969')
  })
  .on('connection', function connection(ws) {
    ws.send('connected')
  })
