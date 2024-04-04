import { StakingDenoms, stakingDenoms as _stakingDenoms } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type StakingDenomsState = {
  stakingDenoms: StakingDenoms | null;
  setStakingDenoms: (stakingDenoms: StakingDenoms | null) => void;
};

export const useStakingDenomsStore = create<StakingDenomsState>((set) => ({
  stakingDenoms: _stakingDenoms,
  setStakingDenoms: (stakingDenoms) =>
    set(() => {
      return { stakingDenoms };
    }),
}));

export const useStakingDenoms = (): StakingDenoms | Record<'mainnet' | 'testnet', Record<string, never>> => {
  return useStakingDenomsStore((state) => state.stakingDenoms) ?? { mainnet: {}, testnet: {} };
};
