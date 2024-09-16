import { StakingDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';

const STAKING_DENOMS_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/staking-denoms.json';

export class StakingDenomsStore {
  stakingDenoms: StakingDenoms | null = null;
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = this.loadStakingDenoms();
  }

  // Add caching for staking denoms
  async loadStakingDenoms() {
    const response = await fetch(STAKING_DENOMS_S3_URL);
    const data = await response.json();

    runInAction(() => {
      this.stakingDenoms = data;
    });
  }
}
