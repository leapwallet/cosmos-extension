import { pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import type { AggregatedSupportedChainType, SelectedNetworkType } from 'types';

import type { AnkrChainMapStore, ChainInfosStore, IbcTraceFetcher } from '../assets';
import { ChainApisStore } from '../chains';
import type { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { getChainActivity } from './get-activity';
import type { Activity } from './types';

export class ActivityStore {
  chainWiseLoadingStatus: Record<string, 'loading' | 'success' | 'error' | undefined> = {};
  chainWiseActivity: Record<string, Activity[]> = {};

  constructor(
    private chainInfosStore: ChainInfosStore,
    private addressStore: AddressStore,
    private selectedNetworkStore: SelectedNetworkStore,
    private activeChainStore: ActiveChainStore,
    private ankrChainMapStore: AnkrChainMapStore,
    private ibcTraceFetcher: IbcTraceFetcher,
    private chainApiStore: ChainApisStore,
  ) {
    makeAutoObservable(this);
  }

  getFallbackAddress = (forceChain?: SupportedChain, forceNetwork?: SelectedNetworkType) => {
    try {
      const chain = forceChain ?? this.activeChainStore?.activeChain;
      if (!chain || chain === 'aggregated') {
        return undefined;
      }

      const network = forceNetwork ?? this.selectedNetworkStore?.selectedNetwork;
      if (!network) {
        return undefined;
      }

      const activeChainAddress = this.addressStore?.addresses?.[chain];
      const activeChainInfo = this.chainInfosStore?.chainInfos?.[chain];
      const evmOnlyChain = activeChainInfo?.evmOnlyChain;

      return evmOnlyChain ? pubKeyToEvmAddressToShow(this.addressStore?.pubKeys?.[chain]) : activeChainAddress;
    } catch (error) {
      return undefined;
    }
  };

  getActivity = computedFn((chain: AggregatedSupportedChainType, network: SelectedNetworkType, address: string) => {
    if (chain === 'aggregated') {
      return [];
    }

    const activityKey = this.getActivityKey(chain, network, address);
    if (!activityKey) {
      return [];
    }

    return this.chainWiseActivity?.[activityKey] ?? [];
  });

  getLoadingStatus = computedFn(
    (chain: AggregatedSupportedChainType, network: SelectedNetworkType, address: string) => {
      if (chain === 'aggregated') {
        return 'success';
      }

      const activityKey = this.getActivityKey(chain, network, address);
      if (!activityKey) {
        return;
      }

      return this.chainWiseLoadingStatus?.[activityKey];
    },
  );

  getErrorStatus = computedFn((chain: AggregatedSupportedChainType, network: SelectedNetworkType, address: string) => {
    if (chain === 'aggregated') {
      return false;
    }

    const activityKey = this.getActivityKey(chain, network, address);
    if (!activityKey) {
      return false;
    }

    return this.chainWiseLoadingStatus?.[activityKey] === 'error';
  });

  fetchActivity = async (chain: AggregatedSupportedChainType, network: SelectedNetworkType, address: string) => {
    if (chain === 'aggregated' || !chain) {
      return;
    }

    const chainInfo = this.chainInfosStore?.chainInfos?.[chain];
    const activityKey = this.getActivityKey(chain, network, address);

    if (!activityKey) {
      return;
    }

    if (['loading', 'success'].includes(this.chainWiseLoadingStatus?.[activityKey] ?? '')) {
      return;
    }

    try {
      runInAction(() => {
        this.chainWiseLoadingStatus[activityKey] = 'loading';
      });

      const chainApis = await this.chainApiStore?.getChainApis(chain, network);
      const rpcUrl = chainInfo?.evmOnlyChain ? chainApis?.evmJsonRpc : chainApis?.rpcUrl;
      const restUrl = chainInfo?.evmOnlyChain ? chainApis?.evmJsonRpc : chainApis?.lcdUrl;

      if (!rpcUrl || !restUrl) {
        runInAction(() => {
          this.chainWiseLoadingStatus[activityKey] = 'error';
        });
        return null;
      }

      const ankrChainMap = this.ankrChainMapStore?.ankrChainMap;
      const ibcTraceFetcher = this.ibcTraceFetcher;

      const activity = await getChainActivity({
        chainInfo,
        chain,
        network,
        address,
        rpcUrl,
        ankrChainMap,
        restUrl,
        ibcTraceFetcher,
      });

      runInAction(() => {
        this.chainWiseLoadingStatus[activityKey] = 'success';
        this.chainWiseActivity[activityKey] = activity ?? [];
      });
    } catch (error) {
      runInAction(() => {
        this.chainWiseLoadingStatus[activityKey] = 'error';
      });
    }
  };

  getActivityKey = (
    forceChain?: AggregatedSupportedChainType,
    forceNetwork?: SelectedNetworkType,
    forceAddress?: string,
  ) => {
    const chain = forceChain ?? this.activeChainStore?.activeChain;
    if (chain === 'aggregated' || !chain) {
      return undefined;
    }

    const network = forceNetwork ?? this.selectedNetworkStore?.selectedNetwork;
    if (!network) {
      return undefined;
    }

    const address = forceAddress ?? this.getFallbackAddress(chain, network);
    if (!address) {
      return undefined;
    }

    const chainId =
      network === 'testnet'
        ? this.chainInfosStore?.chainInfos?.[chain]?.testnetChainId
        : this.chainInfosStore?.chainInfos?.[chain]?.chainId;

    return `activity-${chainId}-${address}`;
  };

  invalidateActivity = (chain: AggregatedSupportedChainType) => {
    const activityKey = this.getActivityKey(chain);
    if (!activityKey) {
      return;
    }

    runInAction(() => {
      this.chainWiseLoadingStatus[activityKey] = undefined;
      this.chainWiseActivity[activityKey] = [];
    });
  };
}
