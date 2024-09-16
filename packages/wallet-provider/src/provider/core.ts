import { AminoSignResponse, StdSignature, StdSignDoc, StdTx } from '@cosmjs/amino';
import { DirectSignResponse, OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { EthSignType } from '@leapwallet/cosmos-wallet-sdk';
import deepmerge from 'deepmerge';
import Long from 'long';

import { LeapEvm } from './core-evm';
import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from './cosmjs';
import { LeapEnigmaUtils } from './enigma';
import { InExtensionMessageRequester } from './messaging/requester';
import {
  ChainInfo,
  EnableAccessMsg,
  GetKeyMsg,
  GetKeysMsg,
  GetSupportedChainsMsg,
  Key,
  Leap as ILeap,
  LeapIntereactionOptions,
  LeapMode,
  LeapSignOptions,
  RequestExperimentalSignEip712Message,
  RequestSignAminoMsg,
  RequestSignDirectMsg,
  RequestVerifyADR36AminoSignDoc,
  SendTxMsg,
  SuggestChainInfoMsg,
} from './types';

const requester = new InExtensionMessageRequester(process.env.APP?.includes('compass') ? 'compass' : 'leap');

export class Leap implements ILeap {
  public defaultOptions: LeapIntereactionOptions = {};
  protected enigmaUtils: Map<string, any> = new Map();

  constructor(public readonly version: string, public readonly mode: LeapMode) {}

  async enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === 'string') {
      chainIds = [chainIds];
    }

    return requester.enableAccess(new EnableAccessMsg(chainIds));
  }

  async getSupportedChains() {
    return await requester.getSupportedChains(new GetSupportedChainsMsg());
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    if (process.env.APP?.includes('compass')) return;
    const suggestChainMessage = new SuggestChainInfoMsg(chainInfo);
    return await requester.experimentalSuggestChain(suggestChainMessage);
  }

  async getKey(chainId: string): Promise<Key> {
    const msg = new GetKeyMsg(chainId);

    return await requester.getKey(msg);
  }

  async sendTx(chainId: string, tx: StdTx | Uint8Array, mode: 'sync' | 'async' | 'block'): Promise<Uint8Array> {
    const msg = new SendTxMsg(chainId, tx, mode);
    return await requester.sendTx(msg);
  }

  async getKeys(chainIds: string[]): Promise<Key[]> {
    const msg = new GetKeysMsg(chainIds);
    return await requester.getKeys(msg);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: LeapSignOptions = {},
  ): Promise<AminoSignResponse> {
    if (!signer) throw new Error('Signer is required');

    const msg = new RequestSignAminoMsg(
      chainId,
      signer,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    );
    const response = await requester.signAmino(msg);
    return response;
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: Long | null;
    },
    signOptions: LeapSignOptions = {},
  ): Promise<DirectSignResponse> {
    const msg = new RequestSignDirectMsg(
      chainId,
      signer,
      {
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber ? signDoc.accountNumber.toString() : null,
      },
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    );
    const response = await requester.signDirect(msg);
    if (!response.signed) {
      throw new Error('Transaction declined');
    }

    const returnValue = {
      signed: {
        bodyBytes: response?.signed?.bodyBytes,
        authInfoBytes: response?.signed?.authInfoBytes,
        chainId: response?.signed?.chainId,
        accountNumber: Long.fromString(response?.signed?.accountNumber),
      },
      signature: response?.signature,
    };

    return returnValue;
  }
  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signOptions?: { enableExtraEntropy?: boolean },
  ): Promise<StdSignature> {
    let isADR36WithString = false;
    [data, isADR36WithString] = this.getDataForADR36(data);
    const signDoc = this.getADR36SignDoc(signer, data);

    const msg = new RequestSignAminoMsg(chainId, signer, signDoc, {
      isADR36WithString,
      enableExtraEntropy: signOptions?.enableExtraEntropy,
      isSignArbitrary: true,
    });

    return (await requester.signAmino(msg)).signature;
  }

  async verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature,
  ): Promise<boolean> {
    if (typeof data === 'string') {
      data = Buffer.from(data);
    }
    return requester.verifyArbitrary(new RequestVerifyADR36AminoSignDoc(chainId, signer, data, signature));
  }

  async signEthereum(chainId: string, signer: string, data: string | Uint8Array, type: EthSignType) {
    let isADR36WithString = false;
    [data, isADR36WithString] = this.getDataForADR36(data);
    const signDoc = this.getADR36SignDoc(signer, data);

    if (data === '') {
      throw new Error('Signing empty data is not supported.');
    }

    const msg = new RequestSignAminoMsg(chainId, signer, signDoc, {
      isADR36WithString,
      ethSignType: type,
      isSignArbitrary: true,
    });
    const signature = (await requester.signAmino(msg)).signature;

    const returnSignature = Buffer.from(signature.signature, 'base64');
    return new Uint8Array(returnSignature);
  }

  async experimentalSignEIP712CosmosTx_v0(
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions: LeapSignOptions = {},
  ): Promise<AminoSignResponse> {
    const message = new RequestExperimentalSignEip712Message(
      chainId,
      signer,
      eip712,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    );
    return await requester.experimentalSignEIP712CosmosTx_v0(message);
  }

  getOfflineSigner(chainId: string, signOptions?: LeapSignOptions): OfflineSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this, deepmerge(this.defaultOptions ?? {}, signOptions ?? {}));
  }

  getOfflineSignerOnlyAmino(chainId: string, signOptions?: LeapSignOptions): OfflineSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this, deepmerge(this.defaultOptions ?? {}, signOptions ?? {}));
  }

  async getOfflineSignerAuto(
    chainId: string,
    signOptions?: LeapSignOptions,
  ): Promise<OfflineSigner | OfflineDirectSigner> {
    const key = await this.getKey(chainId);
    const _signOpts = deepmerge(this.defaultOptions ?? {}, signOptions ?? {});

    if (key?.isNanoLedger) {
      return new CosmJSOfflineSignerOnlyAmino(chainId, this, _signOpts);
    } else {
      return new CosmJSOfflineSigner(chainId, this, _signOpts);
    }
  }

  async suggestToken(chainId: string, contractAddress: string, viewingKey?: string): Promise<void> {
    return await requester.suggestToken(chainId, contractAddress, viewingKey);
  }

  async suggestCW20Token(chainId: string, contractAddress: string): Promise<void> {
    await requester.suggestCW20Token(chainId, contractAddress);
  }

  async getSecret20ViewingKey(chainId: string, contractAddress: string): Promise<string> {
    return requester.getSecret20ViewingKey(chainId, contractAddress);
  }

  async updateViewingKey(chainId: string, contractAddress: string, viewingKey: string): Promise<string> {
    return requester.updateViewingKey(chainId, contractAddress, viewingKey);
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return requester.getEnigmaPubKey(chainId);
  }

  async getEnigmaTxEncryptionKey(chainId: string, nonce: Uint8Array): Promise<Uint8Array> {
    return requester.getEnigmaTxEncryptionKey(chainId, nonce);
  }

  async enigmaEncrypt(chainId: string, contractCodeHash: string, msg: object): Promise<Uint8Array> {
    return requester.enigmaEncrypt(chainId, contractCodeHash, msg);
  }

  async enigmaDecrypt(chainId: string, ciphertext: Uint8Array, nonce: Uint8Array): Promise<Uint8Array> {
    if (!ciphertext || ciphertext.length === 0) {
      return new Uint8Array();
    }

    return requester.enigmaDecrypt(chainId, ciphertext, nonce);
  }

  getEnigmaUtils(chainId: string): LeapEnigmaUtils {
    if (this.enigmaUtils.has(chainId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.enigmaUtils.get(chainId)!;
    }

    const enigmaUtils = new LeapEnigmaUtils(chainId, this);
    this.enigmaUtils.set(chainId, enigmaUtils);
    return enigmaUtils;
  }

  async isConnected(chainId: string): Promise<boolean> {
    return await requester.isConnected(chainId);
  }

  async disconnect(chainId: string): Promise<boolean> {
    return await requester.disconnect(chainId);
  }

  protected getDataForADR36(data: string | Uint8Array): [string, boolean] {
    let isADR36WithString = false;
    if (typeof data === 'string') {
      data = Buffer.from(data).toString('base64');
      isADR36WithString = true;
    } else {
      data = Buffer.from(data).toString('base64');
    }
    return [data, isADR36WithString];
  }

  protected getADR36SignDoc(signer: string, data: string): StdSignDoc {
    return {
      chain_id: '',
      account_number: '0',
      sequence: '0',
      fee: {
        gas: '0',
        amount: [],
      },
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: {
            signer,
            data,
          },
        },
      ],
      memo: '',
    };
  }

  public readonly ethereum = new LeapEvm();
}
