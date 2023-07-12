import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

type CosmWasmClients = {
  [rpcEndpoint: string]: CosmWasmClient
}

class CosmWasmClientRouter {
  clients: CosmWasmClients = {}

  async connect(rpcEndpoint: string) {
    if (!this.getClientInstance(rpcEndpoint)) {
      this.setClientInstance(rpcEndpoint, await CosmWasmClient.connect(rpcEndpoint))
    }

    return this.getClientInstance(rpcEndpoint)
  }

  getClientInstance(rpcEndpoint: string) {
    return this.clients[rpcEndpoint]
  }
  setClientInstance(rpcEndpoint: string, client: CosmWasmClient) {
    this.clients[rpcEndpoint] = client
  }
}

export const cosmWasmClientRouter = new CosmWasmClientRouter()
