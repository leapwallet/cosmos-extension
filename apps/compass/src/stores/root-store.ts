import { RootBalanceStore, RootStakeStore, RootStore } from '@leapwallet/cosmos-wallet-store'

import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'
import {
  aptosCoinDataStore,
  balanceStore,
  bitcoinBalanceStore,
  currencyStore,
  cw20TokenBalanceStore,
  erc20TokenBalanceStore,
  evmBalanceStore,
  nmsStore,
  percentageChangeDataStore,
  priceStore,
  solanaCoinDataStore,
  suiBalanceStore,
} from './balance-store'
import { chainInfoStore, compassTokensAssociationsStore } from './chain-infos-store'
import { stakeEpochStore } from './epoch-store'
import { selectedNetworkStore } from './selected-network-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from './stake-store'
import { zeroStateTokensStore } from './zero-state-tokens-store'

export const rootStakeStore = new RootStakeStore(
  delegationsStore,
  claimRewardsStore,
  unDelegationsStore,
  validatorsStore,
  stakeEpochStore,
)

export const rootBalanceStore = new RootBalanceStore(
  balanceStore,
  erc20TokenBalanceStore,
  cw20TokenBalanceStore,
  activeChainStore,
  chainInfoStore,
  evmBalanceStore,
  solanaCoinDataStore,
  aptosCoinDataStore,
  bitcoinBalanceStore,
  suiBalanceStore,
  compassTokensAssociationsStore,
  addressStore,
  selectedNetworkStore,
  currencyStore,
  zeroStateTokensStore,
)

export const rootStore = new RootStore(
  nmsStore,
  addressStore,
  activeChainStore,
  selectedNetworkStore,
  rootBalanceStore,
  rootStakeStore,
  priceStore,
  percentageChangeDataStore,
  currencyStore,
  chainInfoStore,
  evmBalanceStore,
)
