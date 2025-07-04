import { StdFee } from '@cosmjs/amino';
import { EncodeObject } from '@cosmjs/proto-signing';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { Tx } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

export abstract class LuminaTxClient extends Tx {
  abstract signAndBroadcastTx(
    signerAddress: string,
    msgs: EncodeObject[],
    _: StdFee | 'auto' | number,
    memo?: string,
  ): Promise<string>;
  abstract setWallet(wallet: OfflineSigner): void;
}

type LuminaTxClientStore = {
  luminaTxClient: LuminaTxClient | null;
  forceLuminaTxClient: boolean;
  setLuminaTxClient: (customTxHandler: any) => void;
  setForceLuminaTxClient: (forceLuminaTxClient: boolean) => void;
};

export const useLuminaTxClientStore = create<LuminaTxClientStore>((set) => ({
  luminaTxClient: null,
  forceLuminaTxClient: false,
  setLuminaTxClient: (luminaTxClient: LuminaTxClient) =>
    set(() => {
      return { luminaTxClient };
    }),
  setForceLuminaTxClient: (forceLuminaTxClient: boolean) =>
    set(() => {
      return { forceLuminaTxClient };
    }),
}));
