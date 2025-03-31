import { CLIENT_ID } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'
import { v4 as uuidv4 } from 'uuid'
import Browser from 'webextension-polyfill'

export class ClientIdStore {
  clientId: string | undefined = undefined

  constructor() {
    makeAutoObservable(this)
  }

  async initClientId() {
    const storage = await Browser.storage.local.get(CLIENT_ID)
    const clientId = storage[CLIENT_ID]

    if (clientId) {
      this.setClientId(clientId)
      return
    }

    this.setClientId(uuidv4())
  }

  setClientId(clientId: string) {
    this.clientId = clientId
    Browser.storage.local.set({ [CLIENT_ID]: clientId })
  }
}

export const clientIdStore = new ClientIdStore()
