import {
  Delegation,
  NativeDenom,
  NetworkChainData,
  Reward,
  RewardsResponse,
  SupportedChain,
  UnbondingDelegation,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';

import { LoadingStatusType, SelectedNetworkType } from './index';

export type ChainsAprData = { [key: string]: number };

// ----------------- validators-store

export type ValidatorData = {
  chainData: NetworkChainData;
  validators: Validator[];
};

export type PriorityValidatorsType = { [key: string]: { priority: number; validatorAddress: string }[] };

export type ChainValidators = {
  validatorData: Record<string, never> | ValidatorData;
  validatorDataStatus: LoadingStatusType;
  refetchNetwork: () => Promise<void>;
};

// ----------------- delegations-store

export type DelegationInfo = {
  totalDelegationAmount: string;
  currencyAmountDelegation: string;
  delegations: Record<string, Delegation>;
  totalDelegation: BigNumber;
};

export type GetDelegationsForChainParams = {
  lcdUrl: string;
  address: string;
  activeStakingDenom: NativeDenom;
  chainId: string;
  activeChain: SupportedChain;
};

export type GetDelegationsForChainReturn = {
  delegations: Record<string, Delegation>;
  totalDelegationAmount: string;
  currencyAmountDelegation: string;
  totalDelegation: BigNumber;
};

export type ChainDelegations = {
  delegationInfo: DelegationInfo | Record<string, never>;
  loadingDelegations: boolean;
  refetchDelegations: () => Promise<void>;
};

// ----------------- undelegations-store

export type Undelegations = Record<string, UnbondingDelegation>;

export type ChainUndelegations = {
  unboundingDelegationsInfo: Undelegations;
  loadingUnboundingDegStatus: LoadingStatusType;
  refetchUnboundingDelegations: () => Promise<void>;
};

// ----------------- claim-rewards-store

export type ClaimRewards = {
  rewards: Record<string, Reward>;
  result: RewardsResponse;
  totalRewards: string;
  formattedTotalRewards: string;
  totalRewardsDollarAmt: string;
};

export type GetRewardsForChainParams = {
  lcdUrl: string;
  address: string;
  chainId: string;
  chainKey: string;
  activeChain: SupportedChain;
  selectedNetwork: SelectedNetworkType;
};

export type ChainClaimRewards = {
  loadingRewardsStatus: LoadingStatusType;
  isFetchingRewards: boolean;
  rewards: Record<string, never> | ClaimRewards;
  refetchDelegatorRewards: () => Promise<void>;
};
