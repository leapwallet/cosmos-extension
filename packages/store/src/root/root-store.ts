import {
  ChainInfo,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { ChainInfosStore, CompassSeiTokensAssociationStore, NmsStore, ZeroStateTokensStore } from '../assets';
import {
  BalanceStore,
  CW20DenomBalanceStore,
  ERC20DenomBalanceStore,
  EvmBalanceStore,
  PercentageChangeDataStore,
  PriceStore,
} from '../bank';
import { AptosCoinDataStore } from '../bank/aptos-balance-store';
import { sortTokenBalances } from '../bank/balance-calculator';
import { BitcoinDataStore } from '../bank/bitcoin-balance-store';
import { SolanaCoinDataStore } from '../bank/solana-balance-store';
import { SuiCoinDataStore } from '../bank/sui-balance-store';
import { ClaimRewardsStore, DelegationsStore, StakeEpochStore, UndelegationsStore, ValidatorsStore } from '../stake';
import { AggregatedSupportedChainType, BalanceErrorStatus, SelectedNetworkType, SupportedCurrencies } from '../types';
import { filterDuplicateSeiToken } from '../utils/filter-tokens';
import { isBitcoinChain } from '../utils/is-bitcoin-chain';
import { ActiveChainStore, AddressStore, currencyDetail, CurrencyStore, SelectedNetworkStore } from '../wallet';

export class RootStakeStore {
  delegationStore: DelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  unDelegationsStore: UndelegationsStore;
  validatorsStore: ValidatorsStore;
  stakeEpochStore: StakeEpochStore;

  constructor(
    delegationsStore: DelegationsStore,
    claimRewardsStore: ClaimRewardsStore,
    unDelegationsStore: UndelegationsStore,
    validatorsStore: ValidatorsStore,
    stakeEpochStore: StakeEpochStore,
  ) {
    this.delegationStore = delegationsStore;
    this.claimRewardsStore = claimRewardsStore;
    this.unDelegationsStore = unDelegationsStore;
    this.validatorsStore = validatorsStore;
    this.stakeEpochStore = stakeEpochStore;
  }

  async updateStake(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, forceRefetch = false) {
    await Promise.all([
      this.delegationStore.loadDelegations(chain, network, forceRefetch),
      this.claimRewardsStore.loadClaimRewards(chain, network, forceRefetch),
      this.unDelegationsStore.loadUndelegations(chain, network, forceRefetch),
      this.validatorsStore.loadValidators(chain, network, forceRefetch),
      this.stakeEpochStore.refetchData(),
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
  aptosCoinDataStore: AptosCoinDataStore;
  solanaCoinDataStore: SolanaCoinDataStore;
  bitcoinBalanceStore: BitcoinDataStore;
  suiCoinDataStore: SuiCoinDataStore;
  compassSeiTokensAssociationsStore: CompassSeiTokensAssociationStore;
  addressStore: AddressStore;
  selectedNetworkStore: SelectedNetworkStore;
  forcedLoading: Record<string, boolean> = {};
  currencyStore: CurrencyStore;
  zeroStateTokensStore: ZeroStateTokensStore;

  constructor(
    balanceStore: BalanceStore,
    erc20BalanceStore: ERC20DenomBalanceStore,
    cw20BalanceStore: CW20DenomBalanceStore,
    activeChainStore: ActiveChainStore,
    chainInfosStore: ChainInfosStore,
    evmBalanceStore: EvmBalanceStore,
    solanaCoinDataStore: SolanaCoinDataStore,
    aptosCoinDataStore: AptosCoinDataStore,
    bitcoinBalanceStore: BitcoinDataStore,
    suiCoinDataStore: SuiCoinDataStore,
    compassSeiTokensAssociationsStore: CompassSeiTokensAssociationStore,
    addressStore: AddressStore,
    selectedNetworkStore: SelectedNetworkStore,
    currencyStore: CurrencyStore,
    zeroStateTokensStore: ZeroStateTokensStore,
  ) {
    this.nativeBalanceStore = balanceStore;
    this.erc20BalanceStore = erc20BalanceStore;
    this.cw20BalanceStore = cw20BalanceStore;
    this.activeChainStore = activeChainStore;
    this.chainInfosStore = chainInfosStore;
    this.evmBalanceStore = evmBalanceStore;
    this.solanaCoinDataStore = solanaCoinDataStore;
    this.suiCoinDataStore = suiCoinDataStore;
    this.aptosCoinDataStore = aptosCoinDataStore;
    this.bitcoinBalanceStore = bitcoinBalanceStore;
    this.compassSeiTokensAssociationsStore = compassSeiTokensAssociationsStore;
    this.addressStore = addressStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.currencyStore = currencyStore;
    this.zeroStateTokensStore = zeroStateTokensStore;

    makeObservable(this, {
      allTokens: computed,
      allSpendableTokens: computed,
      loading: computed,
      totalFiatValue: computed,
      forcedLoading: observable.deep,
    });
  }

  public getBalanceKey(
    chain: AggregatedSupportedChainType,
    forceNetwork?: SelectedNetworkType,
    _address?: string,
  ): string {
    const chainKey = this.getChainKey(chain as SupportedChain, forceNetwork);
    const address = _address ?? this.addressStore.addresses[chain as SupportedChain];
    const userPreferredCurrency = this.currencyStore.preferredCurrency;

    return `${chainKey}-${address}-${userPreferredCurrency}`;
  }

  public getChainKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') return `aggregated-${network}`;

    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;

    return `${chain}-${chainId}`;
  }

  get allTokens() {
    const activeChain = this.activeChainStore?.activeChain;
    if (activeChain === 'aggregated') {
      const allNativeDenoms = Object.values(this.chainInfosStore?.chainInfos ?? {}).reduce(
        (acc: Record<string, NativeDenom>, chainInfo) => Object.assign(acc, chainInfo.nativeDenoms),
        {},
      );
      const nativeBalances = this.nativeBalanceStore.balances.filter(
        (token) => Object.keys(allNativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
      );
      const nonNativeBalances = this.nativeBalanceStore.balances.filter(
        (token) => !Object.keys(allNativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
      );
      return sortTokenBalances(
        nativeBalances.concat(
          nonNativeBalances.filter((token) =>
            filterDuplicateSeiToken(
              token,
              this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping,
              this.erc20BalanceStore.erc20Tokens,
            ),
          ),
          this.erc20BalanceStore.erc20Tokens,
          this.cw20BalanceStore.cw20Tokens.filter((token) =>
            filterDuplicateSeiToken(
              token,
              this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping,
              this.erc20BalanceStore.erc20Tokens,
            ),
          ),
          (this.evmBalanceStore.evmBalance ?? [])?.filter(
            (token) => !isNaN(Number(token.amount)) && new BigNumber(token.amount).gt(0),
          ),
          this.bitcoinBalanceStore.balances,
          this.aptosCoinDataStore.balances,
          this.solanaCoinDataStore.balances,
          this.suiCoinDataStore.balances,
        ),
      );
    }

    const nativeDenoms = this.chainInfosStore?.chainInfos?.[activeChain]?.nativeDenoms ?? [];
    const nativeTokens = this.nativeBalanceStore.balances.filter(
      (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
    );
    const nonNativeBankTokens = this.nativeBalanceStore.balances.filter(
      (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
    );
    const bitcoinTokens = this.bitcoinBalanceStore.balances;
    const aptosTokens = this.aptosCoinDataStore.balances;
    const solanaTokens = this.solanaCoinDataStore.balances;
    const suiTokens = this.suiCoinDataStore.balances;

    if (activeChain === 'seiTestnet2') {
      const cw20Tokens = this.cw20BalanceStore.cw20Tokens.filter((token) =>
        filterDuplicateSeiToken(
          token,
          this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping,
          this.erc20BalanceStore.erc20Tokens,
        ),
      );
      const nonNativeSeiBankTokens = nonNativeBankTokens.filter((token) =>
        filterDuplicateSeiToken(
          token,
          this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping,
          this.erc20BalanceStore.erc20Tokens,
        ),
      );
      return nativeTokens.concat(
        sortTokenBalances(cw20Tokens.concat(this.erc20BalanceStore.erc20Tokens, nonNativeSeiBankTokens)),
      );
    }

    return nativeTokens.concat(
      sortTokenBalances(
        this.erc20BalanceStore.erc20Tokens.concat(
          this.cw20BalanceStore.cw20Tokens,
          nonNativeBankTokens,
          bitcoinTokens,
          solanaTokens,
          suiTokens,
          aptosTokens,
        ),
      ),
    );
  }

  getAllTokens = computedFn(
    (
      activeChain: AggregatedSupportedChainType,
      selectedNetwork: SelectedNetworkType,
      forceAddresses: Record<string, string> | undefined,
    ) => {
      if (activeChain === 'aggregated') {
        return this.getAggregatedBalances(selectedNetwork, forceAddresses);
      }

      return this.getBalancesForChain(activeChain, selectedNetwork, forceAddresses);
    },
  );

  get allSpendableTokens() {
    const activeChain = this.activeChainStore?.activeChain;
    if (activeChain === 'aggregated') {
      const allNativeDenoms = Object.values(this.chainInfosStore?.chainInfos ?? {}).reduce(
        (acc: Record<string, NativeDenom>, chainInfo) => Object.assign(acc, chainInfo.nativeDenoms),
        {},
      );
      const nativeBalances = this.nativeBalanceStore.spendableBalances.filter(
        (token) => Object.keys(allNativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
      );
      const nonNativeBalances = this.nativeBalanceStore.spendableBalances.filter(
        (token) => !Object.keys(allNativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
      );
      return sortTokenBalances(
        nativeBalances.concat(
          nonNativeBalances.filter((token) =>
            filterDuplicateSeiToken(
              token,
              this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping,
              this.erc20BalanceStore.erc20Tokens,
            ),
          ),
          this.erc20BalanceStore.erc20Tokens,
          this.cw20BalanceStore.cw20Tokens.filter((token) =>
            filterDuplicateSeiToken(
              token,
              this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping,
              this.erc20BalanceStore.erc20Tokens,
            ),
          ),
          (this.evmBalanceStore.evmBalance ?? [])?.filter(
            (token) => !isNaN(Number(token.amount)) && new BigNumber(token.amount).gt(0),
          ),
          this.bitcoinBalanceStore.balances,
          this.aptosCoinDataStore.balances,
          this.solanaCoinDataStore.balances,
          this.suiCoinDataStore.balances,
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
    const aptosTokens = this.aptosCoinDataStore.balances;
    const solanaTokens = this.solanaCoinDataStore.balances;
    const bitcoinTokens = this.bitcoinBalanceStore.balances;

    const suiTokens = this.suiCoinDataStore.balances;
    if (activeChain === 'seiTestnet2') {
      const erc20Tokens = this.erc20BalanceStore.erc20Tokens;
      const cw20Tokens = this.cw20BalanceStore.cw20Tokens.filter((token) =>
        filterDuplicateSeiToken(
          token,
          this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping,
          this.erc20BalanceStore.erc20Tokens,
        ),
      );
      const nonNativeSeiBankTokens = nonNativeBankTokens.filter((token) =>
        filterDuplicateSeiToken(
          token,
          this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping,
          this.erc20BalanceStore.erc20Tokens,
        ),
      );
      return nativeTokens.concat(
        sortTokenBalances(cw20Tokens.concat(erc20Tokens, nonNativeSeiBankTokens, solanaTokens, suiTokens)),
      );
    }

    return nativeTokens.concat(
      sortTokenBalances(
        this.erc20BalanceStore.erc20Tokens.concat(
          this.cw20BalanceStore.cw20Tokens,
          nonNativeBankTokens,
          aptosTokens,
          solanaTokens,
          suiTokens,
          bitcoinTokens,
        ),
      ),
    );
  }

  get allSpendableTokensAggregated() {
    return sortTokenBalances(
      this.nativeBalanceStore.aggregatedSpendableBalances.concat(
        this.erc20BalanceStore.allERC20Tokens,
        this.cw20BalanceStore.allCW20Tokens,
        this.bitcoinBalanceStore.balances,
        this.aptosCoinDataStore.balances,
        this.solanaCoinDataStore.balances,
        this.suiCoinDataStore.balances,
      ),
    );
  }

  get allAggregatedTokensLoading() {
    return (
      this.nativeBalanceStore.loading ||
      this.erc20BalanceStore.aggregatedLoadingStatus ||
      this.cw20BalanceStore.aggregatedLoadingStatus ||
      this.aptosCoinDataStore.loading
    );
  }

  getAggregatedBalancesForNetwork = computedFn(
    (
      balanceType: 'balances' | 'spendableBalances',
      network: SelectedNetworkType,
      forceAddresses: Record<string, string> | undefined,
    ) => {
      const nativeDenoms = Object.values(this.chainInfosStore?.chainInfos ?? {}).reduce(
        (acc: Record<string, NativeDenom>, chainInfo) => Object.assign(acc, chainInfo.nativeDenoms),
        {},
      );
      const bankTokens =
        balanceType === 'spendableBalances'
          ? this.nativeBalanceStore.getAggregatedSpendableBalances(network, forceAddresses)
          : this.nativeBalanceStore.getAggregatedBalances(network, forceAddresses);
      const nativeTokens = bankTokens.filter(
        (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
      );
      const nonNativeBankTokens = bankTokens.filter(
        (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
      );

      const erc20Tokens = this.erc20BalanceStore.getAggregatedERC20Tokens(network, forceAddresses);
      const cw20Tokens = this.cw20BalanceStore.getAggregatedCW20Tokens(network, forceAddresses);
      const aptosTokens = this.aptosCoinDataStore.getAggregatedBalances(network, forceAddresses);
      const evmTokens = this.evmBalanceStore
        .getAggregatedEvmTokens(network, forceAddresses)
        ?.filter((token) => !isNaN(Number(token.amount)) && new BigNumber(token.amount).gt(0));
      const solanaTokens = this.solanaCoinDataStore.getAggregatedBalances(network, forceAddresses);
      const suiTokens = this.suiCoinDataStore.getAggregatedBalances(network, forceAddresses);
      const bitcoinTokens = this.bitcoinBalanceStore.getAggregatedBalances(network, forceAddresses);

      return nativeTokens.concat(
        sortTokenBalances(
          cw20Tokens.concat(
            erc20Tokens,
            nonNativeBankTokens,
            evmTokens,
            bitcoinTokens,
            aptosTokens,
            solanaTokens,
            suiTokens,
          ),
        ),
      );
    },
  );

  getTokensForChain = computedFn(
    (
      chain: SupportedChain,
      balanceType: 'balances' | 'spendableBalances',
      network: SelectedNetworkType,
      forceAddresses: Record<string, string> | undefined,
    ) => {
      if (forceAddresses && !forceAddresses[chain]) {
        return [];
      }

      const nativeDenoms = this.chainInfosStore?.chainInfos?.[chain]?.nativeDenoms ?? [];
      const bankTokens =
        balanceType === 'spendableBalances'
          ? this.nativeBalanceStore.getSpendableBalancesForChain(chain, network, forceAddresses)
          : this.nativeBalanceStore.getBalancesForChain(chain, network, forceAddresses);
      const nativeTokens = bankTokens.filter(
        (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
      );
      const nonNativeBankTokens = bankTokens.filter(
        (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
      );
      const erc20Tokens = this.erc20BalanceStore.getERC20TokensForChain(chain, network, forceAddresses?.[chain]);
      const cw20Tokens = this.cw20BalanceStore.getCW20TokensForChain(chain, network, forceAddresses?.[chain]);
      const aptosTokens = this.aptosCoinDataStore.getAptosBalances(chain, network, forceAddresses?.[chain]);
      const solanaTokens = this.solanaCoinDataStore.getSolanaBalances(chain, network, forceAddresses?.[chain]);
      const suiTokens = this.suiCoinDataStore.getSuiBalances(chain, network, forceAddresses?.[chain]);
      const bitcoinTokens = this.bitcoinBalanceStore.getBitcoinBalances(chain, network, forceAddresses?.[chain]);

      if (chain === 'seiTestnet2') {
        const seiCw20Tokens = cw20Tokens.filter((token) =>
          filterDuplicateSeiToken(token, this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping, erc20Tokens),
        );
        const nonNativeSeiBankTokens = nonNativeBankTokens.filter((token) =>
          filterDuplicateSeiToken(token, this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping, erc20Tokens),
        );
        return nativeTokens.concat(sortTokenBalances(seiCw20Tokens.concat(erc20Tokens, nonNativeSeiBankTokens)));
      }

      return nativeTokens.concat(
        sortTokenBalances(
          cw20Tokens.concat(erc20Tokens, nonNativeBankTokens, bitcoinTokens, aptosTokens, solanaTokens, suiTokens),
        ),
      );
    },
  );

  getBalancesForChain = computedFn(
    (chain: SupportedChain, network: SelectedNetworkType, forceAddresses: Record<string, string> | undefined) => {
      return this.getTokensForChain(chain, 'balances', network, forceAddresses);
    },
  );

  getSpendableBalancesForChain = computedFn(
    (chain: SupportedChain, network: SelectedNetworkType, forceAddresses: Record<string, string> | undefined) => {
      return this.getTokensForChain(chain, 'spendableBalances', network, forceAddresses);
    },
  );

  getAggregatedBalances = computedFn(
    (network: SelectedNetworkType, forceAddresses: Record<string, string> | undefined) => {
      return this.getAggregatedBalancesForNetwork('balances', network, forceAddresses);
    },
  );

  getAggregatedSpendableBalances = computedFn(
    (network: SelectedNetworkType, forceAddresses: Record<string, string> | undefined) => {
      return this.getAggregatedBalancesForNetwork('spendableBalances', network, forceAddresses);
    },
  );

  getLoadingStatusForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    return (
      this.nativeBalanceStore.getLoadingStatusForChain(chain, network) ||
      this.erc20BalanceStore.getLoadingStatusForChain(chain, network) ||
      this.cw20BalanceStore.getLoadingStatusForChain(chain, network, undefined)
    );
  };

  getErrorStatusForChain = (chain: SupportedChain, network: SelectedNetworkType): BalanceErrorStatus => {
    if (isAptosChain(chain)) {
      return this.aptosCoinDataStore.getErrorStatusForChain(chain, network) ? 'complete-failure' : 'no-error';
    }

    if (isSolanaChain(chain)) {
      return this.solanaCoinDataStore.getErrorStatusForChain(chain, network) ? 'complete-failure' : 'no-error';
    }

    if (isBitcoinChain(chain)) {
      return this.bitcoinBalanceStore.getErrorStatusForChain(chain, network) ? 'complete-failure' : 'no-error';
    }

    if (isSuiChain(chain)) {
      return this.suiCoinDataStore.getErrorStatusForChain(chain, network) ? 'complete-failure' : 'no-error';
    }

    const erc20Error = this.erc20BalanceStore.getErrorStatusForChain(chain, network);

    if (this.chainInfosStore.chainInfos[chain]?.evmOnlyChain) {
      const evmError = this.evmBalanceStore.getErrorStatusForChain(chain, network);
      if (evmError || erc20Error) {
        return evmError && erc20Error ? 'complete-failure' : 'partial-failure';
      }
      return 'no-error';
    }

    const cw20Error = this.cw20BalanceStore.getErrorStatusForChain(chain, network);
    const nativeError = this.nativeBalanceStore.getErrorStatusForChain(chain, network);

    if (nativeError || cw20Error || erc20Error) {
      return nativeError && cw20Error && erc20Error ? 'complete-failure' : 'partial-failure';
    }
    return 'no-error';
  };

  getAggregatedErrorStatus = (network: SelectedNetworkType): BalanceErrorStatus => {
    let allChainsErrored = true;
    let partialChainsErrored = false;
    Object.keys(this.chainInfosStore.chainInfos).forEach((chain) => {
      const chainErrorStatus = this.getErrorStatusForChain(chain as SupportedChain, network);
      const chainHasError = chainErrorStatus !== 'no-error';
      allChainsErrored = allChainsErrored && chainHasError;
      partialChainsErrored = partialChainsErrored || chainHasError;
    });
    return allChainsErrored ? 'complete-failure' : partialChainsErrored ? 'partial-failure' : 'no-error';
  };

  getErrorStatus = (chain: AggregatedSupportedChainType, network: SelectedNetworkType): BalanceErrorStatus => {
    if (chain === 'aggregated') {
      return this.getAggregatedErrorStatus(network);
    }
    return this.getErrorStatusForChain(chain as SupportedChain, network);
  };

  get loading() {
    const activeChain = this.activeChainStore?.activeChain;
    const chainInfo = this.chainInfosStore.chainInfos[activeChain as SupportedChain];
    const _isAptosChain = isAptosChain(activeChain);
    const _isSolanaChain = isSolanaChain(activeChain);
    const _isSuiChain = isSuiChain(activeChain);
    const bitcoinChain = isBitcoinChain(activeChain as SupportedChain);

    if (_isAptosChain) {
      return this.aptosCoinDataStore.loading;
    }
    if (_isSolanaChain) {
      return this.solanaCoinDataStore.loading;
    }
    if (_isSuiChain) {
      return this.suiCoinDataStore.loading;
    }
    if (bitcoinChain) {
      return this.bitcoinBalanceStore.loading;
    }
    if (chainInfo?.evmOnlyChain) {
      return (
        this.evmBalanceStore.loading ||
        this.erc20BalanceStore.loading ||
        (this.forcedLoading[this.getBalanceKey(activeChain)] ?? false)
      );
    }

    if (activeChain === 'aggregated' && this.nativeBalanceStore.aggregateBalanceVisible) {
      return false;
    }

    return (
      this.nativeBalanceStore.loadingStatus ||
      this.erc20BalanceStore.loading ||
      this.cw20BalanceStore.loading ||
      (this.forcedLoading[this.getBalanceKey(activeChain)] ?? false)
    );
  }

  get totalFiatValue() {
    let totalFiatValue = new BigNumber(0);
    const balances = this.allTokens;
    let hasAnyBalance = false;

    for (const asset of balances) {
      if (asset.usdValue) {
        totalFiatValue = totalFiatValue.plus(new BigNumber(asset.usdValue));
      }
      if (asset.amount && !new BigNumber(asset.amount).isNaN() && new BigNumber(asset.amount).gt(0)) {
        hasAnyBalance = true;
      }
    }

    if (totalFiatValue.gt(0)) {
      return totalFiatValue;
    }

    if (hasAnyBalance) {
      return new BigNumber(NaN);
    }

    const zeroStateTokens = this.zeroStateTokensStore.zeroStateTokens;
    let hasAnyUsdPrice = false;
    for (const token of [...zeroStateTokens, ...balances]) {
      if (token.usdPrice) {
        hasAnyUsdPrice = true;
      }
    }

    return new BigNumber(hasAnyUsdPrice ? 0 : NaN);
  }

  getTotalFiatValue = computedFn(
    (chain: AggregatedSupportedChainType, network: SelectedNetworkType, forceAddresses: Record<string, string>) => {
      let totalFiatValue = new BigNumber(0);
      const balances = this.getAllTokens(chain, network, forceAddresses);
      let hasAnyBalance = false;

      for (const asset of balances) {
        if (asset.usdValue) {
          totalFiatValue = totalFiatValue.plus(new BigNumber(asset.usdValue));
        }
        if (asset.amount && !new BigNumber(asset.amount).isNaN() && new BigNumber(asset.amount).gt(0)) {
          hasAnyBalance = true;
        }
      }

      if (totalFiatValue.gt(0)) {
        return totalFiatValue;
      }

      if (hasAnyBalance) {
        return new BigNumber(NaN);
      }

      return totalFiatValue;
    },
  );

  async loadBalances(
    chain?: AggregatedSupportedChainType,
    network?: SelectedNetworkType,
    forceAddresses?: Record<string, string>,
  ) {
    await Promise.allSettled([
      this.nativeBalanceStore.loadBalances(chain, network, forceAddresses),
      this.erc20BalanceStore.loadBalances(chain, network, undefined, forceAddresses),
      this.cw20BalanceStore.loadBalances(chain, network, undefined, forceAddresses),
      this.evmBalanceStore.loadEvmBalance(chain, network, undefined, undefined, forceAddresses),
      this.bitcoinBalanceStore.getData(chain, network, undefined, forceAddresses),
      this.aptosCoinDataStore.getData(chain, network, undefined, forceAddresses),
      this.solanaCoinDataStore.getData(chain, network, undefined, forceAddresses),
      this.suiCoinDataStore.getData(chain, network, undefined, forceAddresses),
    ]);
  }

  async refetchBalances(
    chain?: AggregatedSupportedChainType,
    network?: SelectedNetworkType,
    forceAddresses?: Record<string, string>,
  ) {
    await Promise.allSettled([
      this.nativeBalanceStore.loadBalances(chain, network, forceAddresses, true),
      this.erc20BalanceStore.loadBalances(chain, network, true, forceAddresses),
      this.cw20BalanceStore.loadBalances(chain, network, true, forceAddresses),
      this.evmBalanceStore.loadEvmBalance(chain, network, true, undefined, forceAddresses),
      this.bitcoinBalanceStore.getData(chain, network, true, forceAddresses),
      this.aptosCoinDataStore.getData(chain, network, true, forceAddresses),
      this.solanaCoinDataStore.getData(chain, network, true, forceAddresses),
      this.suiCoinDataStore.getData(chain, network, true, forceAddresses),
    ]);
  }

  clearCachedBalances(forceAddresses: Record<string, string>) {
    try {
      this.nativeBalanceStore.clearCachedBalances(forceAddresses);
      this.erc20BalanceStore.clearCachedBalances(forceAddresses);
      this.cw20BalanceStore.clearCachedBalances(forceAddresses);
      this.evmBalanceStore.clearCachedBalances(forceAddresses);
      this.bitcoinBalanceStore.clearCachedBalances(forceAddresses);
      this.aptosCoinDataStore.clearCachedBalances(forceAddresses);
      this.solanaCoinDataStore.clearCachedBalances(forceAddresses);
      this.suiCoinDataStore.clearCachedBalances(forceAddresses);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  async updateCurrency(prevCurrency: SupportedCurrencies) {
    const currency = currencyDetail[prevCurrency].currencyPointer;
    await Promise.allSettled([
      this.nativeBalanceStore.updateCurrency(currency),
      this.erc20BalanceStore.updateCurrency(currency),
      this.cw20BalanceStore.updateCurrency(currency),
      this.evmBalanceStore.updateCurrency(currency),
      this.bitcoinBalanceStore.updateCurrency(currency),
      this.aptosCoinDataStore.updateCurrency(currency),
      this.solanaCoinDataStore.updateCurrency(currency),
      this.suiCoinDataStore.updateCurrency(currency),
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
  percentageChangeDataStore: PercentageChangeDataStore;
  currencyStore: CurrencyStore;
  chainInfosStore: ChainInfosStore;
  evmBalanceStore: EvmBalanceStore;
  initializing: 'pending' | 'inprogress' | 'done' = 'pending';
  initPromise: Promise<[void, void]> | undefined = undefined;
  skipLoadingStake: boolean = false;

  constructor(
    nmsStore: NmsStore,
    addressStore: AddressStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    rootBalanceStore: RootBalanceStore,
    rootStakeStore: RootStakeStore,
    priceStore: PriceStore,
    percentageChangeDataStore: PercentageChangeDataStore,
    currencyStore: CurrencyStore,
    chainInfosStore: ChainInfosStore,
    evmBalanceStore: EvmBalanceStore,
    skipLoadingStake?: boolean,
  ) {
    this.nmsStore = nmsStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.rootStakeStore = rootStakeStore;
    this.rootBalanceStore = rootBalanceStore;
    this.priceStore = priceStore;
    this.percentageChangeDataStore = percentageChangeDataStore;
    this.currencyStore = currencyStore;
    this.chainInfosStore = chainInfosStore;
    this.evmBalanceStore = evmBalanceStore;
    this.skipLoadingStake = skipLoadingStake ?? false;

    makeObservable(this, {
      initializing: observable,
    });
  }

  async initStores(loadBalances?: boolean, loadStake?: boolean) {
    if (this.initializing !== 'pending') return;
    runInAction(() => {
      this.initializing = 'inprogress';
    });
    await Promise.allSettled([
      this.nmsStore.readyPromise,
      this.priceStore.readyPromise,
      this.addressStore.loadAddresses(),
      this.percentageChangeDataStore.readyPromise,
      // this.marketDataStore.readyPromise,
    ]);

    this.initPromise = Promise.all([
      loadBalances ? this.rootBalanceStore.loadBalances() : Promise.resolve(),
      this.skipLoadingStake || !loadStake ? Promise.resolve() : this.rootStakeStore.updateStake(),
    ]);
    await this.initPromise;
    runInAction(() => {
      this.initializing = 'done';
    });
  }

  async reloadAddresses(chain?: AggregatedSupportedChainType) {
    await this.addressStore.loadAddresses();
    if (this.initializing !== 'done') {
      this.initPromise && (await this.initPromise);
    }
    if (this.addressStore.addresses) {
      await Promise.all([
        this.rootBalanceStore.loadBalances(chain),
        this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(),
      ]);
    }
  }

  async setActiveChain(chain: AggregatedSupportedChainType) {
    if (this.activeChainStore.activeChain === chain) return;
    this.activeChainStore.setActiveChain(chain);

    if (this.initializing !== 'done') {
      const key = this.rootBalanceStore.getBalanceKey(chain);
      runInAction(() => {
        this.rootBalanceStore.forcedLoading[key] = true;
      });
      this.initPromise && (await this.initPromise);
      runInAction(() => {
        this.rootBalanceStore.forcedLoading[key] = false;
      });
    }
    await Promise.all([
      this.rootBalanceStore.loadBalances(chain, this.selectedNetworkStore.selectedNetwork),
      this.skipLoadingStake
        ? Promise.resolve()
        : this.rootStakeStore.updateStake(chain, this.selectedNetworkStore.selectedNetwork),
    ]);
  }

  async setSelectedNetwork(network: SelectedNetworkType) {
    if (this.selectedNetworkStore.selectedNetwork === network) return;
    this.selectedNetworkStore.setSelectedNetwork(network);
    if (this.initializing !== 'done') return;
    await Promise.all([
      this.rootBalanceStore.loadBalances(this.activeChainStore.activeChain, this.selectedNetworkStore.selectedNetwork),
      this.skipLoadingStake
        ? Promise.resolve()
        : this.rootStakeStore.updateStake(this.activeChainStore.activeChain, network),
    ]);
  }

  async setPreferredCurrency(prevCurrency: SupportedCurrencies, currency: SupportedCurrencies) {
    if (prevCurrency === currency) return;
    this.currencyStore.updatePreferredCurrency(currency);
    if (this.initializing !== 'done') return;
    await this.priceStore.getData();
    await this.percentageChangeDataStore.getData();
    await Promise.all([
      this.rootBalanceStore.updateCurrency(prevCurrency),
      this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(undefined, undefined, true),
    ]);
  }

  async setChains(chainInfos: Record<SupportedChain, ChainInfo>) {
    this.chainInfosStore.setChainInfos(chainInfos);
    if (this.initializing !== 'done') return;
    await Promise.all([
      this.rootBalanceStore.loadBalances(),
      this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(),
    ]);
  }
}
