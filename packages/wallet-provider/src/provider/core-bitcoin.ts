import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { v4 as uuidv4 } from 'uuid';

import { BITCOIN_METHOD_TYPE, ILeapBitcoin, LINE_TYPE, Network } from './types';

const IDENTIFIER = 'leap';

export class LeapBitcoin implements ILeapBitcoin {
  private inpageStream: WindowPostMessageStream;
  private origin: string;

  private chainChangedEventHandler: (event: any) => void = () => {};
  private accountsChangedEventHandler: (event: any) => void = () => {};
  private disconnectEventHandler: (event: any) => void = () => {};
  private connectEventHandler: (event: any) => void = () => {};

  constructor() {
    this.inpageStream = new WindowPostMessageStream({
      name: `${IDENTIFIER}:inpage`,
      target: `${IDENTIFIER}:content`,
    });
    this.inpageStream.setMaxListeners(200);
    this.origin = window.location.origin;
  }

  private static generateId() {
    return uuidv4();
  }

  private send(method: BITCOIN_METHOD_TYPE, data?: any): string {
    const id = LeapBitcoin.generateId();

    this.inpageStream.write({
      ...(data ?? {}),
      id,
      method,
      origin: this.origin,
      ecosystem: LINE_TYPE.BITCOIN,
    });

    return id;
  }

  private request(method: BITCOIN_METHOD_TYPE, data?: any): Promise<any> {
    const id = this.send(method, data);
    return new Promise((resolve) => {
      this.inpageStream.on('data', (result) => {
        if (result.id === id) {
          resolve(result);
        }
      });
    });
  }

  private async requestWrapper(method: BITCOIN_METHOD_TYPE, data?: any): Promise<any> {
    const response = await this.request(method, data);
    if (response?.payload?.error) {
      throw new Error(response?.payload?.error);
    }

    return response?.payload?.success;
  }

  async connectWallet(): Promise<string> {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.CONNECT_WALLET);
  }

  async getAddress(): Promise<string> {
    const address = await this.requestWrapper(BITCOIN_METHOD_TYPE.GET_ADDRESS);
    return address;
  }

  async getAccounts(): Promise<string[]> {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.GET_ACCOUNTS);
  }

  async getNetwork() {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.GET_NETWORK);
  }

  async getPublicKey(): Promise<string> {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.GET_PUBLIC_KEY);
  }

  async getPublicKeyHex(): Promise<string> {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.GET_PUBLIC_KEY);
  }

  off(eventName: string) {
    if (eventName === 'chainChanged') {
      window.removeEventListener('chainChanged', this.chainChangedEventHandler);
    }

    if (eventName === 'accountsChanged') {
      window.removeEventListener('accountsChanged', this.accountsChangedEventHandler);
    }

    if (eventName === 'disconnect') {
      window.removeEventListener('disconnect', this.disconnectEventHandler);
    }

    if (eventName === 'connect') {
      window.removeEventListener('connect', this.connectEventHandler);
    }
  }

  on(eventName: string, eventHandler: (data: unknown) => void) {
    if (eventName === 'chainChanged') {
      this.chainChangedEventHandler = (event: any) => {
        eventHandler(event.detail.data);
      };

      window.addEventListener('chainChanged', this.chainChangedEventHandler);
    }

    if (eventName === 'accountsChanged') {
      this.accountsChangedEventHandler = (event: any) => {
        eventHandler(event.detail.data);
      };

      window.addEventListener('accountsChanged', this.accountsChangedEventHandler);
    }

    if (eventName === 'disconnect') {
      this.disconnectEventHandler = (event: any) => {
        eventHandler(event.detail.data);
      };

      window.addEventListener('disconnect', this.disconnectEventHandler);
    }

    if (eventName === 'connect') {
      this.connectEventHandler = (event: any) => {
        eventHandler(event.detail.data);
      };

      window.addEventListener('connect', this.connectEventHandler);
    }
  }

  async requestAccounts(): Promise<string[]> {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.REQUEST_ACCOUNTS);
  }

  async sendBitcoin(to: string, amount: number): Promise<string> {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.SEND_BITCOIN, { to, amount });
  }

  async signMessage(message: string, type?: 'ecdsa' | 'bip322-simple'): Promise<string> {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.SIGN_MESSAGE, { message, type });
  }

  async signPsbt(psbtHex: string): Promise<string> {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.SIGN_PSBT, { psbtHex });
  }

  async signPsbts(psbtsHexes: string[]): Promise<string[]> {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.SIGN_PSBTS, { psbtsHexes });
  }

  async switchNetwork(network: Network) {
    return await this.requestWrapper(BITCOIN_METHOD_TYPE.SWITCH_NETWORK, { network });
  }
}
