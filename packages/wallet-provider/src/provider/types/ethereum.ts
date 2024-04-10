export const ETHEREUM_POPUP_METHOD_TYPE = {
  ETH__REQUEST_ACCOUNTS: 'eth_requestAccounts',
  ETH__SEND_TRANSACTION: 'eth_sendTransaction',
  ETH__SIGN: 'eth_sign',
  ETH__SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',

  PERSONAL_SIGN: 'personal_sign',
  WALLET__REQUEST_PERMISSIONS: 'wallet_requestPermissions',
};

export const ETHEREUM_NO_POPUP_METHOD_TYPE = {
  ETH__ACCOUNTS: 'eth_accounts',
  ETH__CHAIN_ID: 'eth_chainId',
};

export type ValueOf<T> = T[keyof T];
export type EthereumPopupMethodType = ValueOf<typeof ETHEREUM_POPUP_METHOD_TYPE>;
export type EthereumNoPopupMethodType = ValueOf<typeof ETHEREUM_NO_POPUP_METHOD_TYPE>;

export const ETHEREUM_METHOD_TYPE = {
  ...ETHEREUM_NO_POPUP_METHOD_TYPE,
  ...ETHEREUM_POPUP_METHOD_TYPE,
};
export type EthRequestAccountsResponse = string[];

export type EthereumTx = {
  value?: string | number;
  gasPrice?: string | number;
  maxPriorityFeePerGas?: string | number;
  maxFeePerGas?: string | number;
  from?: string | number;
  to?: string;
  gas?: number | string;
  data?: string;
  nonce?: number;
  v?: string | number;
  r?: string | number;
  s?: string | number;
};

export type EthRequestAccounts = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS;
  params: unknown;
  id?: number | string;
};

export type EthSendTransactionParams = [EthereumTx];

export type EthSendTransaction = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SEND_TRANSACTION;
  params: EthSendTransactionParams;
  id?: number | string;
};

export type EthSign = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SIGN;
  /**
   * [0] - Address
   * [1] - Hex-encoded UTF-8 message
   */
  params: [string, string];
  id?: number | string;
};

export type EthSignTypedData = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4;
  params: [string, string];
  id?: number | string;
};

export type PersonalSign = {
  method: typeof ETHEREUM_METHOD_TYPE.PERSONAL_SIGN;
  /**
   * [0] - Hex-encoded UTF-8 message
   * [1] - Address
   */
  params: [string, string];
  id?: number | string;
};

export type WalletRequestPermissions = {
  method: typeof ETHEREUM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS;
  params: unknown;
  id?: number | string;
};

export const ETHEREUM_RPC_ERROR = {
  USER_REJECTED_REQUEST: 4001,
  INVALID_PARAMS: -32602,
  INTERNAL: -32603,
};

export const ETHEREUM_RPC_ERROR_MESSAGE = {
  [ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST]: 'User rejected the request.',
  [ETHEREUM_RPC_ERROR.INVALID_PARAMS]: 'Invalid method parameter(s).',
};
