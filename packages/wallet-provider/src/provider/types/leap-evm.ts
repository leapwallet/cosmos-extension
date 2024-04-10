import {
  EthRequestAccounts,
  EthSendTransaction,
  EthSign,
  EthSignTypedData,
  PersonalSign,
  ValueOf,
  WalletRequestPermissions,
} from './ethereum';

export const ETHEREUM_LISTENER_TYPE = {
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
};
export type EthereumListenerType = ValueOf<typeof ETHEREUM_LISTENER_TYPE>;

export const LINE_TYPE = { ETHEREUM: 'ETHEREUM' };
export type LineType = ValueOf<typeof LINE_TYPE>;
export type EthereumRequestMessage =
  | EthRequestAccounts
  | EthSendTransaction
  | EthSign
  | EthSignTypedData
  | PersonalSign
  | WalletRequestPermissions;

export interface Ethereum {
  request: (message: EthereumRequestMessage) => Promise<unknown>;
  enable: () => Promise<unknown>;
  isMetaMask?: boolean;
  isCompass: boolean;
  chainId?: string;
  networkVersion?: string;
}
