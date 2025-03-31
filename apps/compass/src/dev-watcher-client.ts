// This file is used to connect to the dev watcher server
export class DevWatcherClient {
  private socket: WebSocket | null
  private status: 'error' | 'ready' | 'connecting' | 'disconnected'

  constructor() {
    this.socket = new WebSocket('ws://localhost:6969')
    this.status = 'connecting'
    this.socket.onmessage = (e) => {
      switch (e.data) {
        case 'ready':
          this.status = 'ready'
          break
        case 'error':
          this.status = 'error'
          break
        case 'reload':
          window.location.reload()
          break
      }
    }
    this.socket.onclose = () => {
      this.status = 'disconnected'
      this.socket = null
      const interval = setInterval(() => {
        if (this.socket) {
          clearInterval(interval)
        } else {
          this.socket = new WebSocket('ws://localhost:6969')
        }
      }, 1500)
    }
  }
}
