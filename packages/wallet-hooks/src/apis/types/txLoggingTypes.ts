export type Token = {
  amount?: number | string;
  denom?: string;
};

export type NFTToken = {
  collectionId: number | string;
  tokenId: string | number;
};

export type SendTransaction = {
  toAddress?: string;
  token?: Token;
  appVersion?: string;
};

export type NFTSendTransaction = {
  toAddress: string;
  token: NFTToken;
  appVersion?: string;
};

export type IBCSendTransaction = {
  sourceChannel?: string;
  toChain?: string;
  toAddress?: string;
  token?: Token;
  appVersion?: string;
};

export type SwapTransaction = {
  liquidityPool?: string;
  dexName?: string;
  fromToken?: Token;
  toToken?: Token;
  msgType?: string;
  provider?: string;
  hops?: number;
  fromChain?: string;
  toChain?: string;
};

export type GovVoteTransaction = {
  option?: number;
  proposalId?: number;
  appVersion?: string;
};

export type StakeDelegateTransaction = {
  validatorAddress?: string;
  token?: Token;
  appVersion?: string;
};

export type StakeCancelUndelegateTransaction = {
  validatorAddress?: string;
  token?: Token;
  appVersion?: string;
};

export type StakeUndelegateTransaction = {
  validatorAddress?: string;
  token?: Token;
  appVersion?: string;
};

export type StakeRedelegateTransaction = {
  fromValidator?: string;
  toValidator?: string;
  token?: Token;
  appVersion?: string;
};

export type StakeClaimTransaction = {
  validators?: string[];
  token?: Token;
  appVersion?: string;
};

export type SecretTokenTransaction = {
  contract?: string;
  appVersion?: string;
};

export type AuthzRevokeTransaction = {
  grantee?: string;
  type?: string[];
  appVersion?: string;
};

export type AuthzGrantTransaction = {
  grantee?: string;
  type?: string[];
  appVersion?: string;
};

export type LsStakeTransaction = {
  provider?: string;
  hostChain?: string;
  amount?: string;
  conversionRate?: string;
  receiverAddress?: string;
  appVersion?: string;
};

export type LsUnstakeTransaction = {
  provider?: string;
  hostChain?: string;
  amount?: string;
  conversionRate?: string;
  receiverAddress?: string;
  appVersion?: string;
};

export type IBCSwapTransaction = {
  mappingId: string;
  msgType: string;
  provider: string;
  hops: number;
  fromChain: string;
  toChain: string;
  fromToken: {
    amount: string;
    denom: string;
  };
  toToken: {
    amount: string;
    denom: string;
  };
  appVersion: string;
};

export enum DAPP_SOURCE {
  //The field present later eg. 'in_app_browser' will be logged
  IN_APP_BROWSER = 'in_app_browser',
  MOBILE_BROWSER = 'mobile_browser',
  DESKTOP_BROWSER = 'desktop_browser',
}

export type DappTransaction = {
  toAddress?: string;
  /**
   * [Dashboard] `browser`: appears for all dashboard transactions only.
   * Format: `<platform>_<browser_name>` (platform = desktop, mobile, tablet, etc + browser_name = chrome, brave, firefox)
   * Kiwi browser transactions on mobile are logged as `chrome` so we cannot distinguish it.
   * eg: `desktop_chrome`
   */
  browser?: string;

  /**
   * [Extension, Mobile Apps] `dapp_url`: applies for all dApp transactions (formerly known as `source`)
   * values here will be URLs
   * modify url so avoid duplications (eg: <seaswap>)
   */
  dapp_url?: string;

  /**
   * [Mobile Apps] `dapp_source`: applies only for mobile apps where dApp transactions are made
   * `in_app_browser` (this is browser within Leap mobile app), `mobile_browser`, `desktop_browser`
   */
  dapp_source?: DAPP_SOURCE;

  /**
   * [Extension, Mobile Apps] `tx_message`: applies for all dApp transactions
   * The json object received from the dApp is put as a value here as is with no modifications
   */
  tx_message?: object;

  /**
   * [Dashboard] `wallet_client`: directly coming in from cosmos kit. appears for all dashboard transactions.
   * eg: `keplr_extension`, `leap_extension`, `keplr_mobile`, `cosmostation_extension`, `leap_cosmos_mobile`
   * cosmos kit sends it in a different format (eg: `keplr-extension`). This needs to be modified to snake case and sent to the database while logging.
   */
  wallet_client?:
    | string
    | 'keplr_extension'
    | 'leap_extension'
    | 'keplr_mobile'
    | 'cosmostation_extension'
    | 'leap_cosmos_mobile';
};

export type TransactionMetadata =
  | SendTransaction
  | IBCSendTransaction
  | IBCSwapTransaction
  | SwapTransaction
  | GovVoteTransaction
  | StakeDelegateTransaction
  | StakeUndelegateTransaction
  | StakeRedelegateTransaction
  | StakeClaimTransaction
  | DappTransaction
  | SecretTokenTransaction
  | AuthzRevokeTransaction
  | AuthzGrantTransaction
  | LsStakeTransaction
  | LsUnstakeTransaction
  | NFTSendTransaction;
