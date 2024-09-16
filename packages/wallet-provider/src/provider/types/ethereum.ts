export const ETHEREUM_POPUP_METHOD_TYPE = {
  ETH__REQUEST_ACCOUNTS: 'eth_requestAccounts',
  ETH__SEND_TRANSACTION: 'eth_sendTransaction',
  ETH__SIGN: 'eth_sign',
  ETH__SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',

  PERSONAL_SIGN: 'personal_sign',
  WALLET__REQUEST_PERMISSIONS: 'wallet_requestPermissions',
  WALLET__WATCH_ASSET: 'wallet_watchAsset',
  WALLET__SWITCH_ETHEREUM_CHAIN: 'wallet_switchEthereumChain',
  WALLET__ADD_ETHEREUM_CHAIN: 'wallet_addEthereumChain',
};

export const ETHEREUM_NO_POPUP_METHOD_TYPE = {
  ETH__ACCOUNTS: 'eth_accounts',
  ETH__CHAIN_ID: 'eth_chainId',
  ETH__CALL: 'eth_call',
  ETH__GET_BALANCE: 'eth_getBalance',
  ETH__BLOCK_NUMBER: 'eth_blockNumber',
  ETH__ESTIMATE_GAS: 'eth_estimateGas',
  ETH__GAS_PRICE: 'eth_gasPrice',

  ETH__GET_BLOCK_BY_NUMBER: 'eth_getBlockByNumber',
  WALLET__REVOKE_PERMISSIONS: 'wallet_revokePermissions',
  ETH__GET_TRANSACTION_RECEIPT: 'eth_getTransactionReceipt',
  ETH__GET_TRANSACTION_BY_HASH: 'eth_getTransactionByHash',
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

export type WalletWatchAssetParams = {
  type: string;
  options: {
    address: string;
    symbol: string;
    decimals: number;
    image?: string;
    coinGeckoId?: string;
  };
};

export type WalletWatchAsset = {
  method: typeof ETHEREUM_METHOD_TYPE.WALLET__WATCH_ASSET;
  params: WalletWatchAssetParams;
};

export type WalletSwitchEthereumChainParams = {
  chainId: string;
};

export type WalletSwitchEthereumChain = {
  method: typeof ETHEREUM_METHOD_TYPE.WALLET__SWITCH_ETHEREUM_CHAIN;
  params: [WalletSwitchEthereumChainParams];
};

export type WalletAddEthereumChainParams = {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name?: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
};

export type WalletAddEthereumChain = {
  method: typeof ETHEREUM_METHOD_TYPE.WALLET__ADD_ETHEREUM_CHAIN;
  params: [WalletAddEthereumChainParams];
};

export const ETHEREUM_RPC_ERROR = {
  USER_REJECTED_REQUEST: 4001,
  INVALID_PARAMS: -32602,
  INTERNAL: -32603,

  UNRECOGNIZED_CHAIN_ID: 4902,
};

export const ETHEREUM_RPC_ERROR_MESSAGE = {
  [ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST]: 'User rejected the request.',
  [ETHEREUM_RPC_ERROR.INVALID_PARAMS]: 'Invalid method parameter(s).',
};
