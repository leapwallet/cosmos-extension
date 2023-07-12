import { Coin } from '@cosmjs/stargate';

export type CreateExecuteMessageArgs = {
  senderAddress: string;
  message: Record<string, Record<string, string>>;
  contractAddress: string;
  funds?: Array<Coin>;
};

export type CreateIncreaseAllowanceMessageArgs = {
  senderAddress: string;
  tokenAmount: number;
  tokenAddress: string;
  swapAddress: string;
};
