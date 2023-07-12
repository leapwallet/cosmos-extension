import { AccountData, AminoSignResponse, OfflineAminoSigner, StdSignDoc } from '@cosmjs/amino';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { DirectSignResponse } from '@cosmjs/proto-signing/build/signer';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { Leap, LeapSignOptions } from './types';

export class CosmJSOfflineSignerOnlyAmino implements OfflineAminoSigner {
  constructor(
    protected readonly chainId: string,
    protected readonly leap: Leap,
    protected signOptions?: LeapSignOptions,
  ) {}

  async getAccounts(): Promise<AccountData[]> {
    const key = await this.leap.getKey(this.chainId);
    return [
      {
        address: key.bech32Address,

        // Currently, only secp256k1 is supported.
        algo: 'secp256k1',
        pubkey: key.pubKey,
      },
    ];
  }

  async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    if (this.chainId !== signDoc.chain_id) {
      throw new Error('Unmatched chain id with the offline signer');
    }

    const key = await this.leap.getKey(signDoc.chain_id);

    if (key.bech32Address !== signerAddress) {
      throw new Error('Unknown signer address');
    }
    return this.leap.signAmino(this.chainId, signerAddress, signDoc, this.signOptions);
  }

  // Fallback function for the legacy cosmjs implementation before the staragte.
  async sign(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    return this.signAmino(signerAddress, signDoc);
  }
}

export class CosmJSOfflineSigner
  extends CosmJSOfflineSignerOnlyAmino
  implements OfflineAminoSigner, OfflineDirectSigner
{
  constructor(
    protected readonly chainId: string,
    protected readonly leap: Leap,
    protected signOptions?: LeapSignOptions,
  ) {
    super(chainId, leap, signOptions);
  }

  async signDirect(signerAddress: string, signDoc: SignDoc): Promise<DirectSignResponse> {
    if (this.chainId !== signDoc.chainId) {
      throw new Error('Unmatched chain id with the offline signer');
    }

    const key = await this.leap.getKey(signDoc.chainId);

    if (key.bech32Address !== signerAddress) {
      throw new Error('Unknown signer address');
    }

    return this.leap.signDirect(this.chainId, signerAddress, signDoc, this.signOptions);
  }
}
