import { denoms, DenomsRecord, isAptosChain, isSolanaChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import semver from 'semver';

import { PercentageChangeDataStore, PriceStore, Token } from '../bank';
import { getKeyToUseForDenoms } from '../utils/get-denom-key';
import { generateRandomString } from '../utils/random-string-generator';
import { ActiveChainStore } from '../wallet/active-chain-store';
import { ChainFeatureFlagsStore } from './chain-feature-flags-store';
import { ChainInfosStore } from './chain-infos-store';
import { DenomsStore } from './denoms-store';

export class ZeroStateTokensStore {
  app: 'extension' | 'mobile' = 'extension';
  version: string = '0.0.0';
  readyPromise: Promise<void>;
  ready: boolean = false;

  constructor(
    app: 'extension' | 'mobile',
    version: string,
    private chainFeatureFlagsStore: ChainFeatureFlagsStore,
    private chainInfosStore: ChainInfosStore,
    private denomsStore: DenomsStore,
    private priceStore: PriceStore,
    private percentageChangeDataStore: PercentageChangeDataStore,
    private activeChainStore: ActiveChainStore,
  ) {
    this.app = app;
    this.version = version;
    makeObservable(this, {
      zeroStateTokens: computed,
      ready: observable,
    });
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await Promise.allSettled([this.priceStore.readyPromise, this.percentageChangeDataStore.readyPromise]);
    runInAction(() => {
      this.ready = true;
    });
  }

  get denomInfo(): DenomsRecord {
    return Object.assign({}, denoms, this.denomsStore.denoms);
  }

  get zeroStateTokens(): (Token & { id: string })[] {
    const activeChain = this.activeChainStore.activeChain;

    if (activeChain === 'aggregated') {
      const zeroStateTokenPlaceholders = this.chainFeatureFlagsStore?.zeroStateTokenPlaceholders?.aggregated_chains;
      if (!zeroStateTokenPlaceholders) {
        return [];
      }
      return zeroStateTokenPlaceholders
        ?.filter((placeholder) => {
          const enabledOn =
            this.app === 'extension' ? placeholder.enabledOn.extVersion : placeholder.enabledOn.appVersion;
          if (!enabledOn) {
            return false;
          }
          return semver.satisfies(this.version, enabledOn);
        })
        .map((placeholder) => {
          const denomInfo = this.denomInfo[placeholder.coinMinimalDenom];
          if (!denomInfo) {
            return undefined;
          }
          let usdPrice = undefined;
          let percentChange = 0;
          const coingeckoPrice = this.priceStore.data;
          const percentageChangeData = this.percentageChangeDataStore.data;
          const denomChainInfo = Object.values(this.chainInfosStore.chainInfos).find(
            (chainInfo) => chainInfo.key === denomInfo.chain,
          );
          if (coingeckoPrice && this.ready) {
            if (denomInfo.coinGeckoId && !usdPrice) {
              usdPrice = coingeckoPrice[denomInfo.coinGeckoId];
            }
            if (!usdPrice && denomChainInfo) {
              usdPrice = coingeckoPrice[`${denomChainInfo.chainId}-${denomInfo.coinMinimalDenom}`];
            }
          }

          if (percentageChangeData && this.ready) {
            if (!percentChange && denomInfo.coinGeckoId) {
              percentChange = percentageChangeData[denomInfo.coinGeckoId]?.price_change_percentage_24h;
            }
            if (!percentChange && denomChainInfo) {
              percentChange =
                percentageChangeData[`${denomChainInfo.chainId}-${denomInfo.coinMinimalDenom}`]
                  ?.price_change_percentage_24h;
            }
          }

          if (usdPrice !== undefined) {
            usdPrice = String(usdPrice);
          }

          const token: Token & { id: string } = {
            ...placeholder,
            tokenBalanceOnChain: placeholder.tokenBalanceOnChain as SupportedChain,
            name: denomInfo.name,
            symbol: denomInfo.coinDenom,
            img: denomInfo.icon,
            chain: denomInfo.chain,
            coinGeckoId: denomInfo.coinGeckoId,
            usdValue: '0',
            usdPrice,
            percentChange,
            id: generateRandomString(10),
          };
          return token;
        })
        .filter((token) => token !== undefined) as (Token & { id: string })[];
    }

    const nativeDenom = Object.values(this.chainInfosStore.chainInfos?.[activeChain]?.nativeDenoms ?? {})?.[0];

    if (!nativeDenom) {
      return [];
    }

    const denomKey = getKeyToUseForDenoms(nativeDenom.coinMinimalDenom, activeChain);

    let denomInfo = this.denomInfo[denomKey];

    if (!denomInfo && !!this.chainInfosStore.chainInfos?.[activeChain]?.beta) {
      denomInfo = nativeDenom;
    }

    if (!denomInfo) {
      return [];
    }

    let usdPrice = undefined;
    let percentChange = 0;
    const coingeckoPrice = this.priceStore.data;
    const percentageChangeData = this.percentageChangeDataStore.data;
    const denomChainInfo = Object.values(this.chainInfosStore.chainInfos).find(
      (chainInfo) => chainInfo.key === denomInfo.chain,
    );
    if (coingeckoPrice && this.ready) {
      if (denomInfo.coinGeckoId && !usdPrice) {
        usdPrice = coingeckoPrice[denomInfo.coinGeckoId];
      }
      if (!usdPrice && denomChainInfo) {
        usdPrice = coingeckoPrice[`${denomChainInfo.chainId}-${denomInfo.coinMinimalDenom}`];
      }
    }

    if (percentageChangeData && this.ready) {
      if (!percentChange && denomInfo.coinGeckoId) {
        percentChange = percentageChangeData[denomInfo.coinGeckoId]?.price_change_percentage_24h;
      }
      if (!percentChange && denomChainInfo) {
        percentChange =
          percentageChangeData[`${denomChainInfo.chainId}-${denomInfo.coinMinimalDenom}`]?.price_change_percentage_24h;
      }
    }

    if (usdPrice !== undefined) {
      usdPrice = String(usdPrice);
    }

    const evmChain = this.chainInfosStore.chainInfos[activeChain]?.evmOnlyChain;
    const solanaChain = isSolanaChain(activeChain);
    const aptosChain = isAptosChain(activeChain);

    return [
      {
        coinMinimalDenom: denomInfo.coinMinimalDenom,
        amount: '0',
        isEvm: evmChain,
        isSolana: solanaChain,
        isAptos: aptosChain,
        aptosTokenType: aptosChain ? 'v1' : undefined,
        tokenBalanceOnChain: activeChain as SupportedChain,
        name: denomInfo.name,
        symbol: denomInfo.coinDenom,
        img: denomInfo.icon,
        chain: denomInfo.chain,
        coinGeckoId: denomInfo.coinGeckoId,
        usdValue: '0',
        usdPrice,
        percentChange,
        id: generateRandomString(10),
      },
    ];
  }
}
