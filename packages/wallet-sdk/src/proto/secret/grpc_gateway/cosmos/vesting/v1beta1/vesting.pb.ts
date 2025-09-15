/* eslint-disable */
/*
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as CosmosAuthV1beta1Auth from '../../auth/v1beta1/auth.pb';
import { Coin } from '../../../../../types';

export type BaseVestingAccount = {
  base_account?: CosmosAuthV1beta1Auth.BaseAccount;
  original_vesting?: Coin[];
  delegated_free?: Coin[];
  delegated_vesting?: Coin[];
  end_time?: string;
};

export type ContinuousVestingAccount = {
  base_vesting_account?: BaseVestingAccount;
  start_time?: string;
};

export type DelayedVestingAccount = {
  base_vesting_account?: BaseVestingAccount;
};

export type Period = {
  length?: string;
  amount?: Coin[];
};

export type PeriodicVestingAccount = {
  base_vesting_account?: BaseVestingAccount;
  start_time?: string;
  vesting_periods?: Period[];
};

export type PermanentLockedAccount = {
  base_vesting_account?: BaseVestingAccount;
};
