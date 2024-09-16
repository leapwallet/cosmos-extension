export * from './abis';

export type EvmFeeType = 'low' | 'medium' | 'high';

export const EVM_FEE_SETTINGS = {
  low: {
    gasMultiplier: 1, // base fee percentage multiplier
    percentile: 10,
  },
  medium: {
    gasMultiplier: 1.125,
    percentile: 40,
  },
  high: {
    gasMultiplier: 1.25,
    percentile: 70,
  },
};

export const EVM_FEE_HISTORY_REWARD_PERCENTILES = [
  EVM_FEE_SETTINGS.low.percentile,
  EVM_FEE_SETTINGS.medium.percentile,
  EVM_FEE_SETTINGS.high.percentile,
];
export const EVM_FEE_HISTORY_NEWEST_BLOCK = 'latest';
export const EVM_FEE_HISTORY_BLOCK_COUNT = 3;
