import { AminoSignResponse, StdSignature, StdSignDoc } from '@cosmjs/amino';
import { EthSignType } from '@leapwallet/cosmos-wallet-sdk';
import { BroadcastMode } from 'cosmjs-types/cosmos/tx/v1beta1/service';

import { Message } from '../messaging/message';
import { ChainInfo } from './chain-info';
import { Key } from './key';
import { LeapSignOptions } from './leap';

export class EnableAccessMsg extends Message<void> {
  constructor(public readonly chainIds: string[]) {
    super();
  }

  public static type() {
    return 'enable-access';
  }

  validateBasic(): void {
    if (!this.chainIds || this.chainIds.length === 0) {
      throw new Error('chain id not set');
    }
  }

  type(): string {
    return EnableAccessMsg.type();
  }
}

export class GetSupportedChainsMsg extends Message<void> {
  constructor() {
    super();
  }

  public static type() {
    return 'get-supported-chains';
  }

  validateBasic(): void {
    //;
  }

  type(): string {
    return GetSupportedChainsMsg.type();
  }
}

export class SuggestChainInfoMsg extends Message<void> {
  chainInfo: ChainInfo;
  constructor(chainInfo: ChainInfo) {
    super();
    this.chainInfo = SuggestChainInfoMsg.sanitize(chainInfo);
  }

  public static type() {
    return 'suggest-chain-info';
  }

  static sanitize(chainInfo: any): ChainInfo {
    if (!chainInfo) throw new Error('Chain info not set');
    const result = { ...chainInfo };
    if (!result.bip44) throw new Error('bip44 not set');
    if (!result.rpc) throw new Error('rpc url not set');
    if (!result.rest) throw new Error('rest url not set');
    if (!result.chainId) throw new Error('chain id not set');
    if (!result.chainName) throw new Error('chain name not set');
    if (!result.feeCurrencies) throw new Error('stake currency not set');
    if (!result.bech32Config) throw new Error('bech32 config not set');
    if (!result.stakeCurrency) throw new Error('stake currency not set');
    return {
      rpc: result.rpc,
      rest: result.rest,
      chainId: result.chainId,
      chainName: result.chainName ?? result.name,
      stakeCurrency: result.stakeCurrency,
      walletUrlForStaking: result.walletUrlForStaking,
      bip44: result.bip44,
      alternativeBIP44s: result.alternativeBIP44s,
      bech32Config: result.bech32Config,
      currencies: result.currencies,
      feeCurrencies: result.feeCurrencies,
      features: result.features,
      apiStatus: result?.apiStatus,
      theme: result.theme,
      image: result.image,
      chainRegistryPath: result.chainRegistryPath ?? result.bech32Config.bech32PrefixAccAddr,
    };
  }

  validateBasic(): void {
    if (!this.chainInfo) {
      throw new Error('chain info not set');
    }
  }

  type(): string {
    return SuggestChainInfoMsg.type();
  }
}

export class GetKeyMsg extends Message<Key> {
  constructor(public readonly chainId: string) {
    super();
  }

  public static type() {
    return 'get-key';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }
  }

  type(): string {
    return GetKeyMsg.type();
  }
}

export class GetKeysMsg extends Message<Key[]> {
  constructor(public readonly chainIds: string[]) {
    super();
  }

  public static type() {
    return 'get-keys';
  }

  type(): string {
    return GetKeysMsg.type();
  }

  validateBasic(): void {
    //
  }
}

export class SendTxMsg extends Message<Uint8Array> {
  public mode: BroadcastMode;
  constructor(public readonly chainId: string, public readonly tx: unknown, mode: 'sync' | 'async' | 'block') {
    super();
    this.mode = SendTxMsg.getBroadcastMode(mode);
  }

  static getBroadcastMode(mode: 'sync' | 'async' | 'block') {
    if (mode === 'async') {
      return BroadcastMode.BROADCAST_MODE_ASYNC;
    } else if (mode === 'sync') {
      return BroadcastMode.BROADCAST_MODE_SYNC;
    } else if (mode === 'block') {
      return BroadcastMode.BROADCAST_MODE_BLOCK;
    }
    return BroadcastMode.BROADCAST_MODE_UNSPECIFIED;
  }

  public static type() {
    return 'send-tx-to-background';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id is empty');
    }

    if (!this.tx) {
      throw new Error('tx is empty');
    }

    if (
      !this.mode ||
      (this.mode !== BroadcastMode.BROADCAST_MODE_SYNC &&
        this.mode !== BroadcastMode.BROADCAST_MODE_ASYNC &&
        this.mode !== BroadcastMode.BROADCAST_MODE_BLOCK)
    ) {
      throw new Error('invalid mode');
    }
  }

  type(): string {
    return SendTxMsg.type();
  }
}
export class RequestSignAminoMsg extends Message<AminoSignResponse> {
  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: LeapSignOptions & {
      isADR36WithString?: boolean;
      ethSignType?: EthSignType;
      enableExtraEntropy?: boolean;
      isSignArbitrary?: boolean;
    } = {},
  ) {
    super();
  }

  public static type() {
    return 'request-sign-amino';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.signer) {
      throw new Error('signer not set');
    }

    const signDoc = this.signDoc;

    const hasOnlyMsgSignData = (() => {
      if (signDoc && signDoc.msgs && Array.isArray(signDoc.msgs) && signDoc.msgs.length === 1) {
        const msg = signDoc.msgs[0];
        return msg.type === 'sign/MsgSignData';
      } else {
        return false;
      }
    })();

    // If the sign doc is expected to be for ADR-36,
    // it doesn't have to have the chain id in the sign doc.
    if (!hasOnlyMsgSignData && signDoc.chain_id !== this.chainId) {
      throw new Error('Chain id in the message is not matched with the requested chain id');
    }

    // If the sign doc is expected to be for ADR-36,
    if (hasOnlyMsgSignData && signDoc.memo) {
      throw new Error('Adr36 messages should not have memo');
    }
    if (hasOnlyMsgSignData && signDoc.chain_id !== '') {
      throw new Error('Adr36 messages should not have chain_id');
    }
    if (hasOnlyMsgSignData && signDoc.account_number !== '0') {
      throw new Error('Adr36 messages should not have account_number');
    }
    if (hasOnlyMsgSignData && signDoc.sequence !== '0') {
      throw new Error('Adr36 messages should not have sequence');
    }
    if (hasOnlyMsgSignData && signDoc.fee.amount.length !== 0) {
      throw new Error('Adr36 messages should not have fee');
    }
    if (hasOnlyMsgSignData && signDoc.fee.gas !== '0') {
      throw new Error('Adr36 messages should not have gas');
    }

    if (!this.signOptions) {
      throw new Error('Sign options are null');
    }
  }

  type(): string {
    return RequestSignAminoMsg.type();
  }
}

export class RequestSignDirectMsg extends Message<{
  readonly signed: {
    bodyBytes: Uint8Array;
    authInfoBytes: Uint8Array;
    chainId: string;
    accountNumber: string;
  };
  readonly signature: StdSignature;
}> {
  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: string | null;
    },
    public readonly signOptions: LeapSignOptions = {},
  ) {
    super();
  }

  public static type() {
    return 'request-sign-direct';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.signer) {
      throw new Error('signer not set');
    }

    if (!this.signOptions) {
      throw new Error('Sign options are null');
    }
  }

  type(): string {
    return RequestSignDirectMsg.type();
  }
}

export class RequestVerifyADR36AminoSignDoc extends Message<boolean> {
  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly data: Uint8Array,
    public readonly signature: StdSignature,
  ) {
    super();
  }

  public static type() {
    return 'request-verify-adr-36-amino-doc';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.signer) {
      throw new Error('signer not set');
    }

    if (!this.signature) {
      throw new Error('Signature not set');
    }
  }

  type(): string {
    return RequestVerifyADR36AminoSignDoc.type();
  }
}

export class SuggestTokenMsg extends Message<void> {
  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string,
    public readonly viewingKey?: string,
  ) {
    super();
  }

  public static type() {
    return 'suggest-token';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('Chain id is empty');
    }

    if (!this.contractAddress) {
      throw new Error('Contract address is empty');
    }
  }

  type(): string {
    return SuggestTokenMsg.type();
  }
}

export class GetSecret20ViewingKey extends Message<string> {
  constructor(public readonly chainId: string, public readonly contractAddress: string) {
    super();
  }

  public static type() {
    return 'get-secret20-viewing-key';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('Chain id is empty');
    }

    if (!this.contractAddress) {
      throw new Error('Contract address is empty');
    }
  }

  type(): string {
    return GetSecret20ViewingKey.type();
  }
}

export class UpdateSecret20ViewingKey extends Message<string> {
  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string,
    public readonly viewingKey: string,
  ) {
    super();
  }

  public static type() {
    return 'update-secret20-viewing-key';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('Chain id is empty');
    }

    if (!this.contractAddress) {
      throw new Error('Contract address is empty');
    }
  }

  type(): string {
    return UpdateSecret20ViewingKey.type();
  }
}

export class GetPubkeyMsg extends Message<Uint8Array> {
  constructor(public readonly chainId: string) {
    super();
  }

  public static type() {
    return 'get-pubkey-msg';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }
  }

  type(): string {
    return GetPubkeyMsg.type();
  }
}

export class GetTxEncryptionKeyMsg extends Message<Uint8Array> {
  constructor(public readonly chainId: string, public readonly nonce: Uint8Array) {
    super();
  }

  public static type() {
    return 'get-tx-encryption-key-msg';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.nonce) {
      // Nonce of zero length is permitted.
      throw new Error('nonce is null');
    }
  }

  type(): string {
    return GetTxEncryptionKeyMsg.type();
  }
}

export class ReqeustEncryptMsg extends Message<Uint8Array> {
  constructor(
    public readonly chainId: string,
    public readonly contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    public readonly msg: object,
  ) {
    super();
  }

  public static type() {
    return 'request-encrypt-msg';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.contractCodeHash) {
      throw new Error('contract code hash not set');
    }

    if (!this.msg) {
      throw new Error('msg not set');
    }
  }

  type(): string {
    return ReqeustEncryptMsg.type();
  }
}

export class RequestDecryptMsg extends Message<Uint8Array> {
  constructor(
    public readonly chainId: string,
    public readonly cipherText: Uint8Array,
    public readonly nonce: Uint8Array,
  ) {
    super();
  }

  public static type() {
    return 'request-decrypt-msg';
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.cipherText || this.cipherText.length === 0) {
      throw new Error('ciphertext not set');
    }

    if (!this.nonce || this.nonce.length === 0) {
      throw new Error('nonce not set');
    }
  }

  type(): string {
    return RequestDecryptMsg.type();
  }
}
