import { makeObservable, observable } from 'mobx';

const nmsRestEndpointUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/node-management-service/nms-REST.json';
const nmsRpcEndpointUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/node-management-service/nms-RPC.json';

export class NmsStore {
  restEndpoints: Record<string, { nodeId: number; nodeProvider: string | null; nodeUrl: string }[]> = {};
  rpcEndPoints: Record<string, { nodeId: number; nodeProvider: string | null; nodeUrl: string }[]> = {};
  readyPromise: Promise<[void, void]>;

  constructor() {
    makeObservable({
      restEndpoints: observable.shallow,
      rpcEndPoints: observable.shallow,
    });
    this.readyPromise = Promise.all([this.loadRestEndpoints(), this.loadRpcEndpoints()]);
  }

  async loadRestEndpoints() {
    try {
      const response = await fetch(nmsRestEndpointUrl);
      const data = await response.json();
      this.restEndpoints = data;
    } catch (error) {
      console.error('Error loading rest endpoints', error);
    }
  }

  async loadRpcEndpoints() {
    try {
      const response = await fetch(nmsRpcEndpointUrl);
      const data = await response.json();
      this.rpcEndPoints = data;
    } catch (error) {
      console.error('Error loading rpc endpoints', error);
    }
  }
}
