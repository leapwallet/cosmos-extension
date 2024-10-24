import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { v4 as uuidv4 } from 'uuid';

import {
  Ethereum,
  ETHEREUM_METHOD_TYPE,
  ETHEREUM_NO_POPUP_METHOD_TYPE,
  EthereumListenerType,
  EthereumRequestMessage,
  EthRequestAccountsResponse,
  LINE_TYPE,
} from './types';

const IDENTIFIER = process.env.APP?.includes('compass') ? 'compass' : 'leap';

export class LeapEvm implements Ethereum {
  public isCompass: boolean = IDENTIFIER === 'compass';
  public isLeap: boolean = IDENTIFIER === 'leap';
  private inpageStream: WindowPostMessageStream;
  private origin: string;
  private requestQueue: { [key: string]: (EthereumRequestMessage & { requestQueueId: string })[] };

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

    const requestQueueKey = JSON.stringify(`${origin}====:====${method}`);
    let requestQueueId = '';

    if (!Object.values(ETHEREUM_NO_POPUP_METHOD_TYPE).includes(method)) {
      const requestQueueKeyItems = this.requestQueue[requestQueueKey];
      requestQueueId = `#00${requestQueueKeyItems?.length || 0}`;

      if (requestQueueKeyItems?.length) {
        this.requestQueue = {
          [requestQueueKey]: [...requestQueueKeyItems, { ...message, requestQueueId }],
        };
      } else {
        this.requestQueue = {
          ...this.requestQueue,
          [requestQueueKey]: [{ ...message, requestQueueId }],
        };
      }
    }

    const removeMethodFromRequestQueue = () => {
      const requestQueueKeyItems = this.requestQueue[requestQueueKey];
      const filteredQueueKeyItems = requestQueueKeyItems?.filter(
        (message) => message.requestQueueId !== requestQueueId,
      );

      this.requestQueue = {
        ...this.requestQueue,
        [requestQueueKey]: filteredQueueKeyItems,
      };
    };

    return new Promise((res, rej) => {
      const id = this.send(method, {
        ...restMessage,
        origin,
        ecosystem: LINE_TYPE.ETHEREUM,
        isLeap: this.isLeap,
        isCompass: this.isCompass,
      });

      this.inpageStream.on('data', (data: any) => {
        if (data.id === id) {
          if (data.payload?.error) {
            if (data.name === `on${ETHEREUM_METHOD_TYPE.WALLET__REVOKE_PERMISSIONS.toUpperCase()}`) {
              const customEvent = new CustomEvent('disconnect', { detail: { data: data.payload?.error } });
              window.dispatchEvent(customEvent);
            }

            rej(data.payload.error);
          } else {
            if (
              [
                `on${ETHEREUM_METHOD_TYPE.WALLET__SWITCH_ETHEREUM_CHAIN.toUpperCase()}`,
                `on${ETHEREUM_METHOD_TYPE.WALLET__ADD_ETHEREUM_CHAIN.toUpperCase()}`,
              ].includes(data.name)
            ) {
              const chainId = data.payload.success.chainId;
              const customEvent = new CustomEvent('chainChanged', { detail: { data: chainId } });
              window.dispatchEvent(customEvent);

              const connectCustomEvent = new CustomEvent('connect', { detail: { data: { chainId } } });
              window.dispatchEvent(connectCustomEvent);

              res(null);
              return;
            }

            if (data.name === `on${ETHEREUM_METHOD_TYPE.WALLET__REVOKE_PERMISSIONS.toUpperCase()}`) {
              const customEvent = new CustomEvent('disconnect', { detail: { data: data.payload?.success } });
              window.dispatchEvent(customEvent);
            }

            res(data.payload.success);
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

    if (eventName === 'disconnect') {
      window.addEventListener('disconnect', (event: any) => {
        eventHandler(event.detail.data);
      });
    }

    if (eventName === 'connect') {
      window.addEventListener('connect', (event: any) => {
        eventHandler(event.detail.data);
      });
    }
  }

  toJSON() {
    return {
      name: 'LeapEvm',
      isLeap: this.isLeap,
      isCompass: this.isCompass,
    };
  }

  enable() {
    return this.request({
      method: ETHEREUM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS,
      params: [],
    }) as Promise<EthRequestAccountsResponse>;
  }
}
