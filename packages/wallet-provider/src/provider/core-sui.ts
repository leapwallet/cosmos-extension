import { WindowPostMessageStream } from '@metamask/post-message-stream';
import {
  IdentifierArray,
  ReadonlyWalletAccount,
  StandardConnect,
  StandardConnectFeature,
  StandardConnectInput,
  StandardConnectMethod,
  StandardDisconnect,
  StandardDisconnectFeature,
  StandardDisconnectMethod,
  StandardEvents,
  StandardEventsFeature,
  StandardEventsOnMethod,
  SUI_DEVNET_CHAIN,
  SUI_MAINNET_CHAIN,
  SUI_TESTNET_CHAIN,
  SuiReportTransactionEffects,
  SuiReportTransactionEffectsFeature,
  SuiReportTransactionEffectsMethod,
  SuiSignAndExecuteTransaction,
  SuiSignAndExecuteTransactionBlock,
  SuiSignAndExecuteTransactionBlockFeature,
  SuiSignAndExecuteTransactionBlockInput,
  SuiSignAndExecuteTransactionBlockMethod,
  SuiSignAndExecuteTransactionFeature,
  SuiSignAndExecuteTransactionInput,
  SuiSignAndExecuteTransactionMethod,
  SuiSignPersonalMessage,
  SuiSignPersonalMessageFeature,
  SuiSignPersonalMessageInput,
  SuiSignPersonalMessageMethod,
  SuiSignTransaction,
  SuiSignTransactionBlock,
  SuiSignTransactionBlockFeature,
  SuiSignTransactionBlockInput,
  SuiSignTransactionBlockMethod,
  SuiSignTransactionFeature,
  SuiSignTransactionInput,
  SuiSignTransactionMethod,
  Wallet,
} from '@mysten/wallet-standard';
import { base64 } from '@scure/base';
import mitt, { Emitter } from 'mitt';
import { v4 as uuidv4 } from 'uuid';

import { LeapFaviconDataURI } from '../utils';
import { LINE_TYPE, RequestSignSuiMsg } from './types';
import { SUI_FEATURE, WalletEventsMap } from './types/sui';

const IDENTIFIER = process.env.APP?.includes('compass') ? 'compass' : 'leap';

export const SUI_CHAIN_IDS = [SUI_DEVNET_CHAIN, SUI_MAINNET_CHAIN, SUI_TESTNET_CHAIN];

const LEAP_SUI_CHAINS = [SUI_DEVNET_CHAIN, SUI_MAINNET_CHAIN, SUI_TESTNET_CHAIN] as const;

export class LeapSui implements Wallet {
  readonly #url: string = 'https://leapwallet.io';
  readonly #version = '1.0.0' as const;
  readonly #name: string = 'Leap Wallet';
  readonly #icon = LeapFaviconDataURI;
  chainIds: string[] = SUI_CHAIN_IDS;

  #account: ReadonlyWalletAccount | null = null;
  #events: Emitter<WalletEventsMap>;

  private inpageStream: WindowPostMessageStream;
  private origin: string;

  constructor() {
    this.#events = mitt();
    this.inpageStream = new WindowPostMessageStream({
      name: `${IDENTIFIER}:inpage`,
      target: `${IDENTIFIER}:content`,
    });
    this.inpageStream.setMaxListeners(200);
    this.origin = window.location.origin;

    window.addEventListener('suiAccountsChanged', async () => {
      this.#events.emit('change', { accounts: this.accounts });
    });
  }

  get version() {
    return this.#version;
  }

  get name() {
    return this.#name;
  }

  get icon() {
    return this.#icon as any;
  }

  get chains() {
    return LEAP_SUI_CHAINS;
  }

  get accounts() {
    return this.#account ? [this.#account] : [];
  }

  private static generateId() {
    return uuidv4();
  }

  private send(method: SUI_FEATURE, data?: any): string {
    const id = LeapSui.generateId();

    this.inpageStream.write({
      ...(data ?? {}),
      id,
      method,
      origin: this.origin,
      ecosystem: LINE_TYPE.SUI,
    });

    return id;
  }

  private request(method: SUI_FEATURE, data?: any): Promise<any> {
    try {
      const id = this.send(method, data);
      return new Promise((resolve) => {
        const listener = (result: any) => {
          try {
            if (result && result.id === id) {
              if (result?.name === 'invokeOpenSidePanel') {
                this.send(SUI_FEATURE.OPEN_SIDE_PANEL, result);
                return;
              }
              this.inpageStream.removeListener('data', listener);
              resolve(result);
            }
          } catch (err) {
            // Ignore listener errors
          }
        };
        this.inpageStream.on('data', listener);
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private async requestWrapper(method: SUI_FEATURE, data?: any): Promise<any> {
    const response = await this.request(method, data);
    if (response?.payload?.error) {
      throw new Error(response?.payload?.error);
    }

    return response?.payload;
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SuiSignPersonalMessageFeature &
    SuiSignTransactionFeature &
    SuiSignAndExecuteTransactionFeature &
    SuiReportTransactionEffectsFeature &
    // Legacy features for backward compatibility
    SuiSignTransactionBlockFeature &
    SuiSignAndExecuteTransactionBlockFeature {
    return {
      [StandardConnect]: {
        version: '1.0.0',
        connect: this.#connect,
      },
      [StandardDisconnect]: {
        version: '1.0.0',
        disconnect: this.#disconnect,
      },
      [StandardEvents]: {
        version: '1.0.0',
        on: this.#on,
      },
      [SuiSignPersonalMessage]: {
        version: '1.1.0',
        signPersonalMessage: this.#signPersonalMessage,
      },
      [SuiSignTransaction]: {
        version: '2.0.0',
        signTransaction: this.#signTransaction,
      },
      [SuiSignAndExecuteTransaction]: {
        version: '2.0.0',
        signAndExecuteTransaction: this.#signAndExecuteTransaction,
      },
      [SuiReportTransactionEffects]: {
        version: '1.0.0',
        reportTransactionEffects: this.#reportTransactionEffects,
      },
      // Legacy features for backward compatibility
      [SuiSignTransactionBlock]: {
        version: '1.0.0',
        signTransactionBlock: this.#signTransactionBlock,
      },
      [SuiSignAndExecuteTransactionBlock]: {
        version: '1.0.0',
        signAndExecuteTransactionBlock: this.#signAndExecuteTransactionBlock,
      },
    };
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    this.#events.on(event, listener);
    return () => this.#events.off(event, listener);
  };

  #connect: StandardConnectMethod = async (input: StandardConnectInput | undefined) => {
    try {
      if (this.#account && !input?.silent) {
        return { accounts: this.accounts };
      }

      const response = await this.requestWrapper(SUI_FEATURE.STANDARD__CONNECT, {
        silent: input?.silent,
      });

      if (!response?.keys || !response.keys.length) {
        if (response?.error) {
          throw new Error(response.error);
        }
        throw new Error('No keys received from wallet - is Sui enabled in your wallet?');
      }

      const key = response.keys[0];
      if (!key.address || !key.publicKey) {
        throw new Error('Invalid key data received from wallet');
      }

      // const pkWithoutPrefix = key.publicKey.slice(2);
      this.#account = new ReadonlyWalletAccount({
        address: key.address,
        publicKey: Buffer.from(key.publicKey, 'hex'),
        chains: [SUI_MAINNET_CHAIN, SUI_TESTNET_CHAIN] as IdentifierArray,
        features: [
          'standard:connect',
          'standard:disconnect',
          'standard:events',
          'sui:signPersonalMessage',
          'sui:signTransaction',
          'sui:signAndExecuteTransaction',
          'sui:reportTransactionEffects',
          // Legacy features for backward compatibility
          'sui:signTransactionBlock',
          'sui:signAndExecuteTransactionBlock',
        ] as `${string}:${string}`[],
      });

      this.#events.emit('change', { accounts: this.accounts });
      return { accounts: this.accounts };
    } catch (error) {
      console.error('Failed to connect to Sui:', error);
      throw error;
    }
  };

  #disconnect: StandardDisconnectMethod = async () => {
    try {
      this.#account = null;
      this.#events.emit('change', { accounts: this.accounts });
      this.#events.all.clear();
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  };

  #signPersonalMessage: SuiSignPersonalMessageMethod = async (input: SuiSignPersonalMessageInput) => {
    try {
      if (!this.#account) throw new Error('not connected');
      const { message, account, chain } = input;

      const messageBase64 = base64.encode(message);

      let chainId = chain;

      if (!chain) {
        chainId = SUI_MAINNET_CHAIN as `${string}:${string}`;
      }

      if (account !== this.#account) throw new Error('invalid account');

      const msg = new RequestSignSuiMsg(chainId as `${string}:${string}`, account.address, message, false, true, {});
      msg.validateBasic();

      const signResponse = await this.requestWrapper(SUI_FEATURE.SUI__SIGN_TRANSACTION, msg);

      return {
        signature: base64.encode(new Uint8Array(Object.values(signResponse.signedTxData))),
        bytes: messageBase64,
      };
    } catch (error) {
      console.error('Failed to sign personal message:', error);
      throw error;
    }
  };

  #signTransaction: SuiSignTransactionMethod = async (input: SuiSignTransactionInput) => {
    try {
      if (!this.#account) throw new Error('not connected');
      const { transaction, account, chain } = input;

      if (account !== this.#account) throw new Error('invalid account');

      const tx = await transaction.toJSON();

      const msg = new RequestSignSuiMsg(chain as `${string}:${string}`, account.address, tx, false, false, {});
      msg.validateBasic();

      const signResponse = await this.requestWrapper(SUI_FEATURE.SUI__SIGN_TRANSACTION, msg);

      const signature = new Uint8Array(Object.values(signResponse.signature));

      // Verify signature format
      if (signature.length !== 97) {
        throw new Error(`Invalid signature length: ${signature.length}. Expected 97 bytes`);
      }
      if (signature[0] !== 0x00) {
        throw new Error(`Invalid signature flag: ${signature[0]}. Expected 0x00 for ED25519`);
      }

      return {
        bytes: base64.encode(new Uint8Array(Object.values(signResponse.txnBytes))),
        signature: base64.encode(new Uint8Array(Object.values(signResponse.signature))),
      };
    } catch (error) {
      console.error('Failed to sign txn:', error);
      throw error;
    }
  };

  #signAndExecuteTransaction: SuiSignAndExecuteTransactionMethod = async (input: SuiSignAndExecuteTransactionInput) => {
    try {
      if (!this.#account) throw new Error('not connected');
      const { transaction, account, chain } = input;

      if (account !== this.#account) throw new Error('invalid account');

      const tx = await transaction.toJSON();

      const msg = new RequestSignSuiMsg(chain as `${string}:${string}`, account.address, tx, true, false, {});
      msg.validateBasic();

      const signResponse = await this.requestWrapper(SUI_FEATURE.SUI__SIGN_AND_EXECUTE_TRANSACTION, msg);

      return {
        bytes: base64.encode(new Uint8Array(Object.values(signResponse.signedTxData.txnBytes))),
        signature: base64.encode(new Uint8Array(Object.values(signResponse.signedTxData.signature))),
        digest: signResponse.broadcastedTxn.digest,
        effects: signResponse.broadcastedTxn.effects,
      };
    } catch (error) {
      console.error('Failed to sign and execute txn:', error);
      throw error;
    }
  };

  #reportTransactionEffects: SuiReportTransactionEffectsMethod = async (...inputs) => {
    return this.requestWrapper(SUI_FEATURE.SUI__REPORT_TRANSACTION_EFFECTS, inputs);
  };

  // Legacy methods for backward compatibility
  #signTransactionBlock: SuiSignTransactionBlockMethod = async (input: SuiSignTransactionBlockInput) => {
    try {
      if (!this.#account) throw new Error('not connected');
      const { transactionBlock, account, chain } = input;

      if (account !== this.#account) throw new Error('invalid account');

      const tx = transactionBlock.getData(); // Uint8Array
      const txString = JSON.stringify(tx);

      const msg = new RequestSignSuiMsg(chain as `${string}:${string}`, account.address, txString, false, false, {});
      msg.validateBasic();

      const signResponse = await this.requestWrapper(SUI_FEATURE.SUI__SIGN_TRANSACTION, msg);

      const signature = new Uint8Array(Object.values(signResponse.signature));

      if (signature.length !== 97) {
        throw new Error(`Invalid signature length: ${signature.length}. Expected 97 bytes`);
      }
      if (signature[0] !== 0x00) {
        throw new Error(`Invalid signature flag: ${signature[0]}. Expected 0x00 for ED25519`);
      }

      return {
        transactionBlockBytes: base64.encode(new Uint8Array(Object.values(signResponse.txnBytes))),
        signature: base64.encode(signature),
      };
    } catch (error) {
      console.error('Failed to sign txn block:', error);
      throw error;
    }
  };

  #signAndExecuteTransactionBlock: SuiSignAndExecuteTransactionBlockMethod = async (
    input: SuiSignAndExecuteTransactionBlockInput,
  ) => {
    try {
      if (!this.#account) throw new Error('not connected');
      const { transactionBlock, account, chain } = input;

      if (account !== this.#account) throw new Error('invalid account');

      transactionBlock.setSender(account.address);

      const txString = transactionBlock.serialize();

      const msg = new RequestSignSuiMsg(chain as `${string}:${string}`, account.address, txString, true, false, {});
      msg.validateBasic();

      const signResponse = await this.requestWrapper(SUI_FEATURE.SUI__SIGN_AND_EXECUTE_TRANSACTION, msg);

      return {
        ...signResponse.broadcastedTxn,
      };
    } catch (error) {
      console.error('Failed to sign and execute txn:', error);
      throw error;
    }
  };
}
