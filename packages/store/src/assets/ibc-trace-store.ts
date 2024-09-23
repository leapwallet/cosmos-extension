import { makeAutoObservable } from 'mobx';

import { getKeyToUseForDenoms } from '../utils/get-denom-key';
import { RootDenomsStore } from './root-denom-store';
const ibcTraceUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/denom-trace/base.json';

type IbcTraceData = Record<
  string,
  { path: string; baseDenom: string; originChainId: string; channelId: string; sourceChainId: string }
>;

let ibcTraceData: IbcTraceData = {};

export async function fetchIbcTraceData() {
  const response = await fetch(ibcTraceUrl);
  const data = await response.json();
  ibcTraceData = data;
}

export function getIbcTraceData() {
  return ibcTraceData;
}

// export class IbcTraceStore {
//   ibcTraceData: Record<
//     string,
//     { path: string; baseDenom: string; originChainId: string; channelId: string; sourceChainId: string }
//   > = {};
//   readyPromise: Promise<void>;
//
//   constructor() {
//     makeAutoObservable(this);
//     this.readyPromise = this.loadIbcTraceData();
//   }
//
//   async loadIbcTraceData() {
//     const response = await fetch(ibcTraceUrl);
//     const data = await response.json();
//     runInAction(() => {
//       this.ibcTraceData = data;
//     });
//   }
// }

export class IbcTraceFetcher {
  /*   ibcTraceStore: IbcTraceStore; */
  rootDenomsStore: RootDenomsStore;

  constructor(rootDenomsStore: RootDenomsStore) {
    makeAutoObservable(this);
    this.rootDenomsStore = rootDenomsStore;
  }

  async fetchIbcTrace(denom: string, restUrl: string, chainId: string): Promise<any> {
    await this.rootDenomsStore.readyPromise;

    const denoms = this.rootDenomsStore.allDenoms;
    const ibcTraceData = getIbcTraceData();

    const baseDenom = getKeyToUseForDenoms(denom, chainId);

    const basicMatch = denoms[baseDenom];
    if (basicMatch) {
      return basicMatch;
    }

    const cacheMatch = ibcTraceData[baseDenom];
    if (cacheMatch) {
      return denoms[cacheMatch.baseDenom];
    }

    if (ibcTraceData[baseDenom] !== undefined) {
      const trace = ibcTraceData[baseDenom];
      return getDenom(trace);
    }

    try {
      const denomTrace = await getIbcTrace(denom, restUrl, chainId);
      return getDenom(denomTrace);
    } catch {
      return undefined;
    }

    function getDenom(trace: any) {
      if (trace.baseDenom) {
        const baseDenom = getKeyToUseForDenoms(trace.baseDenom, trace.originChainId);
        const _denom = denoms[baseDenom];
        return _denom;
      } else {
        return undefined;
      }
    }
  }
}

async function getIbcTrace(ibcDenom: string, lcdUrl: string, chainId: string) {
  const res = await fetch(`https://api.leapwallet.io/denom-trace`, {
    method: 'POST',
    body: JSON.stringify({
      ibcDenom: ibcDenom,
      lcdUrl: lcdUrl,
      chainId: chainId,
    }),
  });
  const data = await res.json();
  return data.ibcDenomData;
}
