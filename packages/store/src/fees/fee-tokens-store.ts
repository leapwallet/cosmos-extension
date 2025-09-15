import {
  axiosWrapper,
  DenomsRecord,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  NativeDenom,
  NetworkType,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { makeObservable, reaction, runInAction } from 'mobx';
import { StorageAdapter } from 'types';

import { ChainInfosStore, fetchIbcTraceData, getIbcTrace, RootDenomsStore } from '../assets';
import { Token } from '../bank/balance-types';
import { BaseObservableQueryStore } from '../base/base-observable-data-store';
import { ChainApisStore } from '../chains';
import { RootBalanceStore } from '../root';
import { getKeyToUseForDenoms } from '../utils/get-denom-key';
import { AptosGasPricesStore } from './aptos-gas-prices-store';
import { DappDefaultFeeStore } from './dapp-default-fee-store';
import { EvmGasPricesStore } from './evm-gas-prices-store';
import { FeeDenomsStore } from './fee-denoms-store';
import { GasPriceStepForChainStore } from './get-price-step-for-chain-store';
import { SolanaGasPricesStore } from './solana-gas-price-store';
import { SuiGasPricesStore } from './sui-gas-price-store';
import { FeeTokenData, GasPriceStep, IbcDenomData, RemoteFeeTokenData } from './types';

export type FeeTokensStoreData = FeeTokenData[];

type GetFeeTokenFnArgs = {
  baseGasPriceStep: GasPriceStep;
  denoms: DenomsRecord;
  nativeDenom: NativeDenom;
};

export class FeeTokensQueryStore extends BaseObservableQueryStore<FeeTokensStoreData> {
  data: FeeTokensStoreData | null = null;
  private activeChain: SupportedChain;
  private activeNetwork: NetworkType;
  private isSeiEvmTransaction: boolean;
  private dappDefaultFeeStore: DappDefaultFeeStore;
  private chainApisStore: ChainApisStore;
  private chainInfosStore: ChainInfosStore;
  private evmGasPricesStore: EvmGasPricesStore;
  private aptosGasPricesStore: AptosGasPricesStore;
  private solanaGasPricesStore?: SolanaGasPricesStore;
  private suiGasPricesStore?: SuiGasPricesStore;
  private gasPriceStepForChainStore: GasPriceStepForChainStore;
  private feeDenomsStore: FeeDenomsStore;
  private rootDenomsStore: RootDenomsStore;
  private rootBalanceStore: RootBalanceStore;
  private addIbcTraceData: (data: Record<string, IbcDenomData>) => void;
  private feeTokenChains: string[] = [];
  private storage: StorageAdapter;

  constructor(params: {
    activeChain: SupportedChain;
    activeNetwork: NetworkType;
    isSeiEvmTransaction: boolean;
    dappDefaultFeeStore: DappDefaultFeeStore;
    chainApisStore: ChainApisStore;
    chainInfosStore: ChainInfosStore;
    evmGasPricesStore: EvmGasPricesStore;
    aptosGasPricesStore: AptosGasPricesStore;
    solanaGasPricesStore?: SolanaGasPricesStore;
    suiGasPricesStore?: SuiGasPricesStore;
    gasPriceStepForChainStore: GasPriceStepForChainStore;
    feeDenomsStore: FeeDenomsStore;
    rootDenomsStore: RootDenomsStore;
    rootBalanceStore: RootBalanceStore;
    addIbcTraceData: (data: Record<string, IbcDenomData>) => void;
    feeTokenChains: string[];
    storage: StorageAdapter;
  }) {
    super();

    this.activeChain = params.activeChain;
    this.activeNetwork = params.activeNetwork;
    this.isSeiEvmTransaction = params.isSeiEvmTransaction;
    this.dappDefaultFeeStore = params.dappDefaultFeeStore;
    this.chainApisStore = params.chainApisStore;
    this.chainInfosStore = params.chainInfosStore;
    this.evmGasPricesStore = params.evmGasPricesStore;
    this.aptosGasPricesStore = params.aptosGasPricesStore;
    this.solanaGasPricesStore = params.solanaGasPricesStore ?? undefined;
    this.suiGasPricesStore = params.suiGasPricesStore ?? undefined;
    this.gasPriceStepForChainStore = params.gasPriceStepForChainStore;
    this.feeDenomsStore = params.feeDenomsStore;
    this.rootDenomsStore = params.rootDenomsStore;
    this.rootBalanceStore = params.rootBalanceStore;
    this.addIbcTraceData = params.addIbcTraceData;
    this.feeTokenChains = params.feeTokenChains;
    this.storage = params.storage;

    makeObservable(this);

    this.getFeeTokensFromCache();

    reaction(
      () => this.dappDefaultFeeStore.defaultFee,
      async (value, prev) => {
        /**
         * If fees are not changed, we don't need to fetch fee tokens data.
         * This is to avoid loop of below updates:
         * `defaultFee` -> `feeTokens` -> `gasPriceOptions` -> `defaultFee` -> ...
         */
        if (
          value?.gasLimit === prev?.gasLimit &&
          value?.amount?.length === prev?.amount?.length &&
          value?.amount?.every((a, i) => a.amount === prev?.amount?.[i]?.amount && a.denom === prev?.amount?.[i]?.denom)
        )
          return;
        try {
          const newData = await this.fetchData();
          this.setData(newData);
        } catch (error) {
          console.error('Failed to fetch fee tokens data:', error);
        }
      },
    );
  }

  async saveFeeTokensToCache(data: FeeTokensStoreData) {
    const chain = this.activeChain;
    const network = this.activeNetwork;
    const isSeiEvmTransaction = this.isSeiEvmTransaction;

    if (!data) {
      return;
    }

    const cacheKey = `${chain}-${network}-${isSeiEvmTransaction}`;

    this.storage.set(`fee-tokens-cached`, { [cacheKey]: data }, 'idb');
  }

  async getFeeTokensFromCache() {
    try {
      const cacheKey = `${this.activeChain}-${this.activeNetwork}-${this.isSeiEvmTransaction}`;
      const cachedFeeTokens = await this.storage.get<Record<string, FeeTokensStoreData>>(`fee-tokens-cached`, 'idb');
      const cachedFeeTokensData = cachedFeeTokens?.[cacheKey];
      if (cachedFeeTokensData && !this.data) {
        runInAction(() => {
          this.setData(cachedFeeTokensData);
        });
      }
    } catch (e) {
      console.error('Failed to get fee tokens from cache:', e);
    }
  }

  async getDappSuggestedTokens(denoms: DenomsRecord): Promise<{ denom: NativeDenom; ibcDenom?: string } | undefined> {
    const denom = this.dappDefaultFeeStore.defaultFee?.amount?.[0]?.denom;
    const chain = this.activeChain;
    if (!denom) {
      return;
    }

    if (!denom.startsWith('ibc/')) {
      if (denoms?.[denom]) {
        return { denom: denoms?.[denom], ibcDenom: undefined };
      }

      return {
        denom: {
          coinMinimalDenom: denom,
          coinDecimals: 0,
          coinDenom: denom,
          coinGeckoId: '',
          icon: '',
          name: denom,
          chain,
        },
        ibcDenom: undefined,
      };
    }

    try {
      const traceData = await fetchIbcTraceData();
      let trace = traceData[denom];
      const ibcTraceDataToAdd: Record<string, IbcDenomData> = {};
      if (!trace) {
        const { lcdUrl } = await this.chainApisStore.getChainApis(chain, this.activeNetwork);
        trace = await getIbcTrace(denom, lcdUrl ?? '', this.chainInfosStore.chainInfos[chain].chainId);
        if (trace) {
          ibcTraceDataToAdd[denom] = trace;
        }
      }

      if (!trace) {
        throw new Error('Denom trace not found');
      }

      const baseDenom = trace.baseDenom;
      const _baseDenom = getKeyToUseForDenoms(baseDenom, String(trace.sourceChainId || trace.originChainId || ''));
      const denomInfo = denoms[_baseDenom];
      Object.keys(ibcTraceDataToAdd).length && this.addIbcTraceData(ibcTraceDataToAdd);

      if (denomInfo) {
        return { denom: denomInfo, ibcDenom: denom };
      }

      throw new Error('Denom trace not found');
    } catch (e) {
      return {
        denom: {
          coinMinimalDenom: denom,
          coinDecimals: 0,
          coinDenom: denom,
          coinGeckoId: '',
          icon: '',
          name: denom,
          chain: chain,
        },
        ibcDenom: denom,
      };
    }
  }

  private async getPriceStep(isSeiEvmTransaction: boolean) {
    const chain = this.activeChain;
    const network = this.activeNetwork;

    if (isSeiEvmTransaction || this.chainInfosStore.chainInfos[chain].evmOnlyChain) {
      const data = await this.evmGasPricesStore.getStore(chain, network)?.getData();
      return data?.gasPrice;
    }

    if (isAptosChain(chain)) {
      const data = await this.aptosGasPricesStore.getStore(chain, network)?.getData();
      return data?.gasPrice;
    }

    if (isSolanaChain(chain) && this.solanaGasPricesStore) {
      const data = await this.solanaGasPricesStore.getStore(chain, network)?.getData();
      return data?.gasPrice;
    }

    if (isSuiChain(chain) && this.suiGasPricesStore) {
      const data = await this.suiGasPricesStore.getStore(chain, network)?.getData();
      return data?.gasPrice;
    }

    return this.gasPriceStepForChainStore.getGasPriceSteps(chain, network);
  }

  private async getChainFeeTokens({
    baseGasPriceStep,
    chain,
    nativeDenom,
    denoms,
  }: GetFeeTokenFnArgs & {
    chain: string;
  }): Promise<FeeTokenData[]> {
    const nativeFeeTokenIbcDenom = nativeDenom?.coinMinimalDenom.toLowerCase().startsWith('ibc/')
      ? nativeDenom.coinMinimalDenom
      : undefined;

    const nativeFeeToken = {
      denom: nativeDenom,
      ibcDenom: nativeFeeTokenIbcDenom,
      gasPriceStep: baseGasPriceStep,
    };

    try {
      if (!this.feeTokenChains?.includes(chain)) return [nativeFeeToken];
      const { data } = await axios.get<RemoteFeeTokenData[]>(
        `https://assets.leapwallet.io/cosmos-registry/v1/fee-tokens/${chain}.json`,
      );

      return [
        nativeFeeToken,
        ...data
          .map((a) => ({
            denom: denoms[a.denom as keyof typeof denoms],
            ibcDenom: a.ibcDenom,
            gasPriceStep: a.gasPriceStep,
          }))
          .filter((a) => !!a.denom),
      ];
    } catch (e) {
      return [nativeFeeToken];
    }
  }

  private async getOsmosisFeeTokens({
    baseGasPriceStep,
    denoms,
    restUrl,
    allAssets,
    nativeDenom,
  }: GetFeeTokenFnArgs & {
    restUrl: string;
    allAssets: Token[];
  }): Promise<FeeTokenData[]> {
    const nativeFeeTokenIbcDenom = nativeDenom?.coinMinimalDenom.toLowerCase().startsWith('ibc/')
      ? nativeDenom.coinMinimalDenom
      : undefined;

    const nativeFeeToken = {
      denom: nativeDenom,
      ibcDenom: nativeFeeTokenIbcDenom,
      gasPriceStep: baseGasPriceStep,
    };

    try {
      const feeTokens = await axiosWrapper({
        baseURL: restUrl,
        method: 'get',
        url: '/osmosis/txfees/v1beta1/fee_tokens',
      });

      const feeTokensData = allAssets.filter((token) => {
        return (feeTokens.data.fee_tokens as { denom: string; poolID: string }[])?.find((feeToken) => {
          // is token ibc?
          if (token.ibcDenom) {
            return feeToken.denom === token.ibcDenom;
          }
          return feeToken.denom === token.coinMinimalDenom;
        });
      });

      const feeTokensWithDenom = feeTokensData.reduce(
        (acc: { ibcDenom: string | undefined; denom: NativeDenom }[], curr: Token) => {
          const key = getKeyToUseForDenoms(curr.coinMinimalDenom, curr.chain ?? '');
          const feeToken = {
            ibcDenom: curr.ibcDenom,
            denom: denoms[key],
          };

          return [...acc, feeToken];
        },
        [],
      );

      return [nativeFeeToken, ...feeTokensWithDenom].filter((token) => !!token.denom) as FeeTokenData[];
    } catch (e) {
      return [nativeFeeToken];
    }
  }

  async fetchData(): Promise<FeeTokensStoreData> {
    let feeTokens: FeeTokenData[];

    const chain = this.activeChain;
    const network = this.activeNetwork;
    const denoms = this.rootDenomsStore.allDenoms;
    const nativeDenom = this.feeDenomsStore.getNativeFeeDenom(denoms, chain, network);
    const [baseGasPriceStep, dappSuggestedToken] = await Promise.all([
      this.getPriceStep(this.isSeiEvmTransaction),
      this.getDappSuggestedTokens(denoms),
    ]);

    switch (chain) {
      case 'osmosis': {
        const { lcdUrl = '' } = await this.chainApisStore.getChainApis(chain, this.activeNetwork);
        const allAssets = this.rootBalanceStore.getSpendableBalancesForChain(chain, network, undefined);

        feeTokens = await this.getOsmosisFeeTokens({
          baseGasPriceStep: baseGasPriceStep!,
          restUrl: lcdUrl,
          denoms,
          allAssets,
          nativeDenom,
        });
        break;
      }
      default:
        feeTokens = await this.getChainFeeTokens({
          baseGasPriceStep: baseGasPriceStep!,
          denoms,
          chain,
          nativeDenom,
        });
    }

    const additionalFeeDenoms = this.feeDenomsStore.getAdditionalFeeDenoms(chain);

    // Append fee denoms which are present in chain-infos but not in the fee-tokens
    additionalFeeDenoms.forEach((denom) => {
      if (
        feeTokens.find((a) =>
          a.ibcDenom ? a.ibcDenom === denom.coinMinimalDenom : a.denom.coinMinimalDenom === denom.coinMinimalDenom,
        )
      ) {
        return;
      }

      const ibcDenom = denom?.coinMinimalDenom.toLowerCase().startsWith('ibc/') ? denom.coinMinimalDenom : undefined;
      let gasPriceStep = baseGasPriceStep;
      if (denom.gasPriceStep) {
        gasPriceStep = {
          low: denom.gasPriceStep.low,
          medium: denom.gasPriceStep.average,
          high: denom.gasPriceStep.high,
        };
      }
      feeTokens.push({
        denom: denoms[denom?.coinMinimalDenom] ?? denom,
        ibcDenom,
        gasPriceStep: gasPriceStep!,
      });
    });

    if (dappSuggestedToken) {
      const dappSuggestedTokenAlreadyExists = feeTokens?.find((a) => {
        if (a.ibcDenom || dappSuggestedToken.ibcDenom) {
          return a.ibcDenom === dappSuggestedToken.ibcDenom;
        }
        return a.denom.coinMinimalDenom === dappSuggestedToken.denom.coinMinimalDenom;
      });
      if (!dappSuggestedTokenAlreadyExists) {
        feeTokens.push({
          ...dappSuggestedToken,
          gasPriceStep: baseGasPriceStep!,
        });
      }
    }

    this.saveFeeTokensToCache(feeTokens);
    return feeTokens;
  }
}

// replaces useFeeTokens
export class FeeTokensStore {
  private store = {} as Partial<Record<`${SupportedChain}-${NetworkType}-${boolean}`, FeeTokensQueryStore>>;

  private dappDefaultFeeStore: DappDefaultFeeStore;
  private chainApisStore: ChainApisStore;
  private chainInfosStore: ChainInfosStore;
  private evmGasPricesStore: EvmGasPricesStore;
  private aptosGasPricesStore: AptosGasPricesStore;
  private solanaGasPricesStore?: SolanaGasPricesStore;
  private suiGasPricesStore?: SuiGasPricesStore;
  private gasPriceStepForChainStore: GasPriceStepForChainStore;
  private feeDenomsStore: FeeDenomsStore;
  private rootDenomsStore: RootDenomsStore;
  private rootBalanceStore: RootBalanceStore;
  private addIbcTraceData: (data: Record<string, IbcDenomData>) => void;
  private feeTokenChains: string[] = [];
  private initializing: 'pending' | 'done' | 'error' = 'pending';
  private storage: StorageAdapter;
  constructor(params: {
    dappDefaultFeeStore: DappDefaultFeeStore;
    chainApisStore: ChainApisStore;
    chainInfosStore: ChainInfosStore;
    evmGasPricesStore: EvmGasPricesStore;
    aptosGasPricesStore: AptosGasPricesStore;
    solanaGasPricesStore?: SolanaGasPricesStore;
    suiGasPricesStore?: SuiGasPricesStore;
    gasPriceStepForChainStore: GasPriceStepForChainStore;
    feeDenomsStore: FeeDenomsStore;
    rootDenomsStore: RootDenomsStore;
    rootBalanceStore: RootBalanceStore;
    addIbcTraceData: (data: Record<string, IbcDenomData>) => void;
    storage: StorageAdapter;
  }) {
    this.dappDefaultFeeStore = params.dappDefaultFeeStore;
    this.chainApisStore = params.chainApisStore;
    this.chainInfosStore = params.chainInfosStore;
    this.evmGasPricesStore = params.evmGasPricesStore;
    this.aptosGasPricesStore = params.aptosGasPricesStore;
    this.solanaGasPricesStore = params.solanaGasPricesStore ?? undefined;
    this.suiGasPricesStore = params.suiGasPricesStore ?? undefined;
    this.gasPriceStepForChainStore = params.gasPriceStepForChainStore;
    this.feeDenomsStore = params.feeDenomsStore;
    this.rootDenomsStore = params.rootDenomsStore;
    this.rootBalanceStore = params.rootBalanceStore;
    this.addIbcTraceData = params.addIbcTraceData;
    this.storage = params.storage;
    this.getFeeTokenChains();
  }

  async getFeeTokenChains() {
    try {
      const { data: fee_token_chains } = await axios.get(
        `https://assets.leapwallet.io/cosmos-registry/v1/fee-tokens/fee-token-chains.json`,
      );

      runInAction(() => {
        this.feeTokenChains = fee_token_chains?.chains;
        this.initializing = 'done';
      });
    } catch (e) {
      runInAction(() => {
        this.initializing = 'error';
      });
    }
  }

  getStore(chain: SupportedChain, network: NetworkType, isSeiEvmTransaction = false) {
    if (this.initializing === 'pending') {
      return;
    }
    const key = `${chain}-${network}-${isSeiEvmTransaction}` as const;

    if (!this.store[key]) {
      this.store[key] = new FeeTokensQueryStore({
        activeChain: chain,
        activeNetwork: network,
        isSeiEvmTransaction,
        dappDefaultFeeStore: this.dappDefaultFeeStore,
        chainApisStore: this.chainApisStore,
        chainInfosStore: this.chainInfosStore,
        evmGasPricesStore: this.evmGasPricesStore,
        aptosGasPricesStore: this.aptosGasPricesStore,
        solanaGasPricesStore: this.solanaGasPricesStore ?? undefined,
        suiGasPricesStore: this.suiGasPricesStore ?? undefined,
        gasPriceStepForChainStore: this.gasPriceStepForChainStore,
        feeDenomsStore: this.feeDenomsStore,
        rootDenomsStore: this.rootDenomsStore,
        rootBalanceStore: this.rootBalanceStore,
        addIbcTraceData: this.addIbcTraceData,
        feeTokenChains: this.feeTokenChains,
        storage: this.storage,
      });

      this.store[key]?.getData();
    }

    return this.store[key];
  }
}
