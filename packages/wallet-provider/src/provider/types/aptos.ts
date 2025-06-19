import { SUPPORTED_METHODS } from '../messaging/requester';

export enum APTOS_METHOD_TYPE {
  DISCONNECT = SUPPORTED_METHODS.DISCONNECT,
  GET_KEYS = SUPPORTED_METHODS.GET_KEYS,
  GET_NETWORK = 'get-network',
  SIGN_TRANSACTION = 'sign-transaction',
  SWITCH_NETWORK = 'switch-chain',
  SIGN_MESSAGE = 'sign-message',
  OPEN_SIDE_PANEL = SUPPORTED_METHODS.OPEN_SIDE_PANEL,
}
