import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { v4 as uuidv4 } from 'uuid';

import {
  Ethereum,
  ETHEREUM_METHOD_TYPE,
  EthereumListenerType,
  EthereumRequestMessage,
  EthRequestAccountsResponse,
  LINE_TYPE,
} from './types';

const IDENTIFIER = 'compass';

export class LeapEvm implements Ethereum {
  public isCompass: boolean = true;
  private inpageStream: WindowPostMessageStream;
  private origin: string;
  private requestQueue: { [origin: string]: string[] };

  constructor() {
    this.inpageStream = new WindowPostMessageStream({
      name: `${IDENTIFIER}:inpage`,
      target: `${IDENTIFIER}:content`,
    });
    this.inpageStream.setMaxListeners(200);
    this.origin = window.location.origin;
    this.requestQueue = {};
  }

  private static generateId() {
    return uuidv4();
  }

  send(method: any, data?: any): string {
    const id = LeapEvm.generateId();

    this.inpageStream.write({
      ...data,
      id,
      method,
    });

    return id;
  }

  async request(message: EthereumRequestMessage) {
    const { method, ...restMessage } = message;
    const origin = this.origin;
    const stringifyOrigin = JSON.stringify(origin);

    if (this.requestQueue[stringifyOrigin]) {
      const originRequestedMethods = this.requestQueue[stringifyOrigin];

      if (!originRequestedMethods.includes(method)) {
        this.requestQueue = {
          [stringifyOrigin]: [...originRequestedMethods, method],
        };
      } else {
        return Promise.resolve();
      }
    } else {
      this.requestQueue = {
        ...this.requestQueue,
        [stringifyOrigin]: [method],
      };
    }

    const removeMethodFromRequestQueue = () => {
      const originRequestedMethods = this.requestQueue[stringifyOrigin];
      const filteredMethods = originRequestedMethods.filter((_method) => _method !== method);
      this.requestQueue = {
        ...this.requestQueue,
        [stringifyOrigin]: filteredMethods,
      };
    };

    setTimeout(removeMethodFromRequestQueue, 2000);
    return new Promise((res, rej) => {
      const id = this.send(method, { ...restMessage, origin, ecosystem: LINE_TYPE.ETHEREUM });

      this.inpageStream.on('data', (data: any) => {
        if (data.id === id) {
          if (data.payload?.error) {
            rej(data.payload.error);
          } else {
            if (data.name === `on${ETHEREUM_METHOD_TYPE.WALLET__SWITCH_ETHEREUM_CHAIN.toUpperCase()}`) {
              const chainId = data.payload.success.chainId;
              const customEvent = new CustomEvent('chainChanged', { detail: { data: chainId } });
              window.dispatchEvent(customEvent);

              res(null);
            } else {
              res(data.payload.success);
            }
          }

          removeMethodFromRequestQueue();
        }
      });
    });
  }

  on(eventName: EthereumListenerType, eventHandler: (data: unknown) => void) {
    if (eventName === 'chainChanged') {
      window.addEventListener('chainChanged', (event: any) => {
        eventHandler(event.detail.data);
      });
    }

    if (eventName === 'accountsChanged') {
      window.addEventListener('accountsChanged', (event: any) => {
        eventHandler(event.detail.data);
      });
    }
  }

  enable() {
    return this.request({
      method: ETHEREUM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS,
      params: [],
    }) as Promise<EthRequestAccountsResponse>;
  }
}
