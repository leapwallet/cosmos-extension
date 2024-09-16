import { RootBalanceStore, RootStakeStore, RootStore } from '@leapwallet/cosmos-wallet-store'

import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'
import {
  balanceStore,
  currencyStore,
  cw20TokenBalanceStore,
  erc20TokenBalanceStore,
  evmBalanceStore,
  nmsStore,
  priceStore,
} from './balance-store'
import { chainInfoStore } from './chain-infos-store'
import { selectedNetworkStore } from './selected-network-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from './stake-store'

export const rootStakeStore = new RootStakeStore(
  delegationsStore,
  claimRewardsStore,
  unDelegationsStore,
  validatorsStore,
)

export const rootBalanceStore = new RootBalanceStore(
  balanceStore,
  erc20TokenBalanceStore,
  cw20TokenBalanceStore,
  activeChainStore,
  chainInfoStore,
  evmBalanceStore,
)

export const rootStore = new RootStore(
  nmsStore,
  addressStore,
  activeChainStore,
  selectedNetworkStore,
  rootBalanceStore,
  rootStakeStore,
  priceStore,
  currencyStore,
  chainInfoStore,
  evmBalanceStore,
)
