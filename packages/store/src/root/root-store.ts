import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BalanceStore, CW20DenomBalanceStore, ERC20DenomBalanceStore, EvmBalanceStore, PriceStore } from 'bank';
import BigNumber from 'bignumber.js';
import { computed, makeObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { ClaimRewardsStore, DelegationsStore, UndelegationsStore, ValidatorsStore } from 'stake';

import { ChainInfosStore, NmsStore } from '../assets';
import { sortTokenBalances } from '../bank/balance-calculator';
import { AggregatedSupportedChainType, SelectedNetworkType, SupportedCurrencies } from '../types';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';

export class RootStakeStore {
  delegationStore: DelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  unDelegationsStore: UndelegationsStore;
  validatorsStore: ValidatorsStore;

  constructor(
    delegationsStore: DelegationsStore,
    claimRewardsStore: ClaimRewardsStore,
    unDelegationsStore: UndelegationsStore,
    validatorsStore: ValidatorsStore,
  ) {
    this.delegationStore = delegationsStore;
    this.claimRewardsStore = claimRewardsStore;
    this.unDelegationsStore = unDelegationsStore;
    this.validatorsStore = validatorsStore;
  }

  async updateStake(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, forceRefetch = false) {
    await Promise.all([
      this.delegationStore.loadDelegations(chain, network, forceRefetch),
      this.claimRewardsStore.loadClaimRewards(chain, network, forceRefetch),
      this.unDelegationsStore.loadUndelegations(chain, network, forceRefetch),
      this.validatorsStore.loadValidators(chain, network, forceRefetch),
    ]);
  }
}

export class RootBalanceStore {
  nativeBalanceStore: BalanceStore;
  erc20BalanceStore: ERC20DenomBalanceStore;
  cw20BalanceStore: CW20DenomBalanceStore;
  activeChainStore: ActiveChainStore;
  chainInfosStore: ChainInfosStore;
  evmBalanceStore: EvmBalanceStore;

  constructor(
    balanceStore: BalanceStore,
    erc20BalanceStore: ERC20DenomBalanceStore,
    cw20BalanceStore: CW20DenomBalanceStore,
    activeChainStore: ActiveChainStore,
    chainInfosStore: ChainInfosStore,
    evmBalanceStore: EvmBalanceStore,
  ) {
    this.nativeBalanceStore = balanceStore;
    this.erc20BalanceStore = erc20BalanceStore;
    this.cw20BalanceStore = cw20BalanceStore;
    this.activeChainStore = activeChainStore;
    this.chainInfosStore = chainInfosStore;
    this.evmBalanceStore = evmBalanceStore;

    makeObservable(this, {
      allTokens: computed,
      allSpendableTokens: computed,
      loading: computed,
      totalFiatValue: computed,
    });
  }

  get allTokens() {
    const activeChain = this.activeChainStore?.activeChain;
    if (activeChain === 'aggregated') {
      return sortTokenBalances(
        this.nativeBalanceStore.balances.concat(this.erc20BalanceStore.erc20Tokens, this.cw20BalanceStore.cw20Tokens),
      );
    }

    const nativeDenoms = this.chainInfosStore?.chainInfos?.[activeChain]?.nativeDenoms ?? [];
    const nativeTokens = this.nativeBalanceStore.balances.filter(
      (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
    );
    const nonNativeBankTokens = this.nativeBalanceStore.balances.filter(
      (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
    );

    return nativeTokens.concat(
      sortTokenBalances(
        this.erc20BalanceStore.erc20Tokens.concat(this.cw20BalanceStore.cw20Tokens, nonNativeBankTokens),
      ),
    );
  }

  get allSpendableTokens() {
    const activeChain = this.activeChainStore?.activeChain;
    if (activeChain === 'aggregated') {
      return sortTokenBalances(
        this.nativeBalanceStore.spendableBalances.concat(
          this.erc20BalanceStore.erc20Tokens,
          this.cw20BalanceStore.cw20Tokens,
        ),
      );
    }

    const nativeDenoms = this.chainInfosStore?.chainInfos?.[activeChain]?.nativeDenoms ?? [];
    const nativeTokens = this.nativeBalanceStore.spendableBalances.filter(
      (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
    );
    const nonNativeBankTokens = this.nativeBalanceStore.spendableBalances.filter(
      (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
    );

    return nativeTokens.concat(
      sortTokenBalances(
        this.erc20BalanceStore.erc20Tokens.concat(this.cw20BalanceStore.cw20Tokens, nonNativeBankTokens),
      ),
    );
  }

  getSpendableBalancesForChain = computedFn((chain: SupportedChain) => {
    const nativeDenoms = this.chainInfosStore?.chainInfos?.[chain]?.nativeDenoms ?? [];
    const bankTokens = this.nativeBalanceStore.getSpendableBalancesForChain(chain);
    const nativeTokens = bankTokens.filter(
      (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
    );
    const nonNativeBankTokens = bankTokens.filter(
      (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
    );
    const erc20Tokens = this.erc20BalanceStore.getERC20TokensForChain(chain);
    const cw20Tokens = this.cw20BalanceStore.getCW20TokensForChain(chain);

    return nativeTokens.concat(sortTokenBalances(cw20Tokens.concat(erc20Tokens, nonNativeBankTokens)));
  });

  getBalancesForChain = computedFn((chain: SupportedChain) => {
    const nativeDenoms = this.chainInfosStore?.chainInfos?.[chain]?.nativeDenoms ?? [];
    const bankTokens = this.nativeBalanceStore.getBalancesForChain(chain);
    const nativeTokens = bankTokens.filter(
      (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
    );
    const nonNativeBankTokens = bankTokens.filter(
      (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
    );
    const erc20Tokens = this.erc20BalanceStore.getERC20TokensForChain(chain);
    const cw20Tokens = this.cw20BalanceStore.getCW20TokensForChain(chain);

    return nativeTokens.concat(sortTokenBalances(cw20Tokens.concat(erc20Tokens, nonNativeBankTokens)));
  });

  getLoadingStatusForChain = computedFn((chain: SupportedChain) => {
    return (
      this.nativeBalanceStore.getLoadingStatusForChain(chain) ||
      this.erc20BalanceStore.getLoadingStatusForChain(chain) ||
      this.cw20BalanceStore.getLoadingStatusForChain(chain)
    );
  });

  get loading() {
    const activeChain = this.activeChainStore?.activeChain;
    if (this.chainInfosStore.chainInfos[activeChain as SupportedChain]?.evmOnlyChain) {
      return this.evmBalanceStore.evmBalance.status === 'loading' || this.erc20BalanceStore.loading;
    }

    if (activeChain === 'aggregated' && this.nativeBalanceStore.aggregateBalanceVisible) {
      return false;
    }

    return this.nativeBalanceStore.loadingStatus || this.erc20BalanceStore.loading || this.cw20BalanceStore.loading;
  }

  get totalFiatValue() {
    let totalFiatValue = new BigNumber(0);
    const balances = this.allTokens;

    for (const asset of balances) {
      if (asset.usdValue) {
        totalFiatValue = totalFiatValue.plus(new BigNumber(asset.usdValue));
      }
    }

    return totalFiatValue;
  }

  async loadBalances(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType) {
    await Promise.all([
      this.nativeBalanceStore.loadBalances(chain, network),
      this.erc20BalanceStore.fetchChainBalances(chain),
      this.cw20BalanceStore.fetchChainBalances(chain),
    ]);
  }

  async refetchBalances(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType) {
    await Promise.all([
      this.nativeBalanceStore.loadBalances(chain, network, true),
      this.erc20BalanceStore.fetchChainBalances(chain),
      this.cw20BalanceStore.fetchChainBalances(chain),
    ]);
  }
}

export class RootStore {
  nmsStore: NmsStore;
  addressStore: AddressStore;
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  rootStakeStore: RootStakeStore;
  rootBalanceStore: RootBalanceStore;
  priceStore: PriceStore;
  currencyStore: CurrencyStore;
  chainInfosStore: ChainInfosStore;
  evmBalanceStore: EvmBalanceStore;

  constructor(
    nmsStore: NmsStore,
    addressStore: AddressStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    rootBalanceStore: RootBalanceStore,
    rootStakeStore: RootStakeStore,
    priceStore: PriceStore,
    currencyStore: CurrencyStore,
    chainInfosStore: ChainInfosStore,
    evmBalanceStore: EvmBalanceStore,
  ) {
    this.nmsStore = nmsStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.rootStakeStore = rootStakeStore;
    this.rootBalanceStore = rootBalanceStore;
    this.priceStore = priceStore;
    this.currencyStore = currencyStore;
    this.chainInfosStore = chainInfosStore;
    this.evmBalanceStore = evmBalanceStore;
  }

  async initStores() {
    await this.nmsStore.readyPromise;
    await this.addressStore.loadAddresses();
    await Promise.all([
      this.rootBalanceStore.loadBalances(),
      this.rootStakeStore.updateStake(),
      this.evmBalanceStore.loadEvmBalance(),
    ]);
  }

  async reloadAddresses() {
    await this.addressStore.loadAddresses();
    if (this.addressStore.addresses) {
      await Promise.all([
        this.rootBalanceStore.loadBalances(),
        this.rootStakeStore.updateStake(),
        this.evmBalanceStore.loadEvmBalance(),
      ]);
    }
  }

  async setActiveChain(chain: AggregatedSupportedChainType) {
    if (this.activeChainStore.activeChain === chain) return;
    this.activeChainStore.setActiveChain(chain);
    await Promise.all([
      this.rootBalanceStore.loadBalances(chain, this.selectedNetworkStore.selectedNetwork),
      this.rootStakeStore.updateStake(chain, this.selectedNetworkStore.selectedNetwork),
      this.evmBalanceStore.loadEvmBalance(chain as SupportedChain),
    ]);
  }

  async setSelectedNetwork(network: SelectedNetworkType) {
    if (this.selectedNetworkStore.selectedNetwork === network) return;
    this.selectedNetworkStore.setSelectedNetwork(network);
    await Promise.all([
      this.rootBalanceStore.loadBalances(this.activeChainStore.activeChain, this.selectedNetworkStore.selectedNetwork),
      this.rootStakeStore.updateStake(this.activeChainStore.activeChain, network),
      this.evmBalanceStore.loadEvmBalance(undefined, network),
    ]);
  }

  async setPreferredCurrency(currency: SupportedCurrencies) {
    this.currencyStore.updatePreferredCurrency(currency);
    await this.priceStore.getData();
    await Promise.all([
      this.rootBalanceStore.loadBalances(),
      this.rootStakeStore.updateStake(),
      this.evmBalanceStore.loadEvmBalance(),
    ]);
  }

  async setChains(chainInfos: Record<SupportedChain, ChainInfo>) {
    this.chainInfosStore.setChainInfos(chainInfos);
    await Promise.all([
      this.rootBalanceStore.loadBalances(),
      this.rootStakeStore.updateStake(),
      this.evmBalanceStore.loadEvmBalance(),
    ]);
  }
}
