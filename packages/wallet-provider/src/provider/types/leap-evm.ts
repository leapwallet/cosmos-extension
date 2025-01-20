import {
  EthRequestAccounts,
  EthSendTransaction,
  EthSign,
  EthSignTypedData,
  PersonalSign,
  ValueOf,
  WalletAddEthereumChain,
  WalletRequestPermissions,
  WalletSwitchEthereumChain,
  WalletWatchAsset,
} from './ethereum';

export const ETHEREUM_LISTENER_TYPE = {
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
};
export type EthereumListenerType = ValueOf<typeof ETHEREUM_LISTENER_TYPE>;

export const LINE_TYPE = {
  APTOS: 'APTOS',
  ETHEREUM: 'ETHEREUM',
  BITCOIN: 'BITCOIN',
};

export type LineType = ValueOf<typeof LINE_TYPE>;
export type EthereumRequestMessage =
  | EthRequestAccounts
  | EthSendTransaction
  | EthSign
  | EthSignTypedData
  | PersonalSign
  | WalletRequestPermissions
  | WalletWatchAsset
  | WalletSwitchEthereumChain
  | WalletAddEthereumChain;

export interface Ethereum {
  request: (message: EthereumRequestMessage) => Promise<unknown>;
  enable: () => Promise<unknown>;
  isMetaMask?: boolean;
  isCompass: boolean;
  chainId?: string;
  networkVersion?: string;
  on: (eventName: EthereumListenerType, eventHandler: (data: unknown) => void) => void;
  removeListener: (eventName: EthereumListenerType, eventHandler: (data: unknown) => void) => void;
  removeAllListeners: () => void;
}
