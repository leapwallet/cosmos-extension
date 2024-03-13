import { ExecuteResult } from '@cosmjs/cosmwasm-stargate';
import { DeliverTxResponse } from '@cosmjs/stargate';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import create from 'zustand';

import { ActivityType } from '../types';

export type TxStatus = 'loading' | 'success' | 'failed';

export type PendingTx = {
  txType: ActivityType;
  title1: string;
  subtitle1: string;
  title2?: string;
  subtitle2?: string;
  img?: string;
  secondaryImg?: string;
  sentAmount?: string;
  sentTokenInfo?: NativeDenom;
  receivedTokenInfo?: NativeDenom;
  receivedAmount?: string;
  sentUsdValue?: string | number;
  receivedUsdValue?: string;
  feeAmount?: string;
  txStatus: TxStatus;
  promise: Promise<DeliverTxResponse | ExecuteResult>;
  feeDenomination?: string;
  feeQuantity?: string;
  toAddress?: string;
  txHash?: string;
  voteOption?: VoteOption;
  proposalId?: number;
  txnLogAmount?: number;
};

export type PendingTxState = {
  pendingTx: PendingTx | null;
  setPendingTx: (pendingTx: PendingTx | null) => void;
};

export const usePendingTxState = create<PendingTxState>((set) => ({
  pendingTx: null,
  setPendingTx: (pendingTx: PendingTx | null) => set(() => ({ pendingTx })),
}));
