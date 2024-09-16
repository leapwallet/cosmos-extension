import { AminoSignResponse, encodeSecp256k1Signature, serializeSignDoc, StdSignature, StdSignDoc } from '@cosmjs/amino';
import { fromHex, toBase64 } from '@cosmjs/encoding';
import { AccountData, DirectSignResponse, makeSignBytes, OfflineDirectSigner } from '@cosmjs/proto-signing';
import * as bytes from '@ethersproject/bytes';
import { Wallet as EthWallet } from '@ethersproject/wallet';
import { PrivateKey } from '@injectivelabs/sdk-ts';
import { bech32 } from 'bech32';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { keccak256 } from 'ethereumjs-util';
import { Address as EthereumUtilsAddress } from 'ethereumjs-util/dist/address';

interface AccountDataWithPrivKey extends AccountData {
  readonly privkey: Uint8Array;

  readonly ethWallet: EthWallet;
}

export function encodeEthSecp256k1Signature(
  pubkey: Uint8Array,
  signature: Uint8Array,
  keyType: 'injective' | 'ethermint',
): StdSignature {
  if (signature.length !== 64) {
    throw new Error(
      'Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s.',
    );
  }

  const type = {
    injective: '/injective.crypto.v1beta1.ethsecp256k1.PubKey',
    ethermint: '/ethermint.crypto.v1beta1.ethsecp256k1.PubKey',
  }[keyType];

  return {
    pub_key: {
      type,
      value: toBase64(pubkey),
    },
    signature: toBase64(signature),
  };
}

export class DirectEthSecp256k1HdWallet implements OfflineDirectSigner {
  private readonly accounts: Array<{
    hdPath: string;
    prefix: string;
  }>;

  constructor(
    private mnemonic: string,
    private pvtKey: string,
    private type: 'mnemonic' | 'pvtKey',
    private options: { hdPaths: string[]; prefix: string },
  ) {
    this.options = options;

    this.accounts = options.hdPaths.map((hdPath) => ({ hdPath, prefix: options.prefix }));
  }

  async signEvmos(signerAddress: string, signBytes: string) {
    const accounts = await this.getAccWithPrivKeys();
    const account = accounts.find(({ address }) => address === signerAddress);
    if (account === undefined) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }
    const { ethWallet } = account;
    const signature = await ethWallet._signingKey().signDigest(signBytes);
    const splitSignature = bytes.splitSignature(signature);
    return bytes.arrayify(bytes.concat([splitSignature.r, splitSignature.s]));
  }

  async sign(signerAddress: string, signBytes: Uint8Array) {
    const accounts = await this.getAccWithPrivKeys();
    const account = accounts.find(({ address }) => address === signerAddress);
    if (account === undefined) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }
    const { ethWallet } = account;

    const signingKey = PrivateKey.fromPrivateKey(ethWallet.privateKey);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await signingKey.sign(signBytes);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async signDirect(signerAddress: string, signDoc: SignDoc): Promise<DirectSignResponse> {
    const accounts = await this.getAccWithPrivKeys();
    const account = accounts.find(({ address }) => address === signerAddress);
    if (account === undefined) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }
    const { pubkey, ethWallet } = account;
    const message = makeSignBytes(signDoc);

    const signature = await ethWallet._signingKey().signDigest(keccak256(Buffer.from(message)));
    const splitSignature = bytes.splitSignature(signature);
    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(pubkey, bytes.arrayify(bytes.concat([splitSignature.r, splitSignature.s]))),
    };
  }

  async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    const accounts = await this.getAccWithPrivKeys();
    const account = accounts.find(({ address }) => address === signerAddress);
    if (account === undefined) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }
    const { pubkey, ethWallet } = account;
    const signBytes = serializeSignDoc(signDoc);

    const signature = await ethWallet._signingKey().signDigest(keccak256(Buffer.from(signBytes)));
    const splitSignature = bytes.splitSignature(signature);
    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(pubkey, bytes.arrayify(bytes.concat([splitSignature.r, splitSignature.s]))),
    };
  }

  async getAccounts(): Promise<readonly AccountData[]> {
    const accountsWithPrivateKeys = await this.getAccWithPrivKeys();
    return accountsWithPrivateKeys.map(({ algo, pubkey, address }) => {
      return {
        algo,
        pubkey,
        address,
      };
    });
  }

  async getAccWithPrivKeys(): Promise<AccountDataWithPrivKey[]> {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const accountsWithPvtKey: AccountDataWithPrivKey[] = this.accounts.map(({ hdPath }) => {
        const ethWallet =
          this.type === 'mnemonic' ? EthWallet.fromMnemonic(this.mnemonic, hdPath) : new EthWallet(this.pvtKey);
        const addressBuffer = EthereumUtilsAddress.fromString(ethWallet.address.toString()).toBuffer();
        const bech32Address = bech32.encode(this.options.prefix, bech32.toWords(addressBuffer));
        const l = ethWallet._signingKey();
        return {
          algo: 'ethsecp256k1' as const,
          pubkey: fromHex(l.compressedPublicKey.replace('0x', '')),
          address: bech32Address,
          privkey: fromHex(l.privateKey.replace('0x', '')),
          ethWallet,
        };
      });
      resolve(accountsWithPvtKey);
    });
  }
}
