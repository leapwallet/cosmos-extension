import { ChainInfo } from 'chain-info';
import { AminoSignResponse, DirectSignResponse, OfflineDirectSigner, StdSignature, StdSignDoc } from 'signer';

export type LeapEnigmaUtils = {
  getPubkey(): Promise<Uint8Array>;
  getTxEncryptionKey(nonce: Uint8Array): Promise<Uint8Array>;
  encrypt(contractCodeHash: string, msg: object): Promise<Uint8Array>;
  decrypt(ciphertext: Uint8Array, nonce: Uint8Array): Promise<Uint8Array>;
};
export type LeapMode = 'core' | 'extension' | 'mobile-web' | 'walletconnect';
export type LeapSignOptions = {
  readonly preferNoSetFee?: boolean;
  readonly preferNoSetMemo?: boolean;
  readonly disableBalanceCheck?: boolean;
};
export type LeapIntereactionOptions = {
  readonly sign?: LeapSignOptions;
};

export type Key = {
  readonly name: string;
  readonly algo: string;
  readonly pubKey: Uint8Array;
  readonly address: Uint8Array;
  readonly bech32Address: string;
  readonly isNanoLedger: boolean;
};

export enum BroadcastMode {
  BROADCAST_MODE_UNSPECIFIED = 0,
  BROADCAST_MODE_BLOCK = 1,
  BROADCAST_MODE_SYNC = 2,
  BROADCAST_MODE_ASYNC = 3,
  UNRECOGNIZED = -1,
}

export type OfflineSigner = OfflineDirectSigner;

export type EthSignType = 'message' | 'transaction' | 'eip-712';
export interface Leap {
  defaultOptions: LeapIntereactionOptions;
  version: string;
  mode: LeapMode;
  enable(chainds: string | string[]): Promise<void>;
  disconnect: (chainId: string) => Promise<boolean>;
  isConnected: (chainId: string) => Promise<boolean>;
  experimentalSuggestChain(chainInfo: ChainInfo): Promise<void>;
  getKey(chainId: string): Promise<Key>;
  signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: LeapSignOptions,
  ): Promise<AminoSignResponse>;
  signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: Long | null;
    },
    signOptions?: LeapSignOptions,
  ): Promise<DirectSignResponse>;
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature>;
  signEthereum(chainId: string, signer: string, data: string | Uint8Array, type: EthSignType): Promise<Uint8Array>;
  experimentalSignEip712CosmosTx_v0(
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions: LeapSignOptions,
  ): Promise<AminoSignResponse>;
  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array>;
  suggestToken(chainId: string, contractAddress: string, viewingKey?: string): Promise<void>;
  suggestCW20Token(chainId: string, contractAddress: string): Promise<void>;
  getSecret20ViewingKey(chainId: string, contractAddress: string): Promise<string>;
  updateViewingKey(chainId: string, contractAddress: string, viewingKey: string): Promise<void>;
  getEnigmaPubKey(chainId: string): Promise<Uint8Array>;
  getEnigmaTxEncryptionKey(chainId: string, nonce: Uint8Array): Promise<Uint8Array>;
  enigmaEncrypt(chainId: string, contractCodeHash: string, msg: object): Promise<Uint8Array>;
  enigmaDecrypt(chainId: string, ciphertext: Uint8Array, nonce: Uint8Array): Promise<Uint8Array>;
  getOfflineSigner: (chainId: string, signOptions: LeapSignOptions) => OfflineSigner & OfflineDirectSigner;
  getOfflineSignerAmino: (chainId: string, signOptions: LeapSignOptions) => OfflineSigner;
  getOfflineSignerAuto: (chainId: string, signOption: LeapSignOptions) => Promise<OfflineSigner | OfflineDirectSigner>;
  getEnigmaUtils: (chainId: string) => LeapEnigmaUtils;
  getSupportedChains: () => Promise<string[]>;
}

export interface LeapWindow {
  leap: Leap;
}
