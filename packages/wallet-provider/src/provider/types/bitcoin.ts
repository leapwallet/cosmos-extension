import { SUPPORTED_METHODS } from '../messaging/requester';

export enum BITCOIN_METHOD_TYPE {
  CONNECT_WALLET = 'connect-wallet',
  GET_ADDRESS = 'get-address',
  GET_ACCOUNTS = 'get-accounts',
  GET_NETWORK = 'get-network',
  GET_PUBLIC_KEY = 'get-public-key',
  REQUEST_ACCOUNTS = 'request-accounts',
  SEND_BITCOIN = 'send-bitcoin',
  SIGN_MESSAGE = 'sign-message',
  SIGN_PSBT = 'sign-psbt',
  SIGN_PSBTS = 'sign-psbts',
  SWITCH_NETWORK = 'switch-network',
  OPEN_SIDE_PANEL = SUPPORTED_METHODS.OPEN_SIDE_PANEL,
}
