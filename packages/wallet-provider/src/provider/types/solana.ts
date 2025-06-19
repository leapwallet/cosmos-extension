import { IdentifierString } from '@aptos-labs/wallet-standard';
import { type SolanaSignInInput, type SolanaSignInOutput } from '@solana/wallet-standard-features';
import type { PublicKey, SendOptions, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';

export enum SOLANA_METHOD_TYPE {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  SIGN_TRANSACTION = 'sign-transaction',
  SIGN_MESSAGE = 'sign-message',
  SIGN_AND_SEND_TRANSACTION = 'sign-and-send-transaction',
  CHANGE_NETWORK = 'change-network',
}

export interface LeapSolanaEvent {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
  accountChanged(...args: unknown[]): unknown;
}

export interface LeapSolanaEventEmitter {
  on<E extends keyof LeapSolanaEvent>(event: E, listener: LeapSolanaEvent[E], context?: any): void;
  off<E extends keyof LeapSolanaEvent>(event: E, listener: LeapSolanaEvent[E], context?: any): void;
}

export interface LeapSolanaInterface extends LeapSolanaEventEmitter {
  publicKey: PublicKey | null;
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions,
  ): Promise<{ signature: TransactionSignature }>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput>;
}

export const SOLANA_MAINNET_CHAIN = 'solana:mainnet';

export const SOLANA_DEVNET_CHAIN = 'solana:devnet';

export const SOLANA_TESTNET_CHAIN = 'solana:testnet';

export const SOLANA_LOCALNET_CHAIN = 'solana:localnet';

export const SOLANA_CHAINS = [
  SOLANA_MAINNET_CHAIN,
  SOLANA_DEVNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
  SOLANA_LOCALNET_CHAIN,
] as const;

export type SolanaChain = typeof SOLANA_CHAINS[number];

export function isSolanaChain(chain: IdentifierString): chain is SolanaChain {
  return SOLANA_CHAINS.includes(chain as SolanaChain);
}

export function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction,
): transaction is VersionedTransaction {
  return 'version' in transaction;
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return arraysEqual(a, b);
}

interface Indexed<T> {
  length: number;
  [index: number]: T;
}

export function arraysEqual<T>(a: Indexed<T>, b: Indexed<T>): boolean {
  if (a === b) return true;

  const length = a.length;
  if (length !== b.length) return false;

  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

export const genesisHashes = {
  '9GGSFo95raqzZxWqKM5tGYvJp5iv4Dm565S4r8h5PEu9': {
    network: 'FOGO',
    provider: 'https://testnet.fogo.io',
    chainId: 'fogo-1',
  },
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d': {
    network: 'solana:mainnet',
    provider: 'https://api.mainnet-beta.solana.com',
    chainId: '101',
  },
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG: {
    network: 'solana:devnet',
    provider: 'https://api.devnet.solana.com',
    chainId: '103',
  },
  '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY': {
    network: 'solana:testnet',
    provider: 'https://api.testnet.solana.com',
    chainId: '102',
  },
};

export const networkProviders = {
  'solana:mainnet': {
    genesisHash: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
    provider: 'https://api.mainnet-beta.solana.com',
  },
  'solana:devnet': {
    genesisHash: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG',
    provider: 'https://api.devnet.solana.com',
  },
  'solana:testnet': {
    genesisHash: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY',
    provider: 'https://api.testnet.solana.com',
  },
};
