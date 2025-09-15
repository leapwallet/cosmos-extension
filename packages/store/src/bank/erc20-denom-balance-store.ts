import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import {
  DenomsRecord,
  fetchERC20Balances,
  fromSmall,
  getEthereumAddress,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  pubKeyToEvmAddressToShow,
  SupportedChain,
  toSmall,
} from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { computedFn } from 'mobx-utils';

import {
  AggregatedChainsStore,
  AnkrChainMapStore,
  BetaERC20DenomsStore,
  ChainInfosStore,
  CoingeckoIdsStore,
  CompassSeiEvmConfigStore,
  CompassTokenTagsStore,
  DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  ERC20DenomsStore,
  Erc404DenomsStore,
  NmsStore,
  RootERC20DenomsStore,
} from '../assets';
import { AggregatedSupportedChainType, Currency, SelectedNetworkType, StorageAdapter } from '../types';
import { isBitcoinChain } from '../utils';
import { calculateTokenPriceAndValue } from '../utils/bank/price-calculator';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { BalanceLoadingStatus, Token } from './balance-types';
import { EVMBalanceAPIStore } from './evm-balance-api-store';
import { EvmBalanceStore } from './evm-balance-store';
import { PriceStore } from './price-store';

export const CACHED_ERC20_BALANCES_KEY = 'cached-erc20-balances';

export class ERC20DenomBalanceStore {
  chainInfosStore: ChainInfosStore;
  nmsStore: NmsStore;
  addressStore: AddressStore;
  denomsStore: DenomsStore;
  erc20DenomsStore: ERC20DenomsStore;
  selectedNetworkStore: SelectedNetworkStore;
  enabledCW20DenomsStore: EnabledCW20DenomsStore;
  priceStore: PriceStore;
  disabledCW20DenomsStore: DisabledCW20DenomsStore;
  betaERC20DenomsStore: BetaERC20DenomsStore;
  activeChainStore: ActiveChainStore;
  compassSeiEvmConfigStore: CompassSeiEvmConfigStore;
  aggregatedChainsStore: AggregatedChainsStore;
  erc404DenomsStore: Erc404DenomsStore;
  ankrChainMapStore: AnkrChainMapStore;
  currencyStore: CurrencyStore;
  evmBalanceStore: EvmBalanceStore;
  compassTokenTagsStore: CompassTokenTagsStore;
  evmBalanceApiStore: EVMBalanceAPIStore;
  coingeckoIdsStore: CoingeckoIdsStore;
  rootERC20DenomsStore: RootERC20DenomsStore;
  storageAdapter: StorageAdapter;
  saveCachedBalancesDebounce: NodeJS.Timeout | null = null;

  chainWiseBalances: Record<string, Record<string, Token>> = {};
  rawBalances: Record<string, Record<string, any>> = {};
  aggregatedLoadingStatus: boolean = false;
  chainWiseStatus: Record<string, BalanceLoadingStatus> = {};

  constructor(
    chainInfosStore: ChainInfosStore,
    nmsStore: NmsStore,
    activeChainStore: ActiveChainStore,
    addressStore: AddressStore,
    selectedNetworkStore: SelectedNetworkStore,
    denomsStore: DenomsStore,
    erc20DenomsStore: ERC20DenomsStore,
    priceStore: PriceStore,
    betaERC20DenomsStore: BetaERC20DenomsStore,
    disabledCW20DenomsStore: DisabledCW20DenomsStore,
    enabledCW20DenomsStore: EnabledCW20DenomsStore,
    compassSeiEvmConfigStore: CompassSeiEvmConfigStore,
    aggregatedChainsStore: AggregatedChainsStore,
    erc404DenomsStore: Erc404DenomsStore,
    ankrChainMapStore: AnkrChainMapStore,
    evmBalanceStore: EvmBalanceStore,
    currencyStore: CurrencyStore,
    compassTokenTagsStore: CompassTokenTagsStore,
    evmBalanceApiStore: EVMBalanceAPIStore,
    coingeckoIdsStore: CoingeckoIdsStore,
    storageAdapter: StorageAdapter,
    rootERC20DenomsStore: RootERC20DenomsStore,
  ) {
    makeAutoObservable(this);

    this.chainInfosStore = chainInfosStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.nmsStore = nmsStore;
    this.denomsStore = denomsStore;
    this.erc20DenomsStore = erc20DenomsStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.betaERC20DenomsStore = betaERC20DenomsStore;
    this.enabledCW20DenomsStore = enabledCW20DenomsStore;
    this.disabledCW20DenomsStore = disabledCW20DenomsStore;
    this.priceStore = priceStore;
    this.compassSeiEvmConfigStore = compassSeiEvmConfigStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.erc404DenomsStore = erc404DenomsStore;
    this.ankrChainMapStore = ankrChainMapStore;
    this.evmBalanceStore = evmBalanceStore;
    this.currencyStore = currencyStore;
    this.compassTokenTagsStore = compassTokenTagsStore;
    this.evmBalanceApiStore = evmBalanceApiStore;
    this.coingeckoIdsStore = coingeckoIdsStore;
    this.rootERC20DenomsStore = rootERC20DenomsStore;
    this.storageAdapter = storageAdapter;

    this.initCachedBalances();
  }

  async initialize() {
    await Promise.all([
      this.nmsStore.readyPromise,
      this.denomsStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.erc20DenomsStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.disabledCW20DenomsStore.readyPromise,
      this.enabledCW20DenomsStore.readyPromise,
      this.betaERC20DenomsStore.readyPromise,
      this.addressStore.readyPromise,
      this.priceStore.readyPromise,
      this.compassSeiEvmConfigStore.readyPromise,
      this.aggregatedChainsStore.readyPromise,
      this.erc404DenomsStore.readyPromise,
      this.ankrChainMapStore.readyPromise,
      this.compassTokenTagsStore.readyPromise,
      this.coingeckoIdsStore.readyPromise,
    ]);
  }

  async loadBalances(
    _chain?: AggregatedSupportedChainType,
    network?: SelectedNetworkType,
    refetch = false,
    forceAddresses?: Record<string, string>,
  ) {
    const _network = network ?? this.selectedNetworkStore.selectedNetwork;
    const chain = _chain || this.activeChainStore.activeChain;
    if (chain === 'aggregated') {
      return this.fetchAggregatedBalances(_network, refetch, forceAddresses);
    }

    try {
      await this.fetchChainBalances(chain, _network, refetch, undefined, forceAddresses?.[chain as SupportedChain]);
    } catch (e) {
      console.error('Error while fetching balances', e);
      runInAction(() => {
        this.chainWiseStatus[this.getBalanceKey(chain, _network)] = 'error';
      });
    }
  }

  updateCurrency(prevCurrency: Currency) {
    const network = this.selectedNetworkStore.selectedNetwork;
    const chain = this.activeChainStore.activeChain;

    if (chain === 'aggregated') {
      return this.updateAggregatedCurrency(network, prevCurrency);
    }
    return this.updateCurrencyForChain(chain as SupportedChain, network, prevCurrency);
  }

  async updateCurrencyForChain(chain: SupportedChain, network: SelectedNetworkType, prevCurrency: Currency) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const isAptos = isAptosChain(chainInfos[chain as SupportedChain]?.key);
    const isSolana = isSolanaChain(chainInfos[chain as SupportedChain]?.key);
    const isSui = isSuiChain(chainInfos[chain as SupportedChain]?.key);
    const isBitcoin = isBitcoinChain(chainInfos[chain as SupportedChain]?.key);
    if (isAptos || isSolana || isSui || isBitcoin) {
      return;
    }
    const pubKey = this.addressStore.pubKeys?.[chain];
    const ethWalletAddress = pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];
    if (!ethWalletAddress) {
      return;
    }
    const oldBalanceKey = this.getBalanceKey(chain, network, undefined, prevCurrency);
    const balanceKey = this.getBalanceKey(chain, network);
    const coingeckoPrices = this.priceStore.data;

    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;
    const chainInfo = chainInfos?.[chain];

    const rootDenoms = this.denomsStore.denoms ?? {};
    const betaERC20Denoms = this.betaERC20DenomsStore.getBetaERC20DenomsForChain(chain) ?? {};
    const allDenoms: Record<string, any> = { ...betaERC20Denoms, ...rootDenoms };

    try {
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'loading';
      });

      const formattedBalances: Token[] = [];
      Object.values(this.chainWiseBalances[oldBalanceKey] ?? {}).map((token) => {
        let _denom = token.coinMinimalDenom;
        if (chain === 'noble' && _denom === 'uusdc') {
          _denom = 'usdc';
        }
        const denomInfo = allDenoms[_denom];
        const amount = token.amount;

        const coinGeckoId =
          token.coinGeckoId ||
          denomInfo?.coinGeckoId ||
          coingeckoIds[denomInfo?.coinMinimalDenom] ||
          coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
          '';

        const { usdPrice, usdValue } = calculateTokenPriceAndValue({
          amount,
          coingeckoPrices,
          coinMinimalDenom: denomInfo?.coinMinimalDenom || token.coinMinimalDenom,
          chainId: chainInfo.chainId,
          coinGeckoId,
        });

        const newToken: Token = {
          ...token,
          usdValue,
          usdPrice,
        };

        formattedBalances.push(newToken);
      });

      runInAction(() => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }
        formattedBalances.map((balance) => {
          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });
        this.chainWiseStatus[balanceKey] = null;
      });
      if (oldBalanceKey !== balanceKey) {
        /**
         * Clean up balances for the old currency.
         */
        this.clearCachedBalancesForChain(chain, undefined, prevCurrency);
      }
      /**
       * Save the balances for the new currency.
       */
      this.saveCachedBalances();
    } catch (error) {
      console.log(error);

      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async updateAggregatedCurrency(network: SelectedNetworkType, prevCurrency: Currency) {
    await this.aggregatedChainsStore.readyPromise;
    const filteredChains = this.aggregatedChainsStore.aggregatedChainsData?.filter(
      (chain) =>
        network === 'testnet' ||
        this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
    );
    if (filteredChains && filteredChains.length > 0) {
      await Promise.all(
        filteredChains.map((chain) => {
          this.updateCurrencyForChain(chain as SupportedChain, network, prevCurrency);
        }),
      );
    }
  }

  async fetchAggregatedBalances(
    network: SelectedNetworkType,
    refetch = false,
    forceAddresses?: Record<string, string>,
  ) {
    runInAction(() => {
      this.aggregatedLoadingStatus = true;
    });
    const evmChainsList: SupportedChain[] = [];

    const allErc20Chains: SupportedChain[] = [];
    const supportedChainWiseAddresses: Partial<Record<SupportedChain, string>> = {};
    await this.aggregatedChainsStore.readyPromise;
    this.aggregatedChainsStore.aggregatedChainsData
      .filter(
        (chain) =>
          network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
      )
      .forEach((chain) => {
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network, forceAddresses?.[chain]);
        const isAptos = isAptosChain(this.chainInfosStore.chainInfos[chain as SupportedChain]?.key);
        const isSolana = isSolanaChain(this.chainInfosStore.chainInfos[chain as SupportedChain]?.key);
        if (
          (this.chainWiseBalances[balanceKey] && this.chainWiseStatus[balanceKey] === null && !refetch) ||
          isAptos ||
          isSolana
        ) {
          runInAction(() => {
            this.chainWiseStatus[balanceKey] = null;
          });
          return;
        }
        const pubKey = this.addressStore.pubKeys?.[chain];
        const ethWalletAddress =
          forceAddresses?.[chain] || pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];
        if (!ethWalletAddress) {
          return;
        }
        allErc20Chains.push(chain as SupportedChain);
        supportedChainWiseAddresses[chain as SupportedChain] = ethWalletAddress;
      });

    if (Object.keys(supportedChainWiseAddresses).length === 0) {
      runInAction(() => {
        this.aggregatedLoadingStatus = false;
      });
      return;
    }

    const balances = await this.evmBalanceApiStore.fetchAggregatedBalanceFromAPI(
      supportedChainWiseAddresses,
      network,
      refetch,
    );
    const chainsToUseFallbackFor: SupportedChain[] = [];
    allErc20Chains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain]);
      if (balances[chain as SupportedChain]?.useFallbackERC20) {
        chainsToUseFallbackFor.push(chain);
        return;
      }
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = (balances[chain as SupportedChain]?.erc20Balances ?? []).reduce(
          (acc, token) => {
            acc[token.coinMinimalDenom] = token;
            return acc;
          },
          {} as Record<string, Token>,
        );
        this.chainWiseStatus[balanceKey] = null;
      });
    });

    if (chainsToUseFallbackFor.length === 0) {
      runInAction(() => {
        this.aggregatedLoadingStatus = false;
      });
      this.saveCachedBalances();
      return;
    }

    await Promise.allSettled(
      chainsToUseFallbackFor.map(async (chain) => {
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network, forceAddresses?.[chain]);

        if (!refetch && this.chainWiseBalances[balanceKey]) {
          runInAction(() => {
            this.chainWiseStatus[balanceKey] = null;
          });
          return;
        }

        if (this.ankrChainMapStore.ankrChainMap[chain]) {
          await this.evmBalanceStore.loadEvmBalance(chain as SupportedChain, network, refetch, true, forceAddresses);
          const evmBalance = this.evmBalanceStore.evmBalanceForChain(chain as SupportedChain, network, forceAddresses);

          if (Number(evmBalance?.[0]?.amount) > 0) {
            evmChainsList.push(chain as SupportedChain);
            return;
          }
        }

        return this.fetchERC20TokenBalances(
          chain as SupportedChain,
          network,
          undefined,
          undefined,
          undefined,
          forceAddresses?.[chain as SupportedChain],
        );
      }),
    );

    if (evmChainsList.length > 0) {
      const isApiDown = await this.fetchAnkrERC20TokenBalances(evmChainsList, network, forceAddresses);

      if (isApiDown) {
        await Promise.allSettled(
          evmChainsList.map(async (chain) => {
            return this.fetchERC20TokenBalances(
              chain,
              network,
              undefined,
              undefined,
              undefined,
              forceAddresses?.[chain as SupportedChain],
            );
          }),
        );
      }
    }

    runInAction(() => {
      this.aggregatedLoadingStatus = false;
    });
    this.saveCachedBalances();
  }

  async fetchChainBalances(
    chain: SupportedChain,
    network: SelectedNetworkType,
    refetch = false,
    forceFallback = false,
    forceAddress?: string,
  ) {
    const balanceKey = this.getBalanceKey(chain, network, forceAddress);

    if (!refetch && this.chainWiseBalances[balanceKey] && this.chainWiseStatus[balanceKey] === null) {
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = null;
      });
      return;
    }

    if (!forceFallback) {
      const pubKey = this.addressStore.pubKeys?.[chain];
      const ethWalletAddress =
        forceAddress || pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];
      const { erc20Balances, useFallbackERC20 } = await this.evmBalanceApiStore.fetchChainBalanceFromAPI(
        chain,
        network,
        ethWalletAddress,
        refetch,
      );

      if (!useFallbackERC20) {
        runInAction(() => {
          this.chainWiseBalances[balanceKey] = (erc20Balances ?? []).reduce((acc, token) => {
            acc[token.coinMinimalDenom] = token;
            return acc;
          }, {} as Record<string, Token>);
          this.chainWiseStatus[balanceKey] = null;
        });
        this.saveCachedBalances();
        return;
      }
    }

    if (chain === 'monad') {
      await this.fetchMonadErc20TokenBalances(forceAddress);
      return;
    }

    if (chain === 'forma') {
      await this.fetchFormaErc20TokenBalances(forceAddress);
      return;
    }

    if (chain === 'lightlink') {
      await this.fetchLightLinkErc20TokenBalances(forceAddress);
      return;
    }

    if (chain === 'manta') {
      await this.fetchMantaErc20TokenBalances(forceAddress);
      return;
    }

    if (this.ankrChainMapStore.ankrChainMap[chain]) {
      const forceAddresses = forceAddress ? { [chain]: forceAddress } : undefined;
      await this.evmBalanceStore.loadEvmBalance(chain, network, refetch, true, forceAddresses);
      const evmBalance = this.evmBalanceStore.evmBalanceForChain(chain, network, forceAddresses);

      if (Number(evmBalance?.[0]?.amount) <= 0) {
        runInAction(() => {
          this.chainWiseStatus[balanceKey] = null;
        });
        return;
      }

      runInAction(() => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseStatus[balanceKey] = 'loading';
        }
      });

      const isApiDown = await this.fetchAnkrERC20TokenBalances([chain], network, forceAddresses);
      if (isApiDown) {
        return this.fetchERC20TokenBalances(chain, network, undefined, undefined, undefined, forceAddress);
      } else {
        return;
      }
    }

    const isSeiEvm = this.activeChainStore.isSeiEvm(chain);
    if (isSeiEvm && chain !== 'seiDevnet' && network === 'mainnet') {
      runInAction(() => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseStatus[balanceKey] = 'loading';
        }
      });

      const isApiDown = await this.fetchSeiEvmERC20TokenBalances(chain, network, forceAddress);

      if (isApiDown) {
        return this.fetchERC20TokenBalances(chain, network, undefined, undefined, undefined, forceAddress);
      }

      await this.fetchERC20TokenBalances(
        chain,
        network,
        Object.keys(this.erc404DenomsStore.denoms[chain] ?? []),
        undefined,
        undefined,
        forceAddress,
      );

      runInAction(() => {
        this.chainWiseStatus[balanceKey] = null;
      });
      return;
    }

    await this.fetchERC20TokenBalances(chain, network, undefined, undefined, undefined, forceAddress);
  }

  async fetchERC20TokenBalances(
    activeChain: SupportedChain,
    network: SelectedNetworkType,
    forceERC20Denoms?: string[],
    skipStateUpdate = false,
    denomsInfo?: DenomsRecord,
    forceAddress?: string,
  ): Promise<Token[] | undefined> {
    const chainInfo = this.chainInfosStore?.chainInfos?.[activeChain];

    if (!chainInfo) {
      return;
    }

    const balanceKeyNoneEvm = this.getBalanceKey(activeChain, network);
    if (
      isSolanaChain(activeChain) ||
      isAptosChain(activeChain) ||
      isBitcoinChain(activeChain) ||
      isSuiChain(activeChain)
    ) {
      runInAction(() => {
        this.chainWiseStatus[balanceKeyNoneEvm] = null;
      });
      return;
    }

    let erc20DenomAddresses: string[] | undefined = forceERC20Denoms;
    await this.erc20DenomsStore.readyPromise;
    if (!erc20DenomAddresses) {
      erc20DenomAddresses = this.getERC20DenomAddresses(activeChain, forceAddress);
    }

    const address = this.addressStore.addresses[chainInfo.key];
    const pubKey = this.addressStore.pubKeys?.[activeChain];

    const chainId =
      (network === 'testnet'
        ? this.chainInfosStore.chainInfos?.[activeChain]?.evmChainIdTestnet
        : this.chainInfosStore.chainInfos?.[activeChain]?.evmChainId) ?? '';

    await this.nmsStore.readyPromise;

    const hasEntryInNms = this.nmsStore?.rpcEndPoints?.[chainId] && this.nmsStore.rpcEndPoints[chainId].length > 0;

    let evmJsonRpcUrl: string | undefined;
    if (hasEntryInNms) {
      evmJsonRpcUrl = this.nmsStore.rpcEndPoints[chainId][0].nodeUrl;
    }

    if (!evmJsonRpcUrl) {
      evmJsonRpcUrl =
        network === 'testnet' ? chainInfo.apis.evmJsonRpcTest ?? chainInfo.apis.evmJsonRpc : chainInfo.apis.evmJsonRpc;
    }

    const isSeiEvm = this.activeChainStore.isSeiEvm(activeChain);
    const isEvmChain = isSeiEvm || chainInfo?.evmOnlyChain;

    if ((!address || !pubKey) && !forceAddress) {
      return;
    }

    let ethWalletAddress = forceAddress || getEthereumAddress(address);
    const balanceKey = this.getBalanceKey(activeChain, network, forceAddress);

    try {
      if (isEvmChain) {
        ethWalletAddress = forceAddress || pubKeyToEvmAddressToShow(pubKey, true) || getEthereumAddress(address);
      }
    } catch (_) {
      //
    }

    if (
      !evmJsonRpcUrl ||
      !ethWalletAddress?.startsWith('0x') ||
      !erc20DenomAddresses ||
      erc20DenomAddresses.length === 0
    ) {
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = null;
      });
      return;
    }

    if (!skipStateUpdate) {
      runInAction(() => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseStatus[balanceKey] = 'loading';
        }
      });
    }

    const formattedBalances: Token[] = [];
    let rawBalances: {
      denom: string;
      amount: BigNumber;
    }[] = [];

    try {
      rawBalances = await fetchERC20Balances(evmJsonRpcUrl, ethWalletAddress, erc20DenomAddresses);
      if (rawBalances && rawBalances.length > 0) {
        await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

        await Promise.allSettled(
          rawBalances.map(async (balance) => {
            try {
              const formattedToken = this.formatBalance(balance, activeChain, denomsInfo);
              if (formattedToken) {
                formattedBalances.push(formattedToken);
              }
            } catch (e) {
              console.error('Error while formatting balance', e);
            }
          }),
        );
      }
    } catch (e) {
      console.error('Error while fetching erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
      return formattedBalances;
    }

    if (!skipStateUpdate) {
      runInAction(() => {
        rawBalances.forEach((balance) => {
          if (!this.rawBalances[balanceKey]) {
            this.rawBalances[balanceKey] = {};
          }
          this.rawBalances[balanceKey][balance.denom] = balance;
        });
        formattedBalances.forEach((balance) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }
          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }

        this.chainWiseStatus[balanceKey] = null;
      });
    }

    this.saveCachedBalances();

    return formattedBalances;
  }

  async fetchMonadErc20TokenBalances(forceAddress?: string) {
    const balanceKey = this.getBalanceKey('monad', undefined, forceAddress);
    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseStatus[balanceKey] = 'loading';
      }
    });

    const pubKey = this.addressStore.pubKeys?.monad;
    const walletAddress = forceAddress || pubKeyToEvmAddressToShow(pubKey);
    const url = `https://api.leapwallet.io/proxy/monad-testnet/balances?address=${walletAddress}`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
      const allERC20TokensToAddInDenoms: Record<string, any> = {};
      const denoms = this.denomsStore.denoms;

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

      const formattedBalances = data?.result?.data
        ?.map((item: any) => {
          if (item.contractAddress === AddressZero) {
            return;
          }

          const token = {
            address: item.contractAddress,
            decimals: item.decimal,
            name: item.name,
            symbol: item.symbol,
            icon_url: item.imageURL || '',
            value: item.balance,
          };

          return this.formatApiBalance(
            token,
            tokensToAddInDenoms,
            denoms,
            'monad',
            undefined,
            undefined,
            allERC20TokensToAddInDenoms,
          );
        })
        .filter(Boolean);

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);
      this.rootERC20DenomsStore.setTempERC20Denoms(allERC20TokensToAddInDenoms, 'monad');

      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }

        this.chainWiseStatus[balanceKey] = null;
      });
      this.saveCachedBalances();
    } catch (e) {
      console.error('Error while fetching monad erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchFormaErc20TokenBalances(forceAddress?: string) {
    const balanceKey = this.getBalanceKey('forma', undefined, forceAddress);
    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseStatus[balanceKey] = 'loading';
      }
    });

    const pubKey = this.addressStore.pubKeys?.forma;
    const walletAddress = forceAddress || pubKeyToEvmAddressToShow(pubKey);
    const url = `https://explorer.forma.art/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
      const allERC20TokensToAddInDenoms: Record<string, any> = {};
      const denoms = this.denomsStore.denoms;

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

      const formattedBalances = data.items.map((item: any) => {
        const token = {
          address: item.token.address,
          decimals: item.token.decimals,
          name: item.token.name,
          symbol: item.token.symbol,
          icon_url: item.token.icon_url || '',
          value: item.value,
        };

        return this.formatApiBalance(
          token,
          tokensToAddInDenoms,
          denoms,
          'forma',
          undefined,
          undefined,
          allERC20TokensToAddInDenoms,
        );
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);
      this.rootERC20DenomsStore.setTempERC20Denoms(allERC20TokensToAddInDenoms, 'forma');

      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }

        this.chainWiseStatus[balanceKey] = null;
      });
      this.saveCachedBalances();
    } catch (e) {
      console.error('Error while fetching forma erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchLightLinkErc20TokenBalances(forceAddress?: string) {
    const balanceKey = this.getBalanceKey('lightlink', undefined, forceAddress);
    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseStatus[balanceKey] = 'loading';
      }
    });

    const pubKey = this.addressStore.pubKeys?.lightlink;
    const walletAddress = forceAddress || pubKeyToEvmAddressToShow(pubKey);
    const explorer =
      this.selectedNetworkStore.selectedNetwork === 'mainnet'
        ? 'https://phoenix.lightlink.io'
        : 'https://pegasus.lightlink.io';
    const url = `${explorer}/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
      const allERC20TokensToAddInDenoms: Record<string, any> = {};
      const denoms = this.denomsStore.denoms;

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

      const formattedBalances = data.items.map((item: any) => {
        const token = {
          address: item.token.address,
          decimals: item.token.decimals,
          name: item.token.name,
          symbol: item.token.symbol,
          icon_url: item.token.icon_url || '',
          value: item.value,
        };

        return this.formatApiBalance(
          token,
          tokensToAddInDenoms,
          denoms,
          'lightlink',
          undefined,
          undefined,
          allERC20TokensToAddInDenoms,
        );
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);
      this.rootERC20DenomsStore.setTempERC20Denoms(allERC20TokensToAddInDenoms, 'lightlink');

      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }

        this.chainWiseStatus[balanceKey] = null;
      });
      this.saveCachedBalances();
    } catch (e) {
      console.error('Error while fetching lightlink erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchMantaErc20TokenBalances(forceAddress?: string) {
    const balanceKey = this.getBalanceKey('manta', undefined, forceAddress);
    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseStatus[balanceKey] = 'loading';
      }
    });

    const pubKey = this.addressStore.pubKeys?.manta;
    const walletAddress = forceAddress || pubKeyToEvmAddressToShow(pubKey);
    const explorer =
      this.selectedNetworkStore.selectedNetwork === 'mainnet'
        ? 'https://pacific-explorer.manta.network'
        : 'https://pacific-explorer.sepolia-testnet.manta.network';
    const url = `${explorer}/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
      const allERC20TokensToAddInDenoms: Record<string, any> = {};
      const denoms = this.denomsStore.denoms;

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

      const formattedBalances = data.items.map((item: any) => {
        const token = {
          address: item.token.address,
          decimals: item.token.decimals,
          name: item.token.name,
          symbol: item.token.symbol,
          icon_url: item.token.icon_url || '',
          value: item.value,
        };

        return this.formatApiBalance(
          token,
          tokensToAddInDenoms,
          denoms,
          'manta',
          undefined,
          undefined,
          allERC20TokensToAddInDenoms,
        );
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);
      this.rootERC20DenomsStore.setTempERC20Denoms(allERC20TokensToAddInDenoms, 'manta');

      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }

        this.chainWiseStatus[balanceKey] = null;
      });
      this.saveCachedBalances();
    } catch (e) {
      console.error('Error while fetching manta erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchAnkrERC20TokenBalances(
    chains: SupportedChain[],
    network?: SelectedNetworkType,
    forceAddresses?: Record<string, string>,
  ) {
    const pubKey = this.addressStore.pubKeys?.[chains[0]];
    const ethAddress = forceAddresses?.[chains[0]] || pubKeyToEvmAddressToShow(pubKey);
    const userPreferredCurrency = this.currencyStore.preferredCurrency;

    try {
      const ankrChains = chains.map((chain) => this.ankrChainMapStore.ankrChainMap[chain]);
      const url = `https://api.leapwallet.io/proxy/ankr`;

      const { data } = await axios.post(url, {
        blockchains: ankrChains,
        walletAddress: ethAddress,
        currency: userPreferredCurrency,
      });

      if (data?.error) {
        throw new Error(data.error.message);
      }

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

      chains.forEach((chain) => {
        const ankrChain = this.ankrChainMapStore.ankrChainMap[chain];
        const tokensToAddInDenoms: Record<string, any> = {};
        const allERC20TokensToAddInDenoms: Record<string, any> = {};
        const denoms = this.denomsStore.denoms;
        const ankrContractsToBlock = this.ankrChainMapStore.ankrContractsToBlock;

        const dataItems = data.result.assets.filter(
          (item: any) =>
            item.tokenType !== 'NATIVE' &&
            Number(item.balance) > 0 &&
            item.blockchain === ankrChain &&
            !ankrContractsToBlock.includes(item.contractAddress), // filter out WGC coin
        );

        const formattedBalances = dataItems.map((item: any) => {
          let checksumAddress = item.contractAddress;
          try {
            if (checksumAddress?.startsWith('0x')) {
              checksumAddress = getAddress(checksumAddress);
            }
          } catch (e) {
            console.error('Error while getting checksum address', e);
          }
          const token = {
            address: checksumAddress,
            decimals: item.tokenDecimals,
            name: item.tokenName,
            symbol: item.tokenSymbol,
            icon_url: item.thumbnail || '',
            value: item.balanceRawInteger,
            usdValue: item.tokenBalance,
            usdPrice: item.tokenPrice,
          };

          return this.formatApiBalance(
            token,
            tokensToAddInDenoms,
            denoms,
            chain,
            undefined,
            undefined,
            allERC20TokensToAddInDenoms,
          );
        });

        this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);
        this.rootERC20DenomsStore.setTempERC20Denoms(allERC20TokensToAddInDenoms, chain);

        runInAction(() => {
          const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain]);

          formattedBalances.forEach((balance: any) => {
            if (!this.chainWiseBalances[balanceKey]) {
              this.chainWiseBalances[balanceKey] = {};
            }

            this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
          });

          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseStatus[balanceKey] = null;
        });
      });

      this.saveCachedBalances();
      return false;
    } catch (e) {
      console.error(`Error while fetching ${chains.join(', ')} ankr erc20 balances`, e);
      runInAction(() => {
        chains.forEach((chain) => {
          this.chainWiseStatus[this.getBalanceKey(chain, network, forceAddresses?.[chain])] = 'error';
        });
      });
      return true;
    }
  }

  async fetchSeiTraceERC20TokensPage(chainId: string, address: string, limit: number, offset: number) {
    const url = `https://api.leapwallet.io/proxy/sei-trace/erc20/balances?limit=${limit}&offset=${offset}&chain_id=${chainId}&address=${address}`;

    const { data } = await axios.get(url);
    return data;
  }

  async fetchAllSeiTraceERC20Tokens(chainId: string, address: string) {
    let offset = 0;
    const limit = 50;
    let allTokens: any[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [data1, data2] = await Promise.all([
        this.fetchSeiTraceERC20TokensPage(chainId, address, limit, offset),
        this.fetchSeiTraceERC20TokensPage(chainId, address, limit, offset + limit),
      ]);

      if (data1.items.length === 0) {
        break;
      }

      allTokens = allTokens.concat(data1.items);

      if (data2.items.length > 0) {
        allTokens = allTokens.concat(data2.items);
      }

      offset += limit * 2;

      if (!data1.next_page_params || !data2.next_page_params) {
        break;
      }
    }

    return allTokens.filter((token) => !!token?.token_symbol);
  }

  async fetchSeiEvmERC20TokenBalances(chain: SupportedChain, network: SelectedNetworkType, forceAddress?: string) {
    const balanceKey = this.getBalanceKey(chain, network, forceAddress);
    const chainInfo = this.chainInfosStore.chainInfos[chain];
    const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;

    const pubKey = this.addressStore.pubKeys?.[chain];
    const ethAddress = forceAddress || pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];

    if (!chainId || !ethAddress || !ethAddress.startsWith('0x')) {
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = {};
        this.chainWiseStatus[balanceKey] = 'error';
      });
      return;
    }

    try {
      const tokensToAddInDenoms: Record<string, any> = {};
      const allERC20TokensToAddInDenoms: Record<string, any> = {};
      const _denoms = this.denomsStore.denoms;
      const _compassDenoms = this.compassTokenTagsStore.compassTokenDenomInfo;

      const denoms = Object.assign({}, _denoms, _compassDenoms);
      const allTokens = await this.fetchAllSeiTraceERC20Tokens(chainId, ethAddress);
      if (!allTokens || allTokens?.length === 0) {
        throw new Error('No tokens found from sei-trace');
      }

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

      const formattedBalances = allTokens.map((item: any) => {
        const token = {
          address: item.token_contract,
          decimals: item.token_decimals,
          name: item.token_name || '',
          symbol: item.token_symbol,
          icon_url: item.token_logo || '',
          value: item.raw_amount,
        };

        const alternateContract = item?.token_association?.sei_hash;
        return this.formatApiBalance(
          token,
          tokensToAddInDenoms,
          denoms,
          chain,
          alternateContract,
          undefined,
          allERC20TokensToAddInDenoms,
        );
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);
      this.betaERC20DenomsStore.setTempBetaERC20Denoms(allERC20TokensToAddInDenoms, chain);
      this.rootERC20DenomsStore.setTempERC20Denoms(allERC20TokensToAddInDenoms, chain);

      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }

        this.chainWiseStatus[balanceKey] = null;
      });
      this.saveCachedBalances();

      return false;
    } catch (e) {
      console.error('Error while fetching sei evm erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
      return true;
    }
  }

  private getBalanceKey(
    chain: SupportedChain,
    forceNetwork?: SelectedNetworkType,
    forceAddress?: string,
    forceCurrency?: Currency,
  ): string {
    const chainKey = this.getChainKey(chain, forceNetwork);
    let address = forceAddress;
    if (!address) {
      if (this.chainInfosStore.chainInfos?.[chain]?.evmOnlyChain) {
        address =
          pubKeyToEvmAddressToShow(this.addressStore?.pubKeys?.[chain], true) || this.addressStore?.addresses?.[chain];
      } else {
        address = this.addressStore?.addresses?.[chain];
      }
    }

    const userPreferredCurrency = forceCurrency ?? this.currencyStore?.preferredCurrency;
    return `${chainKey}-${address}-${userPreferredCurrency}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const network = forceNetwork ?? this.selectedNetworkStore?.selectedNetwork;
    if (chain === 'aggregated') return `aggregated-${network}`;

    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos?.[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos?.[chain]?.chainId;
    return `${chain}-${chainId}`;
  }

  formatBalance(balance: { amount: BigNumber; denom: string }, chain: SupportedChain, denomsInfo?: DenomsRecord) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const coingeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;
    const chainInfo = chainInfos[chain];

    let _denom = balance.denom;
    if (chain === 'noble' && _denom === 'uusdc') {
      _denom = 'usdc';
    }

    const rootDenoms = this.denomsStore.denoms ?? {};
    const betaERC20Denoms = this.betaERC20DenomsStore.getBetaERC20DenomsForChain(chain) ?? {};
    const allDenoms: Record<string, any> = { ...betaERC20Denoms, ...rootDenoms };

    let denomInfo = allDenoms[_denom];
    if (!denomInfo) {
      denomInfo = denomsInfo?.[_denom];
      if (!denomInfo) {
        return null;
      }
    }

    const amount = fromSmall(new BigNumber(balance.amount).toString(), denomInfo?.coinDecimals);

    const coinGeckoId =
      denomInfo?.coinGeckoId ||
      coingeckoIds[denomInfo?.coinMinimalDenom] ||
      coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
      '';

    const { usdPrice, usdValue } = calculateTokenPriceAndValue({
      coingeckoPrices,
      coinMinimalDenom: denomInfo?.coinMinimalDenom,
      chainId: chainInfo.chainId,
      coinGeckoId,
      amount,
    });

    const formattedBalance: Token = {
      chain: denomInfo?.chain ?? '',
      name: denomInfo?.name,
      amount,
      symbol: denomInfo?.coinDenom,
      usdValue: usdValue ?? '',
      coinMinimalDenom: denomInfo?.coinMinimalDenom ?? balance.denom,
      img: denomInfo?.icon,
      ibcDenom: '',
      usdPrice,
      coinDecimals: denomInfo?.coinDecimals,
      coinGeckoId,
      tokenBalanceOnChain: chain as SupportedChain,
    };

    return formattedBalance;
  }

  formatApiBalance(
    token: any,
    tokensToAddInDenoms: Record<string, any>,
    denoms: DenomsRecord,
    chain: SupportedChain,
    alternateContract?: string,
    preferExternalFiatCurrencyValue = true,
    allERC20TokensToAdd?: DenomsRecord,
  ) {
    const contract = token.address;
    let decimals = token.decimals;
    let name = token.name;
    let symbol = token.symbol;
    let icon = token.icon_url || '';
    let coinMinimalDenom = contract;
    const isSeiEvm = this.activeChainStore.isSeiEvm(chain);

    const [, _denomInfo] =
      Object.entries(denoms).find(([key, value]) => {
        if (key.toLowerCase() === contract.toLowerCase()) {
          return value;
        }
      }) ?? [];

    const [, alternativeDenomInfo] = isSeiEvm
      ? Object.entries(denoms).find(([key, value]) => {
          if (key.toLowerCase() === alternateContract?.toLowerCase()) {
            return value;
          }
        }) ?? []
      : [];

    const denomInfo =
      _denomInfo || alternativeDenomInfo
        ? {
            chain: _denomInfo?.chain || alternativeDenomInfo?.chain,
            name:
              _denomInfo?.name ||
              alternativeDenomInfo?.name ||
              _denomInfo?.coinDenom ||
              alternativeDenomInfo?.coinDenom,
            coinDenom: _denomInfo?.coinDenom || alternativeDenomInfo?.coinDenom,
            coinDecimals: _denomInfo?.coinDecimals || alternativeDenomInfo?.coinDecimals,
            icon: _denomInfo?.icon || alternativeDenomInfo?.icon,
            coinGeckoId: _denomInfo?.coinGeckoId || alternativeDenomInfo?.coinGeckoId,
            coinMinimalDenom: _denomInfo?.coinMinimalDenom || contract,
          }
        : undefined;

    const coinGeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

    const coinGeckoId =
      denomInfo?.coinGeckoId ||
      coingeckoIds[denomInfo?.coinMinimalDenom] ||
      coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
      coingeckoIds[contract] ||
      coingeckoIds[contract?.toLowerCase()] ||
      '';

    if (!_denomInfo) {
      tokensToAddInDenoms[contract] = {
        name,
        coinDenom: symbol,
        coinMinimalDenom,
        coinDecimals: decimals,
        coinGeckoId,
        icon,
        chain,
      };
    } else if (!denomInfo?.coinGeckoId && coinGeckoId) {
      tokensToAddInDenoms[contract] = {
        ...denomInfo,
        coinGeckoId,
      };
    }

    if (denomInfo) {
      name = denomInfo.name;
      symbol = denomInfo.coinDenom;
      icon = denomInfo.icon;
      decimals = denomInfo.coinDecimals;
      coinMinimalDenom = denomInfo.coinMinimalDenom;
    }

    if (allERC20TokensToAdd) {
      allERC20TokensToAdd[coinMinimalDenom] = {
        name,
        coinDenom: symbol,
        coinMinimalDenom,
        coinDecimals: decimals,
        coinGeckoId,
        icon,
        chain,
      };
    }

    const chainInfo = this.chainInfosStore.chainInfos[chain];
    const amount = fromSmall(token.value, decimals);

    const { usdPrice: tokenPrice, usdValue } = calculateTokenPriceAndValue({
      coingeckoPrices: coinGeckoPrices,
      coinMinimalDenom: denomInfo?.coinMinimalDenom,
      chainId: chainInfo.chainId,
      coinGeckoId,
      amount,
    });

    const usdPrice = token.usdPrice ? token.usdPrice : tokenPrice ? String(tokenPrice) : undefined;
    return {
      chain,
      name,
      amount,
      symbol,
      usdValue: usdValue ?? '',
      coinMinimalDenom,
      img: icon,
      ibcDenom: '',
      usdPrice,
      coinDecimals: decimals,
      coinGeckoId,
      tokenBalanceOnChain: chain,
    };
  }

  private filterDisplayERC20Tokens(tokens: Token[], chain: SupportedChain, forceAddress?: string) {
    const erc20DenomAddresses = this.getERC20DenomAddresses(chain, forceAddress);
    const disabledCW20Tokens = this.disabledCW20DenomsStore.getDisabledCW20DenomsForChain(chain);
    const enabledCW20Tokens = this.enabledCW20DenomsStore.getEnabledCW20DenomsForChain(chain);

    return tokens.filter((token) =>
      erc20DenomAddresses.includes(token.coinMinimalDenom) && String(token.amount) === '0'
        ? enabledCW20Tokens.includes(token.coinMinimalDenom)
        : !disabledCW20Tokens.includes(token.coinMinimalDenom),
    );
  }

  getERC20DenomAddresses(chain: string, forceAddress?: string): string[] {
    const erc20Denoms = this.erc20DenomsStore.denoms;
    const address = forceAddress || this.addressStore.addresses[chain];
    const disabledCW20Denoms = this.disabledCW20DenomsStore.denoms?.[address] ?? [];

    const enabledERC20Denoms = Object.keys(erc20Denoms?.[chain] ?? {}).filter(
      (denom) => !disabledCW20Denoms.includes(denom),
    );

    const betaERC20Denoms = Object.keys(this.betaERC20DenomsStore.denoms?.[chain] ?? {});
    return Array.from(new Set([...enabledERC20Denoms, ...betaERC20Denoms])).map((denom) => {
      try {
        if (denom?.startsWith('0x')) {
          return getAddress(denom);
        }
      } catch (e) {
        console.error('Error while getting checksum address', e);
      }
      return denom;
    });
  }

  get erc20Tokens() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.allERC20Tokens;
    }

    if (
      isSolanaChain(activeChain) ||
      isAptosChain(activeChain) ||
      isBitcoinChain(activeChain) ||
      isSuiChain(activeChain)
    ) {
      return [];
    }

    const balanceKey = this.getBalanceKey(activeChain);
    const erc20Tokens = this.filterDisplayERC20Tokens(
      Object.values(this.chainWiseBalances[balanceKey] ?? {}),
      activeChain,
    );

    return sortTokenBalances(erc20Tokens);
  }

  getAggregatedERC20Tokens = computedFn(
    (network: SelectedNetworkType, forceAddresses: Record<string, string> | undefined) => {
      let allTokens: Token[] = [];
      const chains = Object.keys(this.chainInfosStore?.chainInfos)?.filter(
        (chain) =>
          network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
      );

      chains.forEach((chain) => {
        if (isSolanaChain(chain) || isAptosChain(chain) || isBitcoinChain(chain) || isSuiChain(chain)) {
          return;
        }

        if (forceAddresses && !forceAddresses[chain as SupportedChain]) {
          return;
        }

        const balanceKey = this.getBalanceKey(
          chain as SupportedChain,
          network,
          forceAddresses?.[chain as SupportedChain],
        );
        const erc20Tokens = this.filterDisplayERC20Tokens(
          Object.values(this.chainWiseBalances[balanceKey] ?? {}),
          chain as SupportedChain,
          forceAddresses?.[chain as SupportedChain],
        );
        allTokens = allTokens.concat(erc20Tokens);
      });

      return sortTokenBalances(allTokens);
    },
  );

  get allERC20Tokens() {
    let allTokens: Token[] = [];
    const network = this.selectedNetworkStore.selectedNetwork;
    const chains = Object.keys(this.chainInfosStore?.chainInfos)?.filter(
      (chain) =>
        network === 'testnet' ||
        this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
    );

    chains.forEach((chain) => {
      if (isSolanaChain(chain) || isAptosChain(chain) || isBitcoinChain(chain) || isSuiChain(chain)) {
        return;
      }

      const balanceKey = this.getBalanceKey(chain as SupportedChain);
      const erc20Tokens = this.filterDisplayERC20Tokens(
        Object.values(this.chainWiseBalances[balanceKey] ?? {}),
        chain as SupportedChain,
      );
      allTokens = allTokens.concat(erc20Tokens);
    });

    return sortTokenBalances(allTokens);
  }

  getERC20TokensForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType, forceAddress?: string) => {
    if (isSolanaChain(chain) || isAptosChain(chain) || isBitcoinChain(chain) || isSuiChain(chain)) {
      return [];
    }

    const balanceKey = this.getBalanceKey(chain, network, forceAddress);
    const erc20Tokens = this.filterDisplayERC20Tokens(
      Object.values(this.chainWiseBalances[balanceKey] ?? {}),
      chain,
      forceAddress,
    );
    return sortTokenBalances(erc20Tokens ?? []);
  });

  getLoadingStatusForChain = (chain: SupportedChain, network: SelectedNetworkType, forceAddress?: string) => {
    const balanceKey = this.getBalanceKey(chain, network, forceAddress);
    return this.chainWiseStatus[balanceKey] === 'loading';
  };

  getErrorStatusForChain = (chain: SupportedChain, network: SelectedNetworkType, forceAddress?: string) => {
    const balanceKey = this.getBalanceKey(chain, network, forceAddress);
    return this.chainWiseStatus[balanceKey] === 'error';
  };

  get loading() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.aggregatedLoadingStatus;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    return this.chainWiseStatus[balanceKey] === undefined || this.chainWiseStatus[balanceKey] === 'loading';
  }

  private async waitForCoingeckoIdsStore() {
    try {
      await this.coingeckoIdsStore.readyPromise;
    } catch (e) {
      //
    }
  }

  private async waitForPriceStore() {
    try {
      await this.priceStore.readyPromise;
    } catch (e) {
      //
    }
  }

  /**
   * Debounce the save of cached balances to storage by 1 second.
   * To avoid multiple calls to the storage adapter.
   */
  private async saveCachedBalances() {
    try {
      if (this.saveCachedBalancesDebounce) {
        clearTimeout(this.saveCachedBalancesDebounce);
      }

      this.saveCachedBalancesDebounce = setTimeout(() => {
        this.saveCachedBalancesToStorage();
        this.saveCachedBalancesDebounce = null;
      }, 1000);
    } catch (e) {
      //
    }
  }

  private async saveCachedBalancesToStorage() {
    try {
      await this.storageAdapter.set(CACHED_ERC20_BALANCES_KEY, toJS(this.chainWiseBalances), 'idb');
    } catch (e) {
      //
    }
  }

  private async initCachedBalances() {
    try {
      const cachedBalances = await this.storageAdapter.get<{ [key: string]: Record<string, Token> }>(
        CACHED_ERC20_BALANCES_KEY,
        'idb',
      );
      if (!cachedBalances) {
        return;
      }

      runInAction(() => {
        this.chainWiseBalances = cachedBalances;
      });
    } catch (e) {
      //
    }
  }

  clearCachedBalancesForChain(chain: SupportedChain, address?: string, forceCurrency?: Currency) {
    try {
      const balanceKey = this.getBalanceKey(chain, 'mainnet', address, forceCurrency);
      if (this.chainWiseBalances?.[balanceKey]) {
        runInAction(() => {
          delete this.chainWiseBalances[balanceKey];
        });
      }
    } catch (e) {
      //
    }
    try {
      const balanceKey = this.getBalanceKey(chain, 'testnet', address, forceCurrency);
      if (this.chainWiseBalances?.[balanceKey]) {
        runInAction(() => {
          delete this.chainWiseBalances[balanceKey];
        });
      }
    } catch (e) {
      //
    }
  }

  /**
   * Clear the cached balances for the given addresses.
   * It will use `forceAddresses` and `chainInfosStore` to calculate the balance keys.
   * It will clear the balances for the mainnet and testnet,
   * If balances are present for corresponding networks.
   *
   * @param forceAddresses - The addresses to clear the balances for.
   */
  clearCachedBalances(forceAddresses: Record<string, string>) {
    try {
      Object.keys(this.chainInfosStore.chainInfos).forEach((chain) => {
        if (!forceAddresses?.[chain as SupportedChain]) {
          return;
        }

        this.clearCachedBalancesForChain(chain as SupportedChain, forceAddresses?.[chain as SupportedChain]);
      });
      this.saveCachedBalances();
    } catch (e) {
      //
    }
  }
}
