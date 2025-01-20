// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import Long from 'long';
import { v4 as uuidv4 } from 'uuid';

import {
  EnableAccessMsg,
  GetKeyMsg,
  GetKeysMsg,
  GetSupportedChainsMsg,
  RequestExperimentalSignEip712Message,
  RequestSignAminoMsg,
  RequestSignDirectMsg,
  RequestVerifyADR36AminoSignDoc,
  SendTxMsg,
  SuggestChainInfoMsg,
} from '../types';
import { Message } from './message';
import { MessageRequester } from './types';

export enum SUPPORTED_METHODS {
  SEND_TX = 'send-tx-to-background',
  REQUEST_SIGN_DIRECT = 'request-sign-direct',
  REQUEST_SIGN_AMINO = 'request-sign-amino',
  GET_KEY = 'get-key',
  GET_KEYS = 'get-keys',
  ENABLE_ACCESS = 'enable-access',
  GET_SUPPORTED_CHAINS = 'get-supported-chains',
  GET_CONNECTION_STATUS = 'get-connection-status',
  ADD_SUGGESTED_CHAIN = 'add-suggested-chain',
  DISCONNECT = 'disconnect',
  GET_SECRET20_VIEWING_KEY = 'get-secret20-viewing-key',
  SUGGEST_TOKEN = 'suggest-token',
  SUGGEST_CW20_TOKEN = 'suggest-cw20-token',
  UPDATE_SECRET20_VIEWING_KEY = 'update-secret20-viewing-key',
  GET_PUBKEY_MSG = 'get-pubkey-msg',
  GET_TX_ENCRYPTION_KEY_MSG = 'get-tx-encryption-key-msg',
  REQUEST_ENCRYPT_MSG = 'request-encrypt-msg',
  REQUEST_DECRYPT_MSG = 'request-decrypt-msg',
  REQUEST_VERIFY_ADR36_AMINO_SIGN_DOC = 'request-verify-adr36-amino-sign-doc',
  REQUEST_SIGN_EIP712 = 'request-sign-eip712',
}

export class InExtensionMessageRequester implements MessageRequester {
  private inpageStream!: WindowPostMessageStream;
  private origin: string;

  constructor(identifier = 'leap') {
    this.inpageStream = new WindowPostMessageStream({
      name: `${identifier}:inpage`,
      target: `${identifier}:content`,
    });
    this.inpageStream.setMaxListeners(100);
    this.origin = window.location.origin;
    this.queue = [];
  }

  private static generateId(): number {
    return uuidv4();
  }

  destroy() {
    this.inpageStream && this.inpageStream.destroy();
  }

  send(type: any, data?: any): number {
    const id = InExtensionMessageRequester.generateId();
    this.inpageStream.write({
      ...data,
      id,
      type,
    });

    return id;
  }

  on(name: string, callback: (payload: any) => void): void;

  on(callback: (payload: any) => void): void;

  on(...args: any[]): void {
    this.inpageStream.on('data', (data: ResponseData) => {
      if (typeof args[0] === 'string') {
        data.name === args[0] && args[1](data.payload, data.name);
      } else {
        args[0](data.payload, data.name);
      }
    });
  }

  once(name: string, callback: (payload: any) => void): void;

  once(callback: (payload: any) => void): void;

  once(...args: any[]): void {
    this.inpageStream.once('data', (data: ResponseData) => {
      if (typeof args[0] === 'string') {
        data.name === args[0] && args[1](data.payload, data.name);
      } else {
        args[0](data.payload, data.name);
      }
    });
  }

  request(type: any, data?: any): Promise<any> {
    const originalData = { ...data, origin: this.origin };
    let modifiedData;
    try {
      modifiedData = JSON.parse(JSON.stringify(originalData)); // we are doing this to avoid proxy objects in Celenium request
    } catch (e) {
      //
    }

    const id = this.send(type, modifiedData || originalData);
    return new Promise((resolve) => {
      this.inpageStream.on('data', (result) => {
        if (result.id === id) {
          resolve(result);
        }
      });
    });
  }

  async requestWrapper(method: SUPPORTED_METHODS, message: Message) {
    if (message.validateBasic) {
      message.validateBasic();
    }
    const data = await this.request(method, message);
    if (data?.payload?.error) {
      throw new Error(data?.payload.error);
    }
    return data;
  }

  async sendTx(message: SendTxMsg) {
    const data = await this.requestWrapper(SUPPORTED_METHODS.SEND_TX, message);
    const txHash = data?.payload?.txHash;
    const retVal = new Uint8Array(Object.values(txHash));
    return retVal;
  }

  async getSupportedChains(message: GetSupportedChainsMsg) {
    const data = await this.requestWrapper(SUPPORTED_METHODS.GET_SUPPORTED_CHAINS, message);
    return data?.payload?.chains;
  }

  async signAmino(message: RequestSignAminoMsg) {
    const data = await this.requestWrapper(SUPPORTED_METHODS.REQUEST_SIGN_AMINO, message);
    return data?.payload?.aminoSignResponse;
  }

  async signDirect(message: RequestSignDirectMsg) {
    const data = await this.requestWrapper(SUPPORTED_METHODS.REQUEST_SIGN_DIRECT, message);
    const directSignResponse = data?.payload?.directSignResponse;
    const { low, high, unsigned } = directSignResponse.signed.accountNumber;

    const accountNumber = new Long(low, high, unsigned);
    directSignResponse.signed.authInfoBytes = new Uint8Array(Object.values(directSignResponse.signed.authInfoBytes));
    directSignResponse.signed.bodyBytes = new Uint8Array(Object.values(directSignResponse.signed.bodyBytes));
    directSignResponse.signed.accountNumber = `${accountNumber.toString()}`;
    return directSignResponse;
  }

  async enableAccess(message: EnableAccessMsg) {
    const data = await this.requestWrapper(SUPPORTED_METHODS.ENABLE_ACCESS, message);
    return data?.payload?.access;
  }

  async getKey(message: GetKeyMsg) {
    const data = await this.requestWrapper(SUPPORTED_METHODS.GET_KEY, message);
    const key = data?.payload?.key;
    if (!key) {
      return this.getKey(message);
    }
    key.pubKey = new Uint8Array(Object.values(key?.pubKey ?? key?.publicKey));
    key.address = new Uint8Array(Object.values(key?.address));
    return key;
  }

  async getKeys(message: GetKeysMsg) {
    const data = await this.requestWrapper(SUPPORTED_METHODS.GET_KEYS, message);
    const keys = data?.payload?.keys;
    if (!keys || keys.length === 0) {
      return this.getKeys(message);
    }
    return keys;
  }

  async suggestToken(chainId: string, contractAddress: string, viewingKey?: string): Promise<void> {
    const data = await this.requestWrapper(SUPPORTED_METHODS.SUGGEST_TOKEN, { chainId, contractAddress, viewingKey });

    if (data.payload) return data.payload;
  }

  async suggestCW20Token(chainId: string, contractAddress: string): Promise<void> {
    const data = await this.requestWrapper(SUPPORTED_METHODS.SUGGEST_CW20_TOKEN, { chainId, contractAddress });

    if (data.payload) return data.payload;
  }

  async switchChain(chainId: string, existingChainId: string): Promise<void> {
    const data = await this.requestWrapper(SUPPORTED_METHODS.REQUEST_SWITCH_CHAIN, { chainId, existingChainId });

    if (data.payload) return data.payload;
  }

  async getSecret20ViewingKey(chainId: string, contractAddress: string): Promise<string> {
    const data = await this.requestWrapper(SUPPORTED_METHODS.GET_SECRET20_VIEWING_KEY, { chainId, contractAddress });
    if (data.payload) return data.payload;
  }

  async updateViewingKey(chainId: string, contractAddress: string, viewingKey: string): Promise<string> {
    const payload = await this.requestWrapper(SUPPORTED_METHODS.UPDATE_SECRET20_VIEWING_KEY, {
      chainId,
      contractAddress,
      viewingKey,
    });
    if (payload) return payload;
  }

  async verifyArbitrary(message: RequestVerifyADR36AminoSignDoc) {
    const data = await this.requestWrapper(SUPPORTED_METHODS.REQUEST_VERIFY_ADR36_AMINO_SIGN_DOC, message);
    return data?.payload?.verifyResponse;
  }

  async isConnected(chainId: string) {
    return (await this.requestWrapper(SUPPORTED_METHODS.GET_CONNECTION_STATUS, { chainId })).payload;
  }

  async disconnect(chainId: string | string[]) {
    return (await this.requestWrapper(SUPPORTED_METHODS.DISCONNECT, { chainId })).payload;
  }

  async experimentalSuggestChain(message: SuggestChainInfoMsg) {
    return (await this.requestWrapper(SUPPORTED_METHODS.ADD_SUGGESTED_CHAIN, message)).payload;
  }

  async getEnigmaPubKey(chainId: string) {
    const resp = (await this.requestWrapper(SUPPORTED_METHODS.GET_PUBKEY_MSG, { chainId })).payload;
    return new Uint8Array(Object.values(resp));
  }

  async getEnigmaTxEncryptionKey(chainId: string, nonce: Uint8Array) {
    const resp = (await this.requestWrapper(SUPPORTED_METHODS.GET_TX_ENCRYPTION_KEY_MSG, { chainId, nonce })).payload;
    return new Uint8Array(Object.values(resp));
  }

  async enigmaEncrypt(chainId: string, contractCodeHash: string, msg: object) {
    const resp = (await this.requestWrapper(SUPPORTED_METHODS.REQUEST_ENCRYPT_MSG, { chainId, contractCodeHash, msg }))
      .payload;
    return new Uint8Array(Object.values(resp));
  }

  async enigmaDecrypt(chainId: string, ciphertext: Uint8Array, nonce: Uint8Array) {
    const resp = await this.requestWrapper(SUPPORTED_METHODS.REQUEST_DECRYPT_MSG, { chainId, ciphertext, nonce });
    return new Uint8Array(Object.values(resp.payload));
  }

  async experimentalSignEIP712CosmosTx_v0(message: RequestExperimentalSignEip712Message) {
    const data = await this.requestWrapper(SUPPORTED_METHODS.REQUEST_SIGN_AMINO, message);
    return data?.payload?.aminoSignResponse;
  }
}
