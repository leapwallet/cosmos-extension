import { UserResponseStatus } from '@aptos-labs/wallet-standard';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { base58 } from '@scure/base';
import {
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionFeature,
  type SolanaSignAndSendTransactionMethod,
  type SolanaSignAndSendTransactionOutput,
  SolanaSignIn,
  SolanaSignInFeature,
  SolanaSignInMethod,
  SolanaSignInOutput,
  SolanaSignMessage,
  type SolanaSignMessageFeature,
  type SolanaSignMessageMethod,
  type SolanaSignMessageOutput,
  SolanaSignTransaction,
  type SolanaSignTransactionFeature,
  type SolanaSignTransactionMethod,
  type SolanaSignTransactionOutput,
} from '@solana/wallet-standard-features';
import { PublicKey } from '@solana/web3.js';
import type { Wallet, WalletAccount } from '@wallet-standard/base';
import {
  StandardConnect,
  type StandardConnectFeature,
  type StandardConnectMethod,
  StandardDisconnect,
  type StandardDisconnectFeature,
  type StandardDisconnectMethod,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
  type StandardEventsOnMethod,
} from '@wallet-standard/features';
import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE, RequestSignSolanaMsg } from './types';
import { bytesEqual, genesisHashes, networkProviders, SOLANA_CHAINS } from './types/solana';
import { SOLANA_METHOD_TYPE } from './types/solana';

const IDENTIFIER = process.env.APP?.includes('compass') ? 'compass' : 'leap';

const chains = SOLANA_CHAINS;
const features = [SolanaSignAndSendTransaction, SolanaSignTransaction, SolanaSignMessage, SolanaSignIn] as const;

// Extend WalletAccount interface
interface ExtendedWalletAccount extends WalletAccount {
  network?: string;
  provider?: string;
  genesisHash?: string;
}

export class LeapWalletSolanaAccount implements ExtendedWalletAccount {
  readonly #address: WalletAccount['address'];
  readonly #publicKey: WalletAccount['publicKey'];
  readonly #chains: WalletAccount['chains'];
  readonly #features: WalletAccount['features'];
  readonly #label: WalletAccount['label'];
  readonly #icon: WalletAccount['icon'];
  #network: string | undefined = undefined;
  #provider: string | undefined = undefined;
  #genesisHash: string | undefined = undefined;

  get address() {
    return this.#address;
  }

  get publicKey() {
    return this.#publicKey.slice();
  }

  get chains() {
    return this.#chains.slice();
  }

  get features() {
    return this.#features.slice();
  }

  get label() {
    return this.#label;
  }

  get icon() {
    return this.#icon;
  }

  get network() {
    return this.#network;
  }

  get provider() {
    return this.#provider;
  }

  get genesisHash() {
    return this.#genesisHash;
  }

  constructor({
    address,
    publicKey,
    label,
    icon,
    network,
    provider,
    genesisHash,
  }: Omit<ExtendedWalletAccount, 'chains' | 'features'>) {
    if (new.target === LeapWalletSolanaAccount) {
      Object.freeze(this);
    }

    this.#address = address;
    this.#publicKey = publicKey;
    this.#chains = chains;
    this.#features = features;
    this.#label = label;
    this.#icon = icon;
    this.#network = network;
    this.#provider = provider;
    this.#genesisHash = genesisHash;
  }
}

export class LeapSolana implements Wallet {
  readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};
  readonly #version = '1.0.0' as const;
  readonly #name = 'Leap Wallet' as const;
  readonly #icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTY2IiBoZWlnaHQ9IjE2NiIgdmlld0JveD0iMCAwIDE2NiAxNjYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF83ODBfNjEwKSI+CjxyZWN0IHdpZHRoPSIxNjYiIGhlaWdodD0iMTY2IiBmaWxsPSIjQzVGRkNFIi8+CjxwYXRoIGQ9Ik0xMzguNjE0IDEwMC40NDVDMTM4LjYxNCAxMjAuMjE3IDExNC40ODMgMTI4LjI1MiA4NC41MjE2IDEyOC4yNTJDNTQuNTYwMyAxMjguMjUyIDMwLjA3ODQgMTIwLjIxNyAzMC4wNzg0IDEwMC40NDVDMzAuMDc4NCA4MC42NzI0IDU0LjM4NDYgNjQuNjczIDg0LjM0NiA2NC42NzNDMTE0LjMwNyA2NC42NzMgMTM4LjYxNCA4MC43MDc0IDEzOC42MTQgMTAwLjQ0NVoiIGZpbGw9IiMyNEE5NUEiLz4KPHBhdGggZD0iTTEzMy4xMDMgNTcuMzQ3MkMxMzMuMTAzIDQ2LjkzNyAxMjQuNjAzIDM4LjQ4MzIgMTE0LjEzNiAzOC40ODMyQzEwOC42OTMgMzguNDgzMiAxMDMuNzg3IDQwLjc3MTkgMTAwLjMzIDQ0LjQxNzFDOTkuNzk0NCA0NC45ODE4IDk5LjAxMTggNDUuMjU2OSA5OC4yNDkgNDUuMTAyOUM5My44NjkgNDQuMjE4NSA4OS4yMzU1IDQzLjcyMzIgODQuNDU1NSA0My43MjMyQzc5LjY3NiA0My43MjMyIDc1LjA0MyA0NC4xODkzIDcwLjY2MzQgNDUuMDk1QzY5Ljg5OTggNDUuMjUyOSA2OS4xMTM4IDQ0Ljk4MjMgNjguNTc1IDQ0LjQxODZDNjUuMDkgNDAuNzcyNSA2MC4xODY3IDM4LjQ4MzIgNTQuNzc1MiAzOC40ODMyQzQ0LjMwOCAzOC40ODMyIDM1LjgwNzkgNDYuOTM3IDM1LjgwNzkgNTcuMzQ3MkMzNS44MDc5IDYwLjM4MzQgMzYuNTI2MiA2My4yMjczIDM3Ljc5MTMgNjUuNzU3QzM4LjA5NDMgNjYuMzYyOCAzOC4xMjQ4IDY3LjA3MjEgMzcuODYyNyA2Ny42OTY2QzM2LjYzNTMgNzAuNjIxMiAzNS45ODM1IDczLjcwOTEgMzUuOTgzNSA3Ni45MDk4QzM1Ljk4MzUgOTUuMjQ5OCA1Ny42OTA1IDExMC4wOTYgODQuNDU1NSAxMTAuMDk2QzExMS4yMjEgMTEwLjA5NiAxMzIuOTI4IDk1LjI0OTggMTMyLjkyOCA3Ni45MDk4QzEzMi45MjggNzMuNzA5MSAxMzIuMjc2IDcwLjYyMTIgMTMxLjA0OCA2Ny42OTY2QzEzMC43ODYgNjcuMDcyMSAxMzAuODE3IDY2LjM2MjggMTMxLjEyIDY1Ljc1N0MxMzIuMzg1IDYzLjIyNzMgMTMzLjEwMyA2MC4zODM0IDEzMy4xMDMgNTcuMzQ3MloiIGZpbGw9IiMzMkRBNkQiLz4KPHBhdGggZD0iTTUzLjIyNzEgNjcuODExOUM1OS42Mjg3IDY3LjgxMTkgNjQuODE4MyA2Mi42NTA2IDY0LjgxODMgNTYuMjgzOUM2NC44MTgzIDQ5LjkxNzEgNTkuNjI4NyA0NC43NTU5IDUzLjIyNzEgNDQuNzU1OUM0Ni44MjU1IDQ0Ljc1NTkgNDEuNjM2IDQ5LjkxNzEgNDEuNjM2IDU2LjI4MzlDNDEuNjM2IDYyLjY1MDYgNDYuODI1NSA2Ny44MTE5IDUzLjIyNzEgNjcuODExOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMTUuMDY1IDY3LjgxMTlDMTIxLjQ2NiA2Ny44MTE5IDEyNi42NTYgNjIuNjUwNiAxMjYuNjU2IDU2LjI4MzlDMTI2LjY1NiA0OS45MTcxIDEyMS40NjYgNDQuNzU1OSAxMTUuMDY1IDQ0Ljc1NTlDMTA4LjY2MyA0NC43NTU5IDEwMy40NzQgNDkuOTE3MSAxMDMuNDc0IDU2LjI4MzlDMTAzLjQ3NCA2Mi42NTA2IDEwOC42NjMgNjcuODExOSAxMTUuMDY1IDY3LjgxMTlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDcuMDc1OSAxMjYuODI5QzQ5LjU2OTggMTI2LjgyOSA1MS41MzY4IDEyNC42NjMgNTEuMjU1OCAxMjIuMjE4QzUwLjIzNzIgMTEzLjU1NCA0NS45MTY4IDk0Ljc5NSAyNi45MTQ0IDgzLjUxMTVDNi4wODM2OCA3MS4xMzg3IDE1Ljk5NDEgMTA0LjAzNCAyMC4xMzY1IDExNi4wMTlDMjAuOTc0NCAxMTguNDQzIDIwLjAwMjcgMTIxLjEzNSAxNy43NzgzIDEyMi40MTFMMTYuNDEyMSAxMjMuMTk2QzE0LjY1NTkgMTI0LjIwOSAxNS4zOTM1IDEyNi44MjkgMTcuMzk1NiAxMjYuODI5SDQ3LjA3NTlaIiBmaWxsPSIjMzJEQTZEIi8+CjxwYXRoIGQ9Ik0xMjIuNTY2IDEyNi44MjlDMTIwLjMxOCAxMjYuODI5IDExOC41NjIgMTI0LjY2MyAxMTguODA4IDEyMi4yMThDMTE5LjY4NiAxMTMuNTg5IDEyMy42MiA5NC43OTUgMTQwLjc2MSA4My41MTE1QzE1OS43NDEgNzEuMDQyNiAxNTAuNTAzIDEwNC41NDcgMTQ2LjgxNSAxMTYuMjk0QzE0Ni4wOTIgMTE4LjU5OCAxNDYuOTgyIDEyMS4xMDYgMTQ5LjAyMiAxMjIuMzk5TDE1MC4yOCAxMjMuMTk2QzE1MS44NiAxMjQuMjA5IDE1MS4xOTMgMTI2LjgyOSAxNDkuNDAyIDEyNi44MjlIMTIyLjU2NloiIGZpbGw9IiMzMkRBNkQiLz4KPHBhdGggZD0iTTUzLjI0MjggNjMuMTc4N0M1Ny4wNjE3IDYzLjE3ODcgNjAuMTU3NiA2MC4wODI4IDYwLjE1NzYgNTYuMjYzOUM2MC4xNTc2IDUyLjQ0NSA1Ny4wNjE3IDQ5LjM0OTEgNTMuMjQyOCA0OS4zNDkxQzQ5LjQyMzkgNDkuMzQ5MSA0Ni4zMjggNTIuNDQ1IDQ2LjMyOCA1Ni4yNjM5QzQ2LjMyOCA2MC4wODI4IDQ5LjQyMzkgNjMuMTc4NyA1My4yNDI4IDYzLjE3ODdaIiBmaWxsPSIjMDkyNTExIi8+CjxwYXRoIGQ9Ik0xMTUuMDgxIDYzLjE3ODdDMTE4LjkgNjMuMTc4NyAxMjEuOTk1IDYwLjA4MjggMTIxLjk5NSA1Ni4yNjM5QzEyMS45OTUgNTIuNDQ1IDExOC45IDQ5LjM0OTEgMTE1LjA4MSA0OS4zNDkxQzExMS4yNjIgNDkuMzQ5MSAxMDguMTY2IDUyLjQ0NSAxMDguMTY2IDU2LjI2MzlDMTA4LjE2NiA2MC4wODI4IDExMS4yNjIgNjMuMTc4NyAxMTUuMDgxIDYzLjE3ODdaIiBmaWxsPSIjMDkyNTExIi8+CjxwYXRoIGQ9Ik05OS43OTk1IDgzLjAxNzZDMTAxLjUxNCA4My4xNjUxIDEwMi44MSA4NC42ODYyIDEwMi4zNzggODYuMzUxOEMxMDIuMDI5IDg3LjY5NzkgMTAxLjUyOSA4OS4wMDM5IDEwMC44ODYgOTAuMjQ0MkM5OS43NjMgOTIuNDA5IDk4LjIyNDYgOTQuMzMxNSA5Ni4zNTg2IDk1LjkwMThDOTQuNDkyNyA5Ny40NzIyIDkyLjMzNTcgOTguNjU5NiA5MC4wMTA4IDk5LjM5NjNDODcuNjg2IDEwMC4xMzMgODUuMjM4OCAxMDAuNDA1IDgyLjgwOSAxMDAuMTk2QzgwLjM3OTEgOTkuOTg2NiA3OC4wMTQzIDk5LjMwMSA3NS44NDk0IDk4LjE3OEM3My42ODQ2IDk3LjA1NTEgNzEuNzYyMSA5NS41MTY3IDcwLjE5MTcgOTMuNjUwN0M2OC42MjE0IDkxLjc4NDggNjcuNDM0IDg5LjYyNzggNjYuNjk3MiA4Ny4zMDI5QzY2LjE3MDEgODUuNjM5NiA2NS44ODExIDgzLjkxMzUgNjUuODM1OSA4Mi4xNzYxQzY1LjgwNiA4MS4wMjk0IDY2LjgyNDQgODAuMTgwOCA2Ny45NjczIDgwLjI3OTFMODQuNDAwNyA4MS42OTI4TDk5Ljc5OTUgODMuMDE3NloiIGZpbGw9IiMwOTI1MTEiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF83ODBfNjEwIj4KPHJlY3Qgd2lkdGg9IjE2NiIgaGVpZ2h0PSIxNjYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==' as const;
  #account: LeapWalletSolanaAccount | null = null;
  private inpageStream: WindowPostMessageStream;
  private origin: string;
  #network: string | undefined = undefined;
  #provider: string | undefined = undefined;
  #genesisHash: string | undefined = undefined;

  constructor() {
    try {
      this.inpageStream = new WindowPostMessageStream({
        name: `${IDENTIFIER}:inpage`,
        target: `${IDENTIFIER}:content`,
      });

      this.origin = window.location.origin;

      // Idealy why do we need this?
      window.addEventListener('leap_keystorechange', async () => {
        const address = this.#account?.address;
        if (address) {
          await this.connect({ silent: true });
        }
        this.#emit('change', { accounts: this.accounts });
      });
    } catch (error) {
      console.error('Failed to initialize Solana wallet stream:', error);
      throw error;
    }
  }

  get version() {
    return this.#version;
  }

  get name() {
    return this.#name;
  }

  get icon() {
    return this.#icon;
  }

  get chains() {
    return chains.slice();
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignMessageFeature &
    SolanaSignInFeature {
    return {
      [StandardConnect]: {
        version: '1.0.0',
        connect: this.connect,
      },
      [StandardDisconnect]: {
        version: '1.0.0',
        disconnect: this.disconnect,
      },
      [StandardEvents]: {
        version: '1.0.0',
        on: this.#on,
      },
      [SolanaSignAndSendTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signAndSendTransaction: this.signAndSendTransaction,
      },
      [SolanaSignTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signTransaction: this.signTransaction,
      },
      [SolanaSignMessage]: {
        version: '1.0.0',
        signMessage: this.signMessage,
      },
      [SolanaSignIn]: {
        version: '1.0.0',
        signIn: this.signIn,
      },
    };
  }

  get accounts() {
    return this.#account ? [this.#account] : [];
  }

  get network() {
    return this.#network;
  }

  get provider() {
    return this.#provider;
  }

  get genesisHash() {
    return this.#genesisHash;
  }

  private static generateId() {
    return uuidv4();
  }

  private send(method: SOLANA_METHOD_TYPE, data?: any): string {
    try {
      const id = LeapSolana.generateId();

      const message = {
        ...(data ?? {}),
        id,
        method,
        origin: this.origin,
        ecosystem: LINE_TYPE.SOLANA,
      };

      try {
        this.inpageStream.write(message);
      } catch (writeError) {
        console.warn('Failed to write to stream:', writeError);
        throw new Error('Failed to communicate with wallet: Connection error');
      }

      return id;
    } catch (error) {
      console.error('Error sending message to wallet:', error);
      throw error;
    }
  }

  private on(event: StandardEventsNames, listener: StandardEventsListeners[StandardEventsNames]) {
    this.#on(event, listener);
  }

  private request(method: SOLANA_METHOD_TYPE, data?: any): Promise<any> {
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

  private async requestWrapper(method: SOLANA_METHOD_TYPE, data?: any): Promise<any> {
    const response = await this.request(method, data);
    if (response?.payload?.error) {
      throw new Error(response?.payload?.error);
    }

    return response?.payload;
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
    return (): void => this.#off(event, listener);
  };

  #emit<E extends StandardEventsNames>(event: E, ...args: Parameters<StandardEventsListeners[E]>): void {
    this.#listeners[event]?.forEach((listener) => (listener as (...args: any[]) => void)(...args));
  }

  #off<E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): void {
    this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
  }

  #connected = () => {
    const address = this.#account?.address;
    if (address) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const publicKey = this.#account?.publicKey;

      const account = this.#account;
      if (!account || account.address !== address || !bytesEqual(account.publicKey, publicKey as Uint8Array)) {
        this.#account = new LeapWalletSolanaAccount({
          address,
          publicKey: publicKey as Uint8Array,
          label: 'Leap Wallet',
          icon: this.#icon,
          network: 'mainnet',
          provider: 'solana',
          genesisHash: '',
        });
        this.#emit('change', { accounts: this.accounts });
      }
    }
  };

  connect: StandardConnectMethod = async ({ silent } = {}) => {
    try {
      if (this.#account && !silent) {
        return { accounts: this.accounts };
      }

      const response = await this.requestWrapper(SOLANA_METHOD_TYPE.CONNECT, {
        silent,
        chainId: '101',
      });

      if (!response?.keys || !response.keys.length) {
        if (response?.error) {
          throw new Error(response.error);
        }
        throw new Error('No keys received from wallet - is Solana enabled in your wallet?');
      }

      const key = response.keys[0];
      if (!key.address || !key.publicKey) {
        throw new Error('Invalid key data received from wallet');
      }

      this.#account = new LeapWalletSolanaAccount({
        address: key.address,
        publicKey: new Uint8Array(new PublicKey(key.address).toBytes()),
        label: 'Leap Wallet',
        icon: this.#icon,
        network: 'solana:mainnet',
        provider: networkProviders['solana:mainnet']?.provider,
        genesisHash: networkProviders['solana:mainnet']?.genesisHash,
      });

      this.#emit('change', { accounts: this.accounts });

      return { accounts: this.accounts };
    } catch (e) {
      console.error('Wallet connection error:', e);
      this.#account = null;
      throw new Error(e instanceof Error ? e.message : 'Failed to connect to wallet');
    }
  };

  disconnect: StandardDisconnectMethod = async () => {
    try {
      await this.requestWrapper(SOLANA_METHOD_TYPE.DISCONNECT);

      if (this.#account) {
        this.#account = null;

        this.#emit('change', { accounts: this.accounts });
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  };

  signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
    try {
      if (!this.#account) throw new Error('not connected');

      const outputs: SolanaSignAndSendTransactionOutput[] = [];

      if (inputs.length === 1) {
        const { transaction, account, chain, options } = inputs[0]!;
        if (account !== this.#account) throw new Error('invalid account');

        const txBase64 = Buffer.from(transaction).toString('base64');
        const chainId = chain || 'solana:mainnet';

        const msg = new RequestSignSolanaMsg(chainId, account.address, txBase64, true, false, {
          sendOptions: options,
        });
        msg.validateBasic();

        const signResponse = await this.requestWrapper(SOLANA_METHOD_TYPE.SIGN_TRANSACTION, msg);
        const signature = base58.decode(signResponse);
        outputs.push({ signature });
      } else if (inputs.length > 1) {
        for (const input of inputs) {
          outputs.push(...(await this.signAndSendTransaction(input)));
        }
      }

      return outputs;
    } catch (e) {
      console.error('Error signing and sending transaction:', e);
      throw e;
    }
  };

  signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
    try {
      if (!this.#account) throw new Error('not connected');

      const outputs: SolanaSignTransactionOutput[] = [];

      if (inputs.length === 1) {
        const { transaction, account, chain } = inputs[0]!;

        if (account !== this.#account) throw new Error('invalid account');

        const txBase64 = Buffer.from(transaction).toString('base64');
        const chainId = chain || 'solana:mainnet';

        const msg = new RequestSignSolanaMsg(chainId, account.address, txBase64, false, false, {});
        msg.validateBasic();

        const signResponse = await this.requestWrapper(SOLANA_METHOD_TYPE.SIGN_TRANSACTION, msg);
        const transactionBytes = base58.decode(signResponse);
        outputs.push({ signedTransaction: transactionBytes });
      } else if (inputs.length > 1) {
        for (const input of inputs) {
          outputs.push(...(await this.signTransaction(input)));
        }
      }

      return outputs;
    } catch (e) {
      console.error('Error signing transaction:', e);
      throw e;
    }
  };

  signMessage: SolanaSignMessageMethod = async (...inputs) => {
    try {
      if (!this.#account) throw new Error('not connected');

      const outputs: SolanaSignMessageOutput[] = [];

      if (inputs.length === 1) {
        const { message, account } = inputs[0]!;

        if (account !== this.#account) throw new Error('invalid account');

        const chainId = 'solana:mainnet';

        const msg = new RequestSignSolanaMsg(
          chainId,
          account.address,
          Buffer.from(message).toString('utf8'),
          false,
          true,
          {},
        );
        msg.validateBasic();

        const signResponse = await this.requestWrapper(SOLANA_METHOD_TYPE.SIGN_TRANSACTION, msg);

        const signature = base58.decode(signResponse.signedTxData);

        outputs.push({
          signedMessage: message,
          signature: new Uint8Array(signature),
        });
      } else if (inputs.length > 1) {
        for (const input of inputs) {
          outputs.push(...(await this.signMessage(input)));
        }
      }

      return outputs;
    } catch (e) {
      console.error('Error signing message:', e);
      throw e;
    }
  };

  signIn: SolanaSignInMethod = async (...inputs) => {
    try {
      const outputs: SolanaSignInOutput[] = [];

      if (inputs.length === 1) {
        const {
          domain,
          statement,
          uri,
          version,
          chainId,
          nonce,
          issuedAt,
          expirationTime,
          notBefore,
          requestId,
          resources,
        } = inputs[0]!;

        const activeAddress = this.#account?.address;

        let signInMessage = `${domain} wants you to sign in with your Solana account:\nSIGNINMESSAGESOLANA`;

        if (statement) {
          signInMessage += `\n\n${statement}`;
        }

        const advancedFields = [];
        if (uri) advancedFields.push(`URI: ${uri}`);
        if (version) advancedFields.push(`Version: ${version}`);
        if (chainId) advancedFields.push(`Chain ID: ${chainId}`);
        if (nonce) advancedFields.push(`Nonce: ${nonce}`);
        if (issuedAt) advancedFields.push(`Issued At: ${issuedAt}`);
        if (expirationTime) advancedFields.push(`Expiration Time: ${expirationTime}`);
        if (notBefore) advancedFields.push(`Not Before: ${notBefore}`);
        if (requestId) advancedFields.push(`Request ID: ${requestId}`);

        if (resources && resources.length > 0) {
          advancedFields.push(`Resources:`);
          for (const resource of resources) {
            advancedFields.push(`- ${resource}`);
          }
        }

        if (advancedFields.length > 0) {
          signInMessage += `\n\n${advancedFields.join('\n')}`;
        }

        const msg = new RequestSignSolanaMsg(
          chainId || 'solana:mainnet',
          activeAddress || 'SIGNINMESSAGESOLANA',
          Buffer.from(signInMessage).toString('utf8'),
          false,
          true,
          {},
        );
        msg.validateBasic();

        const signResponse = await this.requestWrapper(SOLANA_METHOD_TYPE.SIGN_TRANSACTION, msg);

        let signature;
        if (typeof signResponse === 'string') {
          signature = base58.decode(signResponse);
        } else if (signResponse.signedTxData) {
          signature = base58.decode(signResponse.signedTxData);
        } else {
          throw new Error('Invalid signature response format');
        }

        if (!signature || !signature.length) {
          throw new Error('Failed to sign message');
        }

        const walletAddress = signResponse.activeAddress || activeAddress;

        signInMessage = signInMessage.replace('SIGNINMESSAGESOLANA', walletAddress);

        const walletAccount = new LeapWalletSolanaAccount({
          address: walletAddress,
          publicKey: new Uint8Array(new PublicKey(walletAddress).toBytes()),
          label: 'Leap Wallet',
          icon: this.#icon,
          network: chainId || 'solana:mainnet',
          provider: networkProviders[(chainId as keyof typeof networkProviders) || 'solana:mainnet']?.provider,
          genesisHash: networkProviders[(chainId as keyof typeof networkProviders) || 'solana:mainnet']?.genesisHash,
        });

        this.#account = walletAccount;
        this.#emit('change', { accounts: this.accounts });

        outputs.push({
          account: walletAccount,
          signedMessage: new Uint8Array(Buffer.from(signInMessage, 'utf8')),
          signature: new Uint8Array(signature),
        });
      } else if (inputs.length > 1) {
        for (const input of inputs) {
          outputs.push(...(await this.signIn(input)));
        }
      }

      return outputs;
    } catch (e) {
      console.error('Error signing in:', e);
      throw e;
    }
  };

  changeNetwork = async ({
    genesisHash,
    url,
  }: {
    genesisHash: string;
    url?: string;
  }): Promise<{ status: UserResponseStatus; args?: { success: boolean; chainId?: string } }> => {
    try {
      if (!this.#account) {
        return {
          status: UserResponseStatus.REJECTED,
        };
      }

      if (this.#account.genesisHash === genesisHash) {
        return {
          status: UserResponseStatus.APPROVED,
          args: {
            success: true,
            chainId: genesisHashes[genesisHash as keyof typeof genesisHashes]?.chainId,
          },
        };
      }

      const network = genesisHashes[genesisHash as keyof typeof genesisHashes];
      const existingNetwork = genesisHashes[this.#account.genesisHash as keyof typeof genesisHashes];
      if (!network) {
        throw new Error('Chain not supported');
      }

      const response = await this.requestWrapper(SOLANA_METHOD_TYPE.CHANGE_NETWORK, {
        network: network.chainId,
        url: existingNetwork.chainId,
      });
      if (!response.success) {
        throw new Error('Failed to switch network');
      }

      this.#account = new LeapWalletSolanaAccount({
        address: this.#account.address,
        publicKey: this.#account.publicKey,
        label: this.#account.label,
        icon: this.#account.icon,
        network: network.network,
        provider: network.provider,
        genesisHash,
      });

      this.#emit('change', { accounts: this.accounts });

      return {
        status: UserResponseStatus.APPROVED,
        args: {
          success: true,
          chainId: network.network,
        },
      };
    } catch (e) {
      console.error('Error changing network:', e);
      return {
        status: UserResponseStatus.REJECTED,
      };
    }
  };
}
