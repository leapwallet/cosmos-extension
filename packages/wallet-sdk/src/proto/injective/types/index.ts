import { CosmosTxV1Beta1Tx } from '../core-proto-ts';

export interface Coin {
  denom: string;
  amount: string;
}

export type TxRaw = CosmosTxV1Beta1Tx.TxRaw;
