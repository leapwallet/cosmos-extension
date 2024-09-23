import {
  fetchERC20Balances,
  fromSmall,
  getEthereumAddress,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { AggregatedSupportedChainType } from 'types';

import {
  BetaERC20DenomsStore,
  ChainInfosStore,
  CompassSeiEvmConfigStore,
  DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  ERC20DenomsStore,
  NmsStore,
} from '../assets';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { PriceStore } from './balance-store';
import { Token } from './balance-types';

export class ERC20DenomBalanceStore {
  chainWiseBalances: Record<string, Record<string, Token>> = {};
  rawBalances: Record<string, Record<string, any>> = {};
  aggregatedLoadingStatus: boolean = false;
  chainWiseLoadingStatus: Record<string, boolean> = {};
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
    ]);
  }

  async fetchChainBalances(forceChain?: AggregatedSupportedChainType) {
    const _activeChain = this.activeChainStore.activeChain;
    const activeChain = forceChain ?? _activeChain;

    if (activeChain === 'aggregated') {
      runInAction(() => {
        this.aggregatedLoadingStatus = true;
      });
      const allChains = Object.keys(this.chainInfosStore.chainInfos)?.filter((chain) => chain !== 'aggregated');
      await Promise.allSettled(allChains.map((chain) => this.fetchERC20TokenBalances(chain as SupportedChain)));
      runInAction(() => {
        this.aggregatedLoadingStatus = false;
      });
      return;
    }

    await this.fetchERC20TokenBalances(activeChain);
  }

  async fetchERC20TokenBalances(activeChain: SupportedChain, forceERC20Denoms?: string[]) {
    const erc20DenomAddresses = forceERC20Denoms ?? this.getERC20DenomAddresses(activeChain);
    const selectedNetwork = this.selectedNetworkStore.selectedNetwork;
    const chainInfo = this.chainInfosStore.chainInfos[activeChain];

    const address = this.addressStore.addresses[chainInfo.key];
    const pubKey = this.addressStore.pubKeys?.[activeChain];

    const evmJsonRpcUrl =
      selectedNetwork === 'testnet'
        ? chainInfo.apis.evmJsonRpcTest ?? chainInfo.apis.evmJsonRpc
        : chainInfo.apis.evmJsonRpc;

    const isSeiEvm = this.activeChainStore.isSeiEvm(activeChain);
    const isEvmChain = isSeiEvm || chainInfo?.evmOnlyChain;

    if (!address || !pubKey) {
      return;
    }

    const ethWalletAddress = isEvmChain ? pubKeyToEvmAddressToShow(pubKey) : getEthereumAddress(address);
    const balanceKey = this.getBalanceKey(activeChain);
    if (!chainInfo) {
      return;
    }
    if (!evmJsonRpcUrl || !ethWalletAddress || !erc20DenomAddresses || erc20DenomAddresses.length === 0) {
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
      return;
    }

    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseLoadingStatus[balanceKey] = true;
      }
    });

    const formattedBalances: Token[] = [];
    let rawBalances: {
      denom: string;
      amount: BigNumber;
    }[] = [];

    try {
      rawBalances = await fetchERC20Balances(evmJsonRpcUrl, ethWalletAddress, erc20DenomAddresses);
      if (rawBalances && rawBalances.length > 0) {
        await Promise.allSettled(
          rawBalances.map(async (balance) => {
            try {
              const formattedToken = this.formatBalance(balance, activeChain);
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
    }

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
      this.chainWiseLoadingStatus[balanceKey] = false;
    });
  }

  private getBalanceKey(chain: AggregatedSupportedChainType): string {
    const chainKey = this.getChainKey(chain);
    const address = this.addressStore.addresses[chain];
    return `${chainKey}-${address}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType): string {
    if (chain === 'aggregated') return 'aggregated';
    const chainId =
      this.selectedNetworkStore.selectedNetwork === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;
    return `${chain}-${chainId}`;
  }

  formatBalance(balance: { amount: BigNumber; denom: string }, chain: SupportedChain) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const coingeckoPrices = this.priceStore.data;
    const denoms = this.denomsStore.denoms;
    const chainInfo = chainInfos[chain];
    let _denom = balance.denom;
    if (chain === 'noble' && _denom === 'uusdc') {
      _denom = 'usdc';
    }

    const denomInfo = denoms?.[_denom];

    if (!denomInfo) {
      return null;
    }

    const amount = fromSmall(new BigNumber(balance.amount).toString(), denomInfo?.coinDecimals);

    let usdValue;
    if (parseFloat(amount) > 0) {
      if (coingeckoPrices) {
        let tokenPrice;
        const coinGeckoId = denomInfo.coinGeckoId;
        const alternateCoingeckoKey = `${chainInfo.chainId}-${denomInfo.coinMinimalDenom}`;

        if (coinGeckoId) {
          tokenPrice = coingeckoPrices[coinGeckoId];
        }
        if (!tokenPrice) {
          tokenPrice = coingeckoPrices[alternateCoingeckoKey];
        }
        if (tokenPrice) {
          usdValue = new BigNumber(amount).times(tokenPrice).toString();
        }
      }
    }

    const usdPrice = parseFloat(amount) > 0 && usdValue ? (Number(usdValue) / Number(amount)).toString() : '0';

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
      coinGeckoId: denomInfo?.coinGeckoId,
      tokenBalanceOnChain: chain as SupportedChain,
    };

    return formattedBalance;
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

    return [...enabledERC20Denoms, ...betaERC20Denoms];
  }

  get erc20Tokens() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return sortTokenBalances(this.allERC20Tokens);
    }

    const balanceKey = this.getBalanceKey(activeChain);
    const erc20Tokens = this.filterDisplayERC20Tokens(
      Object.values(this.chainWiseBalances[balanceKey] ?? {}),
      activeChain,
    );

    return sortTokenBalances(erc20Tokens);
  }

  get allERC20Tokens() {
    let allTokens: Token[] = [];
    const chains = Object.keys(this.chainInfosStore?.chainInfos);

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

  getERC20TokensForChain = computedFn((chain: SupportedChain) => {
    const balanceKey = this.getBalanceKey(chain);
    const erc20Tokens = this.filterDisplayERC20Tokens(Object.values(this.chainWiseBalances[balanceKey] ?? {}), chain);
    return sortTokenBalances(erc20Tokens ?? []);
  });

  getLoadingStatusForChain = computedFn((chain: SupportedChain) => {
    const balanceKey = this.getBalanceKey(chain);
    return this.chainWiseLoadingStatus[balanceKey] ?? true;
  });

  get loading() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.aggregatedLoadingStatus;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    return this.chainWiseLoadingStatus[balanceKey] ?? true;
  }
}
