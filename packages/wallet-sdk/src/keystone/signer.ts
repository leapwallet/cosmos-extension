import { AccountData, AminoSignResponse, OfflineAminoSigner, StdSignDoc } from '@cosmjs/amino';
import { DirectSignResponse, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { LeapKeystoneTransactionEncoder } from './transaction';

export type LeapKeystoneSignerInteractor = {
  showTransaction: (data: LeapKeystoneTransactionEncoder) => Promise<void>;
  submitSignature: () => Promise<string>;
};

export abstract class LeapKeystoneSigner implements OfflineAminoSigner, OfflineDirectSigner {
  protected _interactor: LeapKeystoneSignerInteractor | undefined;

  constructor(interactor?: LeapKeystoneSignerInteractor) {
    this._interactor = interactor;
  }
  setInteractor(interactor: LeapKeystoneSignerInteractor) {
    this._interactor = interactor;
  }
  getInteractor() {
    return this._interactor;
  }
  abstract getAccounts: () => Promise<readonly AccountData[]>;
  abstract signAmino: (signerAddress: string, signDoc: StdSignDoc) => Promise<AminoSignResponse>;
  abstract signDirect: (signerAddress: string, signDoc: SignDoc) => Promise<DirectSignResponse>;
}

export type EthereumSignature = {
  v: number;
  r: string;
  s: string;
};

export abstract class LeapKeystoneSignerEth extends LeapKeystoneSigner {
  abstract getAccounts: () => Promise<readonly AccountData[]>;
  abstract signPersonalMessage: (signerAddress: string, message: string) => Promise<EthereumSignature>;
  abstract signEip712: (signerAddress: string, message: any) => Promise<EthereumSignature>;
  abstract signTransaction: (signerAddress: string, transaction: string) => Promise<EthereumSignature>;
}
