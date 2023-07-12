import { ExecuteResult } from '@cosmjs/cosmwasm-stargate';
import { DeliverTxResponse } from '@cosmjs/stargate';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { ActivityType } from '../types';

type TxStatus = 'loading' | 'success' | 'failed';

type PendingTx = {
  txType: ActivityType;
  title1: string;
  subtitle1: string;
  title2?: string;
  subtitle2?: string;
  img?: string;
  secondaryImg?: string;
  sentAmount?: string;
  sentTokenInfo?: NativeDenom;
  receivedAmount?: string;
  sentUsdValue?: string;
  receivedUsdValue?: string;
  feeAmount?: string;
  txStatus: TxStatus;
  promise: Promise<DeliverTxResponse | ExecuteResult>;
  feeDenomination?: string;
  feeQuantity?: string;
};

export type PendingTxState = {
  pendingTx: PendingTx | null;
  setPendingTx: (pendingTx: PendingTx | null) => void;
};

export const usePendingTxState = create<PendingTxState>((set) => ({
  pendingTx: null,
  setPendingTx: (pendingTx: PendingTx | null) => set(() => ({ pendingTx })),
}));
