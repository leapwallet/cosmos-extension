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

import { LINE_TYPE, RequestSignSuiMsg } from './types';
import { SUI_FEATURE, WalletEventsMap } from './types/sui';

const IDENTIFIER = process.env.APP?.includes('compass') ? 'compass' : 'leap';

export const SUI_CHAIN_IDS = [SUI_DEVNET_CHAIN, SUI_MAINNET_CHAIN, SUI_TESTNET_CHAIN];

const LEAP_SUI_CHAINS = [SUI_DEVNET_CHAIN, SUI_MAINNET_CHAIN, SUI_TESTNET_CHAIN] as const;

export class LeapSui implements Wallet {
  readonly #url: string = 'https://leapwallet.io';
  readonly #version = '1.0.0' as const;
  readonly #name: string = 'Leap Wallet';
  readonly #icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTY2IiBoZWlnaHQ9IjE2NiIgdmlld0JveD0iMCAwIDE2NiAxNjYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF83ODBfNjEwKSI+CjxyZWN0IHdpZHRoPSIxNjYiIGhlaWdodD0iMTY2IiBmaWxsPSIjQzVGRkNFIi8+CjxwYXRoIGQ9Ik0xMzguNjE0IDEwMC40NDVDMTM4LjYxNCAxMjAuMjE3IDExNC40ODMgMTI4LjI1MiA4NC41MjE2IDEyOC4yNTJDNTQuNTYwMyAxMjguMjUyIDMwLjA3ODQgMTIwLjIxNyAzMC4wNzg0IDEwMC40NDVDMzAuMDc4NCA4MC42NzI0IDU0LjM4NDYgNjQuNjczIDg0LjM0NiA2NC42NzNDMTE0LjMwNyA2NC42NzMgMTM4LjYxNCA4MC43MDc0IDEzOC42MTQgMTAwLjQ0NVoiIGZpbGw9IiMyNEE5NUEiLz4KPHBhdGggZD0iTTEzMy4xMDMgNTcuMzQ3MkMxMzMuMTAzIDQ2LjkzNyAxMjQuNjAzIDM4LjQ4MzIgMTE0LjEzNiAzOC40ODMyQzEwOC42OTMgMzguNDgzMiAxMDMuNzg3IDQwLjc3MTkgMTAwLjMzIDQ0LjQxNzFDOTkuNzk0NCA0NC45ODE4IDk5LjAxMTggNDUuMjU2OSA5OC4yNDkgNDUuMTAyOUM5My44NjkgNDQuMjE4NSA4OS4yMzU1IDQzLjcyMzIgODQuNDU1NSA0My43MjMyQzc5LjY3NiA0My43MjMyIDc1LjA0MyA0NC4xODkzIDcwLjY2MzQgNDUuMDk1QzY5Ljg5OTggNDUuMjUyOSA2OS4xMTM4IDQ0Ljk4MjMgNjguNTc1IDQ0LjQxODZDNjUuMDkgNDAuNzcyNSA2MC4xODY3IDM4LjQ4MzIgNTQuNzc1MiAzOC40ODMyQzQ0LjMwOCAzOC40ODMyIDM1LjgwNzkgNDYuOTM3IDM1LjgwNzkgNTcuMzQ3MkMzNS44MDc5IDYwLjM4MzQgMzYuNTI2MiA2My4yMjczIDM3Ljc5MTMgNjUuNzU3QzM4LjA5NDMgNjYuMzYyOCAzOC4xMjQ4IDY3LjA3MjEgMzcuODYyNyA2Ny42OTY2QzM2LjYzNTMgNzAuNjIxMiAzNS45ODM1IDczLjcwOTEgMzUuOTgzNSA3Ni45MDk4QzM1Ljk4MzUgOTUuMjQ5OCA1Ny42OTA1IDExMC4wOTYgODQuNDU1NSAxMTAuMDk2QzExMS4yMjEgMTEwLjA5NiAxMzIuOTI4IDk1LjI0OTggMTMyLjkyOCA3Ni45MDk4QzEzMi45MjggNzMuNzA5MSAxMzIuMjc2IDcwLjYyMTIgMTMxLjA0OCA2Ny42OTY2QzEzMC43ODYgNjcuMDcyMSAxMzAuODE3IDY2LjM2MjggMTMxLjEyIDY1Ljc1N0MxMzIuMzg1IDYzLjIyNzMgMTMzLjEwMyA2MC4zODM0IDEzMy4xMDMgNTcuMzQ3MloiIGZpbGw9IiMzMkRBNkQiLz4KPHBhdGggZD0iTTUzLjIyNzEgNjcuODExOUM1OS42Mjg3IDY3LjgxMTkgNjQuODE4MyA2Mi42NTA2IDY0LjgxODMgNTYuMjgzOUM2NC44MTgzIDQ5LjkxNzEgNTkuNjI4NyA0NC43NTU5IDUzLjIyNzEgNDQuNzU1OUM0Ni44MjU1IDQ0Ljc1NTkgNDEuNjM2IDQ5LjkxNzEgNDEuNjM2IDU2LjI4MzlDNDEuNjM2IDYyLjY1MDYgNDYuODI1NSA2Ny44MTE5IDUzLjIyNzEgNjcuODExOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMTUuMDY1IDY3LjgxMTlDMTIxLjQ2NiA2Ny44MTE5IDEyNi42NTYgNjIuNjUwNiAxMjYuNjU2IDU2LjI4MzlDMTI2LjY1NiA0OS45MTcxIDEyMS40NjYgNDQuNzU1OSAxMTUuMDY1IDQ0Ljc1NTlDMTA4LjY2MyA0NC43NTU5IDEwMy40NzQgNDkuOTE3MSAxMDMuNDc0IDU2LjI4MzlDMTAzLjQ3NCA2Mi42NTA2IDEwOC42NjMgNjcuODExOSAxMTUuMDY1IDY3LjgxMTlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDcuMDc1OSAxMjYuODI5QzQ5LjU2OTggMTI2LjgyOSA1MS41MzY4IDEyNC42NjMgNTEuMjU1OCAxMjIuMjE4QzUwLjIzNzIgMTEzLjU1NCA0NS45MTY4IDk0Ljc5NSAyNi45MTQ0IDgzLjUxMTVDNi4wODM2OCA3MS4xMzg3IDE1Ljk5NDEgMTA0LjAzNCAyMC4xMzY1IDExNi4wMTlDMjAuOTc0NCAxMTguNDQzIDIwLjAwMjcgMTIxLjEzNSAxNy43NzgzIDEyMi40MTFMMTYuNDEyMSAxMjMuMTk2QzE0LjY1NTkgMTI0LjIwOSAxNS4zOTM1IDEyNi44MjkgMTcuMzk1NiAxMjYuODI5SDQ3LjA3NTlaIiBmaWxsPSIjMzJEQTZEIi8+CjxwYXRoIGQ9Ik0xMjIuNTY2IDEyNi44MjlDMTIwLjMxOCAxMjYuODI5IDExOC41NjIgMTI0LjY2MyAxMTguODA4IDEyMi4yMThDMTE5LjY4NiAxMTMuNTg5IDEyMy42MiA5NC43OTUgMTQwLjc2MSA4My41MTE1QzE1OS43NDEgNzEuMDQyNiAxNTAuNTAzIDEwNC41NDcgMTQ2LjgxNSAxMTYuMjk0QzE0Ni4wOTIgMTE4LjU5OCAxNDYuOTgyIDEyMS4xMDYgMTQ5LjAyMiAxMjIuMzk5TDE1MC4yOCAxMjMuMTk2QzE1MS44NiAxMjQuMjA5IDE1MS4xOTMgMTI2LjgyOSAxNDkuNDAyIDEyNi44MjlIMTIyLjU2NloiIGZpbGw9IiMzMkRBNkQiLz4KPHBhdGggZD0iTTUzLjI0MjggNjMuMTc4N0M1Ny4wNjE3IDYzLjE3ODcgNjAuMTU3NiA2MC4wODI4IDYwLjE1NzYgNTYuMjYzOUM2MC4xNTc2IDUyLjQ0NSA1Ny4wNjE3IDQ5LjM0OTEgNTMuMjQyOCA0OS4zNDkxQzQ5LjQyMzkgNDkuMzQ5MSA0Ni4zMjggNTIuNDQ1IDQ2LjMyOCA1Ni4yNjM5QzQ2LjMyOCA2MC4wODI4IDQ5LjQyMzkgNjMuMTc4NyA1My4yNDI4IDYzLjE3ODdaIiBmaWxsPSIjMDkyNTExIi8+CjxwYXRoIGQ9Ik0xMTUuMDgxIDYzLjE3ODdDMTE4LjkgNjMuMTc4NyAxMjEuOTk1IDYwLjA4MjggMTIxLjk5NSA1Ni4yNjM5QzEyMS45OTUgNTIuNDQ1IDExOC45IDQ5LjM0OTEgMTE1LjA4MSA0OS4zNDkxQzExMS4yNjIgNDkuMzQ5MSAxMDguMTY2IDUyLjQ0NSAxMDguMTY2IDU2LjI2MzlDMTA4LjE2NiA2MC4wODI4IDExMS4yNjIgNjMuMTc4NyAxMTUuMDgxIDYzLjE3ODdaIiBmaWxsPSIjMDkyNTExIi8+CjxwYXRoIGQ9Ik05OS43OTk1IDgzLjAxNzZDMTAxLjUxNCA4My4xNjUxIDEwMi44MSA4NC42ODYyIDEwMi4zNzggODYuMzUxOEMxMDIuMDI5IDg3LjY5NzkgMTAxLjUyOSA4OS4wMDM5IDEwMC44ODYgOTAuMjQ0MkM5OS43NjMgOTIuNDA5IDk4LjIyNDYgOTQuMzMxNSA5Ni4zNTg2IDk1LjkwMThDOTQuNDkyNyA5Ny40NzIyIDkyLjMzNTcgOTguNjU5NiA5MC4wMTA4IDk5LjM5NjNDODcuNjg2IDEwMC4xMzMgODUuMjM4OCAxMDAuNDA1IDgyLjgwOSAxMDAuMTk2QzgwLjM3OTEgOTkuOTg2NiA3OC4wMTQzIDk5LjMwMSA3NS44NDk0IDk4LjE3OEM3My42ODQ2IDk3LjA1NTEgNzEuNzYyMSA5NS41MTY3IDcwLjE5MTcgOTMuNjUwN0M2OC42MjE0IDkxLjc4NDggNjcuNDM0IDg5LjYyNzggNjYuNjk3MiA4Ny4zMDI5QzY2LjE3MDEgODUuNjM5NiA2NS44ODExIDgzLjkxMzUgNjUuODM1OSA4Mi4xNzYxQzY1LjgwNiA4MS4wMjk0IDY2LjgyNDQgODAuMTgwOCA2Ny45NjczIDgwLjI3OTFMODQuNDAwNyA4MS42OTI4TDk5Ljc5OTUgODMuMDE3NloiIGZpbGw9IiMwOTI1MTEiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF83ODBfNjEwIj4KPHJlY3Qgd2lkdGg9IjE2NiIgaGVpZ2h0PSIxNjYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==' as `data:image/svg+xml;base64,${string}`;
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
