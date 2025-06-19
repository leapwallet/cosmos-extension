import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import {
  DenomsRecord,
  fetchERC20Balances,
  fromSmall,
  getEthereumAddress,
  isAptosChain,
  isSolanaChain,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { AggregatedSupportedChainType, SelectedNetworkType } from 'types';

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
} from '../assets';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { BalanceLoadingStatus, Token } from './balance-types';
import { EVMBalanceAPIStore } from './evm-balance-api-store';
import { EvmBalanceStore } from './evm-balance-store';
import { PriceStore } from './price-store';

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

  async loadBalances(_chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, refetch = false) {
    const _network = network ?? this.selectedNetworkStore.selectedNetwork;
    const chain = _chain || this.activeChainStore.activeChain;
    if (chain === 'aggregated') {
      return this.fetchAggregatedBalances(_network, refetch);
    }

    try {
      await this.fetchChainBalances(chain, _network, refetch);
    } catch (e) {
      console.error('Error while fetching balances', e);
      runInAction(() => {
        this.chainWiseStatus[this.getBalanceKey(chain, _network)] = null;
      });
    }
  }

  async fetchAggregatedBalances(network: SelectedNetworkType, refetch = false) {
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
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
        const isAptos = isAptosChain(this.chainInfosStore.chainInfos[chain as SupportedChain]?.key);
        const isSolana = isSolanaChain(this.chainInfosStore.chainInfos[chain as SupportedChain]?.key);
        if ((this.chainWiseBalances[balanceKey] && !refetch) || isAptos || isSolana) {
          runInAction(() => {
            this.chainWiseStatus[balanceKey] = null;
          });
          return;
        }
        const pubKey = this.addressStore.pubKeys?.[chain];
        const ethWalletAddress = pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];
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
      const balanceKey = this.getBalanceKey(chain, network);
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
      return;
    }

    await Promise.allSettled(
      chainsToUseFallbackFor.map(async (chain) => {
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network);

        if (!refetch && this.chainWiseBalances[balanceKey]) {
          runInAction(() => {
            this.chainWiseStatus[balanceKey] = null;
          });
          return;
        }

        if (this.ankrChainMapStore.ankrChainMap[chain]) {
          await this.evmBalanceStore.loadEvmBalance(chain as SupportedChain, network, refetch, true);
          const evmBalance = this.evmBalanceStore.evmBalanceForChain(chain as SupportedChain, network);

          if (Number(evmBalance?.evmBalance?.[0]?.amount) > 0) {
            evmChainsList.push(chain as SupportedChain);
            return;
          }
        }

        return this.fetchERC20TokenBalances(chain as SupportedChain, network);
      }),
    );

    if (evmChainsList.length > 0) {
      const isApiDown = await this.fetchAnkrERC20TokenBalances(evmChainsList, network);

      if (isApiDown) {
        await Promise.allSettled(
          evmChainsList.map(async (chain) => {
            return this.fetchERC20TokenBalances(chain, network);
          }),
        );
      }
    }

    runInAction(() => {
      this.aggregatedLoadingStatus = false;
    });
  }

  async fetchChainBalances(
    chain: SupportedChain,
    network: SelectedNetworkType,
    refetch = false,
    forceFallback = false,
  ) {
    const balanceKey = this.getBalanceKey(chain, network);

    if (!refetch && this.chainWiseBalances[balanceKey]) {
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = null;
      });
      return;
    }

    if (!forceFallback) {
      const pubKey = this.addressStore.pubKeys?.[chain];
      const ethWalletAddress = pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];
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
        return;
      }
    }

    if (chain === 'monad') {
      await this.fetchMonadErc20TokenBalances();
      return;
    }

    if (chain === 'forma') {
      await this.fetchFormaErc20TokenBalances();
      return;
    }

    if (chain === 'flame') {
      await this.fetchFlameErc20TokenBalances();
      return;
    }

    if (chain === 'lightlink') {
      await this.fetchLightLinkErc20TokenBalances();
      return;
    }

    if (chain === 'manta') {
      await this.fetchMantaErc20TokenBalances();
      return;
    }

    if (this.ankrChainMapStore.ankrChainMap[chain]) {
      await this.evmBalanceStore.loadEvmBalance(chain, network, refetch, true);
      const evmBalance = this.evmBalanceStore.evmBalanceForChain(chain, network);

      if (Number(evmBalance?.evmBalance?.[0]?.amount) <= 0) {
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

      const isApiDown = await this.fetchAnkrERC20TokenBalances([chain], network);
      if (isApiDown) {
        return this.fetchERC20TokenBalances(chain, network);
      } else {
        return;
      }
    }

    const isSeiEvm = this.activeChainStore.isSeiEvm(chain);
    if (isSeiEvm && chain !== 'seiDevnet') {
      runInAction(() => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseStatus[balanceKey] = 'loading';
        }
      });

      const isApiDown = await this.fetchSeiEvmERC20TokenBalances(chain, network);

      if (isApiDown) {
        return this.fetchERC20TokenBalances(chain, network);
      }

      await this.fetchERC20TokenBalances(chain, network, Object.keys(this.erc404DenomsStore.denoms[chain] ?? []));

      runInAction(() => {
        this.chainWiseStatus[balanceKey] = null;
      });
      return;
    }

    await this.fetchERC20TokenBalances(chain, network);
  }

  async fetchERC20TokenBalances(
    activeChain: SupportedChain,
    network: SelectedNetworkType,
    forceERC20Denoms?: string[],
    skipStateUpdate = false,
    denomsInfo?: DenomsRecord,
  ): Promise<Token[] | undefined> {
    let erc20DenomAddresses: string[] | undefined = forceERC20Denoms;
    await this.erc20DenomsStore.readyPromise;
    if (!erc20DenomAddresses) {
      erc20DenomAddresses = this.getERC20DenomAddresses(activeChain);
    }
    const chainInfo = this.chainInfosStore.chainInfos[activeChain];

    if (!chainInfo) {
      return;
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

    if (!address || !pubKey) {
      return;
    }

    let ethWalletAddress = getEthereumAddress(address);
    const balanceKey = this.getBalanceKey(activeChain, network);

    try {
      if (isEvmChain) {
        ethWalletAddress = pubKeyToEvmAddressToShow(pubKey, true) || getEthereumAddress(address);
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

    return formattedBalances;
  }

  async fetchFlameErc20TokenBalances() {
    const balanceKey = this.getBalanceKey('flame');
    runInAction(() => {
      this.chainWiseStatus[balanceKey] = 'loading';
    });

    const pubKey = this.addressStore.pubKeys?.forma;
    const walletAddress = pubKeyToEvmAddressToShow(pubKey);
    const explorer =
      this.selectedNetworkStore.selectedNetwork === 'mainnet'
        ? 'https://explorer.flame.astria.org'
        : 'https://explorer.flame.dawn-1.astria.org';
    const url = `${explorer}/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
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

        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, 'flame');
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);

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
    } catch (e) {
      console.error('Error while fetching flame erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchMonadErc20TokenBalances() {
    const balanceKey = this.getBalanceKey('monad');
    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseStatus[balanceKey] = 'loading';
      }
    });

    const pubKey = this.addressStore.pubKeys?.monad;
    const walletAddress = pubKeyToEvmAddressToShow(pubKey);
    const url = `https://api.leapwallet.io/proxy/monad-testnet/balances?address=${walletAddress}`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
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

          return this.formatApiBalance(token, tokensToAddInDenoms, denoms, 'monad');
        })
        .filter(Boolean);

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);

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
    } catch (e) {
      console.error('Error while fetching monad erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchFormaErc20TokenBalances() {
    const balanceKey = this.getBalanceKey('forma');
    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseStatus[balanceKey] = 'loading';
      }
    });

    const pubKey = this.addressStore.pubKeys?.forma;
    const walletAddress = pubKeyToEvmAddressToShow(pubKey);
    const url = `https://explorer.forma.art/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
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

        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, 'forma');
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);

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
    } catch (e) {
      console.error('Error while fetching forma erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchLightLinkErc20TokenBalances() {
    const balanceKey = this.getBalanceKey('lightlink');
    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseStatus[balanceKey] = 'loading';
      }
    });

    const pubKey = this.addressStore.pubKeys?.lightlink;
    const walletAddress = pubKeyToEvmAddressToShow(pubKey);
    const explorer =
      this.selectedNetworkStore.selectedNetwork === 'mainnet'
        ? 'https://phoenix.lightlink.io'
        : 'https://pegasus.lightlink.io';
    const url = `${explorer}/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
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

        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, 'lightlink');
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);

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
    } catch (e) {
      console.error('Error while fetching lightlink erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchMantaErc20TokenBalances() {
    const balanceKey = this.getBalanceKey('manta');
    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseStatus[balanceKey] = 'loading';
      }
    });

    const pubKey = this.addressStore.pubKeys?.manta;
    const walletAddress = pubKeyToEvmAddressToShow(pubKey);
    const explorer =
      this.selectedNetworkStore.selectedNetwork === 'mainnet'
        ? 'https://pacific-explorer.manta.network'
        : 'https://pacific-explorer.sepolia-testnet.manta.network';
    const url = `${explorer}/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
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

        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, 'manta');
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);

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
    } catch (e) {
      console.error('Error while fetching manta erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchAnkrERC20TokenBalances(chains: SupportedChain[], network?: SelectedNetworkType) {
    const pubKey = this.addressStore.pubKeys?.[chains[0]];
    const ethAddress = pubKeyToEvmAddressToShow(pubKey);
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

          return this.formatApiBalance(token, tokensToAddInDenoms, denoms, chain);
        });

        this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);

        runInAction(() => {
          const balanceKey = this.getBalanceKey(chain, network);

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

      return false;
    } catch (e) {
      console.error(`Error while fetching ${chains.join(', ')} ankr erc20 balances`, e);
      runInAction(() => {
        chains.forEach((chain) => {
          this.chainWiseStatus[this.getBalanceKey(chain, network)] = 'error';
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

  async fetchSeiEvmERC20TokenBalances(chain: SupportedChain, network: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    const chainInfo = this.chainInfosStore.chainInfos[chain];
    const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;

    const pubKey = this.addressStore.pubKeys?.[chain];
    const ethAddress = pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];

    if (!chainId || !ethAddress || !pubKey || !ethAddress.startsWith('0x')) {
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = {};
        this.chainWiseStatus[balanceKey] = 'error';
      });
      return;
    }

    try {
      const tokensToAddInDenoms: Record<string, any> = {};
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
        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, chain, alternateContract);
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);

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

      return false;
    } catch (e) {
      console.error('Error while fetching sei evm erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
      return true;
    }
  }

  private getBalanceKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const chainKey = this.getChainKey(chain, forceNetwork);
    const address = this.addressStore.addresses[chain];
    const userPreferredCurrency = this.currencyStore.preferredCurrency;
    return `${chainKey}-${address}-${userPreferredCurrency}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') return `aggregated-${network}`;

    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;
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

    let usdValue;
    let tokenPrice;
    const coinGeckoId =
      denomInfo?.coinGeckoId ||
      coingeckoIds[denomInfo?.coinMinimalDenom] ||
      coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
      '';

    if (parseFloat(amount) > 0) {
      if (coingeckoPrices) {
        const alternateCoingeckoKey = `${chainInfo.chainId}-${denomInfo.coinMinimalDenom}`;

        if (coinGeckoId) {
          tokenPrice = coingeckoPrices[coinGeckoId];
        }
        if (!tokenPrice) {
          tokenPrice = coingeckoPrices[alternateCoingeckoKey] ?? coingeckoPrices[alternateCoingeckoKey?.toLowerCase()];
        }
        if (tokenPrice) {
          usdValue = new BigNumber(amount).times(tokenPrice).toString();
        }
      }
    }

    const usdPrice = tokenPrice ? String(tokenPrice) : undefined;

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

    const chainInfo = this.chainInfosStore.chainInfos[chain];
    const amount = fromSmall(token.value, decimals);
    let usdValue = token.usdValue;
    let tokenPrice;

    // TODO: (preferExternalFiatCurrencyValue === true || !token.usdValue) &&  add this back in future
    if (coinGeckoPrices && parseFloat(amount) > 0) {
      const alternateCoingeckoKey = `${chainInfo.chainId}-${contract}`;

      if (coinGeckoId) {
        tokenPrice = coinGeckoPrices[coinGeckoId];
      }
      if (!tokenPrice) {
        tokenPrice = coinGeckoPrices[alternateCoingeckoKey] ?? coinGeckoPrices[alternateCoingeckoKey?.toLowerCase()];
      }
      if (tokenPrice) {
        usdValue = new BigNumber(amount).times(tokenPrice).toString();
      }
    }

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

  private filterDisplayERC20Tokens(tokens: Token[], chain: SupportedChain) {
    const erc20DenomAddresses = this.getERC20DenomAddresses(chain);
    const disabledCW20Tokens = this.disabledCW20DenomsStore.getDisabledCW20DenomsForChain(chain);
    const enabledCW20Tokens = this.enabledCW20DenomsStore.getEnabledCW20DenomsForChain(chain);

    return tokens.filter((token) =>
      erc20DenomAddresses.includes(token.coinMinimalDenom) && String(token.amount) === '0'
        ? enabledCW20Tokens.includes(token.coinMinimalDenom)
        : !disabledCW20Tokens.includes(token.coinMinimalDenom),
    );
  }

  getERC20DenomAddresses(chain: string): string[] {
    const erc20Denoms = this.erc20DenomsStore.denoms;
    const address = this.addressStore.addresses[chain];
    const disabledCW20Denoms = this.disabledCW20DenomsStore.denoms?.[address] ?? [];

    const enabledERC20Denoms = Object.keys(erc20Denoms?.[chain] ?? {}).filter(
      (denom) => !disabledCW20Denoms.includes(denom),
    );

    const betaERC20Denoms = Object.keys(this.betaERC20DenomsStore.denoms?.[chain] ?? {});
    return Array.from(new Set([...enabledERC20Denoms, ...betaERC20Denoms]));
  }

  get erc20Tokens() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.allERC20Tokens;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    const erc20Tokens = this.filterDisplayERC20Tokens(
      Object.values(this.chainWiseBalances[balanceKey] ?? {}),
      activeChain,
    );

    return sortTokenBalances(erc20Tokens);
  }

  getAggregatedERC20Tokens = computedFn((network: SelectedNetworkType) => {
    let allTokens: Token[] = [];
    const chains = Object.keys(this.chainInfosStore?.chainInfos)?.filter(
      (chain) =>
        network === 'testnet' ||
        this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
    );

    chains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
      const erc20Tokens = this.filterDisplayERC20Tokens(
        Object.values(this.chainWiseBalances[balanceKey] ?? {}),
        chain as SupportedChain,
      );
      allTokens = allTokens.concat(erc20Tokens);
    });

    return sortTokenBalances(allTokens);
  });

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
      const balanceKey = this.getBalanceKey(chain as SupportedChain);
      const erc20Tokens = this.filterDisplayERC20Tokens(
        Object.values(this.chainWiseBalances[balanceKey] ?? {}),
        chain as SupportedChain,
      );
      allTokens = allTokens.concat(erc20Tokens);
    });

    return sortTokenBalances(allTokens);
  }

  getERC20TokensForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    const erc20Tokens = this.filterDisplayERC20Tokens(Object.values(this.chainWiseBalances[balanceKey] ?? {}), chain);
    return sortTokenBalances(erc20Tokens ?? []);
  });

  getLoadingStatusForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseStatus[balanceKey] === 'loading';
  };

  getErrorStatusForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseStatus[balanceKey] === 'error';
  };

  get loading() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.aggregatedLoadingStatus;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    return this.chainWiseStatus[balanceKey] !== null;
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
}
