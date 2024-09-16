import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable } from 'mobx';

import { ChainInfosStore, DenomsStore, getIbcTraceData, NmsStore } from '../../assets';
import { SelectedNetworkType } from '../../types';
import { getIbcDenomData } from '../../utils';

export class IbcDenomInfoStore {
  nmsStore: NmsStore;
  chainInfosStore: ChainInfosStore;

  denomStore: DenomsStore;

  constructor(nmsStore: NmsStore, chainInfosStore: ChainInfosStore, denomStore: DenomsStore) {
    makeAutoObservable(this);

    this.nmsStore = nmsStore;
    this.chainInfosStore = chainInfosStore;
    this.denomStore = denomStore;
  }

  async ibcDenomInfoForChain(chain: SupportedChain, network: SelectedNetworkType, ibcDenom: string) {
    try {
      const isTestnet = network === 'testnet';
      const activeChainInfo = this.chainInfosStore.chainInfos[chain];
      const activeChainId = isTestnet ? activeChainInfo?.testnetChainId : activeChainInfo?.chainId;
      if (!activeChainId) throw new Error('Chain ID not found');

      const nodeUrlKey = isTestnet ? 'restTest' : 'rest';
      const hasEntryInNms =
        this.nmsStore.restEndpoints[activeChainId] && this.nmsStore.restEndpoints[activeChainId].length > 0;

      const lcdUrl = hasEntryInNms
        ? this.nmsStore.restEndpoints[activeChainId][0].nodeUrl
        : activeChainInfo?.apis[nodeUrlKey];

      let _baseDenom = ibcDenom;
      let trace = null;

      if (ibcDenom.startsWith('ibc/')) {
        const ibcTraceData = getIbcTraceData();
        trace = ibcTraceData[_baseDenom];
        if (!trace) {
          trace = await getIbcDenomData(_baseDenom, lcdUrl ?? '', activeChainId);
        }

        _baseDenom = trace.baseDenom.includes('cw20:') ? trace.baseDenom.replace('cw20:', '') : trace.baseDenom;
      }

      return { denomInfo: this.denomStore.denoms[_baseDenom], trace };
    } catch {
      return {};
    }
  }
}
