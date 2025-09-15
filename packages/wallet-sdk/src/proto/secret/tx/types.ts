import { Coin } from '..';

export interface MsgParams {}

/** Input models transaction input for MsgMultiSend. */
export type Input = {
  address: string;
  coins: Coin[];
};

/** Output models transaction outputs for MsgMultiSend. */
export type Output = {
  address: string;
  coins: Coin[];
};
