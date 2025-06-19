import {
  axiosWrapper,
  Delegation,
  Reward,
  RewardsResponse,
  UnbondingDelegation,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { makeAutoObservable } from 'mobx';

import { getBaseURL } from '../globals/config';

export type UndelegationsAPIRequest = {
  chains: {
    [chainId: string]: {
      address: string;
      denom: string;
    };
  };
  forceRefetch?: boolean;
};

type UndelegationsAPIResponse = {
  chains: {
    [chainId: string]: {
      [validatorAddress: string]: UnbondingDelegation | number;
    };
  };
  errors?: {
    chainId: string;
    error: string;
  }[];
};

type DelegationInfo = {
  delegations: Record<string, Delegation>;
  totalDelegationAmount: string;
  totalDelegation: string;
};

export type DelegationsAPIRequest = {
  chains: {
    [chainId: string]: {
      address: string;
      denom: string;
    };
  };
  forceRefetch?: boolean;
};

type DelegationsAPIResponse = {
  chains: {
    [chainId: string]: DelegationInfo;
  };
  errors?: {
    chainId: string;
    error: string;
  }[];
};

export type ClaimRewardAPIRequest = {
  chains: {
    [chainId: string]: {
      address: string;
    };
  };
  forceRefetch?: boolean;
};

export type ClaimRewardAPIResponse = {
  chains: {
    [chainId: string]: {
      rewards: Record<string, Reward>;
      result: RewardsResponse;
      totalRewards: string;
      formattedTotalRewards: string;
      processingTime: number;
    };
  };
  errors?: {
    chainId: string;
    error: string;
  }[];
};

export type ValidatorsAPIResponse = {
  data: Validator[];
  error?: {
    chainId: string;
    error: string;
  };
};

export class StakingApiStore {
  apiUrl: string;

  constructor() {
    makeAutoObservable(this);
    const baseUrl = getBaseURL() ?? 'https://api.leapwallet.io';
    this.apiUrl = `${baseUrl}/v1/staking`;
  }

  async getDelegations(request: DelegationsAPIRequest): Promise<DelegationsAPIResponse> {
    try {
      const { data } = await axiosWrapper<DelegationsAPIResponse>({
        baseURL: this.apiUrl,
        url: '/delegations',
        method: 'POST',
        data: request,
      });

      return data;
    } catch (error) {
      return {
        chains: {},
        errors: Object.keys(request.chains).map((chainId) => {
          return {
            chainId,
            error: 'No delegations found for chain: ' + chainId,
          };
        }),
      };
    }
  }

  async getUndelegations(request: UndelegationsAPIRequest): Promise<UndelegationsAPIResponse> {
    try {
      const { data } = await axiosWrapper<UndelegationsAPIResponse>({
        baseURL: this.apiUrl,
        url: '/undelegations',
        method: 'POST',
        data: request,
      });

      return data;
    } catch (error) {
      return {
        chains: {},
        errors: Object.keys(request.chains).map((chainId) => {
          return {
            chainId,
            error: 'No undelegations found for chain: ' + chainId,
          };
        }),
      };
    }
  }

  async getValidators(chainId: string, denom: string): Promise<ValidatorsAPIResponse> {
    try {
      const { data } = await axios.get<ValidatorsAPIResponse>(
        `${this.apiUrl}/validators?chainId=${chainId}&denom=${denom}`,
      );
      return data;
    } catch (error) {
      return {
        data: [],
        error: {
          chainId,
          error: 'No validators found for chain: ' + chainId,
        },
      };
    }
  }

  async getRewards(request: ClaimRewardAPIRequest): Promise<ClaimRewardAPIResponse> {
    try {
      const { data } = await axiosWrapper<ClaimRewardAPIResponse>({
        baseURL: this.apiUrl,
        url: '/claim-rewards',
        method: 'POST',
        data: request,
      });

      return data;
    } catch (error) {
      return {
        chains: {},
        errors: Object.keys(request.chains).map((chainId) => {
          return {
            chainId,
            error: 'No rewards found for chain: ' + chainId,
          };
        }),
      };
    }
  }
}
