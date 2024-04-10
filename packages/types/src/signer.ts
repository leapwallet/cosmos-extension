export type StdFee = {
  amount: Array<{ denom: string; amount: string }>;
  gas: string;
  granter?: string;
  payer?: string;
};

export type AminoMsg = {
  type: string;
  value: any;
};

export type StdSignDoc = {
  chain_id: string;
  account_number: string;
  sequence: string;
  fee: StdFee;
  msgs: readonly AminoMsg[];
  memo: string;
  timeout_height?: string;
};

export type AccountData = {
  address: string;
  algo: string;
  pubkey: Uint8Array;
};

export type AminoSignResponse = {
  signed: StdSignDoc;
  signature: StdSignature;
};

export type OfflineAminoSigner = {
  getAccounts: () => Promise<readonly AccountData[]>;
  signAmino: (signerAddress: string, signDoc: StdSignDoc) => Promise<AminoSignResponse>;
};

export type OfflineDirectSigner = {
  getAccounts: () => Promise<readonly AccountData[]>;
  signDirect: (signerAddress: string, signDoc: SignDoc) => Promise<DirectSignResponse>;
};

export type Pubkey = {
  type: string;
  value: string;
};

export type StdSignature = {
  pub_key: Pubkey;
  signature: string;
};

export type SignDoc = {
  bodyBytes: Uint8Array;
  authInfoBytes: Uint8Array;
  chainId: string;
  accountNumber: Long;
};

export type DirectSignResponse = {
  signed: SignDoc;
  signature: StdSignature;
};
