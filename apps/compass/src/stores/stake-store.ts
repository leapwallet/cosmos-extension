import {
  ActiveStakingDenomStore,
  AggregateStakeStore,
  ChainsAprStore,
  ClaimRewardsStore,
  DelegationsStore,
  IbcDenomInfoStore,
  PriorityValidatorsStore,
  StakingDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'

import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'
import { aggregatedChainsStore, nmsStore, priceStore } from './balance-store'
import { chainInfosConfigStore, chainInfoStore } from './chain-infos-store'
import { denomsStore } from './denoms-store-instance'
import { selectedNetworkStore } from './selected-network-store'

const priorityValidatorsStore = new PriorityValidatorsStore()
const stakingDenomsStore = new StakingDenomsStore()

const activeStakingDenomStore = new ActiveStakingDenomStore(
  activeChainStore,
  selectedNetworkStore,
  stakingDenomsStore,
  chainInfoStore,
  denomsStore,
)

const chainsAprStore = new ChainsAprStore()

export const validatorsStore = new ValidatorsStore(
  chainInfoStore,
  addressStore,
  activeChainStore,
  selectedNetworkStore,
  chainInfosConfigStore,
  denomsStore,
  nmsStore,
  priorityValidatorsStore,
  aggregatedChainsStore,
  chainsAprStore,
)

export const delegationsStore = new DelegationsStore(
  chainInfoStore,
  addressStore,
  activeChainStore,
  selectedNetworkStore,
  chainInfosConfigStore,
  nmsStore,
  aggregatedChainsStore,
  activeStakingDenomStore,
  priceStore,
)

export const unDelegationsStore = new UndelegationsStore(
  chainInfoStore,
  addressStore,
  activeChainStore,
  selectedNetworkStore,
  chainInfosConfigStore,
  denomsStore,
  nmsStore,
  aggregatedChainsStore,
  activeStakingDenomStore,
  priceStore,
)

const ibcDenomInfoStore = new IbcDenomInfoStore(nmsStore, chainInfoStore, denomsStore)

export const claimRewardsStore = new ClaimRewardsStore(
  chainInfoStore,
  addressStore,
  activeChainStore,
  selectedNetworkStore,
  chainInfosConfigStore,
  nmsStore,
  aggregatedChainsStore,
  activeStakingDenomStore,
  priceStore,
  ibcDenomInfoStore,
)

export const aggregateStakeStore = new AggregateStakeStore(
  chainInfoStore,
  addressStore,
  selectedNetworkStore,
  aggregatedChainsStore,
  activeStakingDenomStore,
  delegationsStore,
  validatorsStore,
  claimRewardsStore,
  chainInfosConfigStore,
)
