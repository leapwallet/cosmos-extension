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
  private inpageStream = new WindowPostMessageStream({
    name: `${IDENTIFIER}:inpage`,
    target: `${IDENTIFIER}:content`,
  });
  private origin: string = window.location.origin;

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
    return new Promise((res, rej) => {
      const { method, ...restMessage } = message;
      const id = this.send(method, { ...restMessage, origin: this.origin, ecosystem: LINE_TYPE.ETHEREUM });

      this.inpageStream.on('data', (data: any) => {
        if (data.id === id) {
          if (data.payload?.error) {
            rej(data.payload.error);
          } else {
            res(data.payload.success);
          }
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  on(eventName: EthereumListenerType, eventHandler: (data: unknown) => void) {
    //
  }

  enable() {
    return this.request({
      method: ETHEREUM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS,
      params: [],
    }) as Promise<EthRequestAccountsResponse>;
  }
}
