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

import { LeapFaviconDataURI } from '../utils';
import { LINE_TYPE, RequestSignSolanaMsg } from './types';
import { bytesEqual, genesisHashes, networkProviders, SOLANA_CHAINS, SOLANA_METHOD_TYPE } from './types/solana';

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
  readonly #icon = LeapFaviconDataURI;
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
              if (result?.name === 'invokeOpenSidePanel') {
                this.send(SOLANA_METHOD_TYPE.OPEN_SIDE_PANEL, result);
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
