export interface AccountsResponse {
  accounts: {
    '@type': string;
    code_hash: string;
    base_account: {
      address: string;
      account_number: string;
      sequence: string;
      pub_key: {
        '@type': string;
        key: string;
      };
    };
  }[];
  pagination: {
    nextKey?: string;
    total: string;
  };
}

export interface AccountResponse {
  account: {
    '@type': string;
    code_hash: string;
    base_account: {
      address: string;
      account_number: string;
      sequence: string;
      pub_key: {
        '@type': string;
        key: string;
      };
    };
  };
}

export interface CosmosAccountRestResponse {
  account: {
    address: string;
    account_number: string;
    sequence: string;
    pub_key: {
      '@type': string;
      key: string;
    };
  };
}

export interface BaseAccountRestResponse {
  address: string;
  account_number: string;
  sequence: string;
  pub_key: {
    '@type': string;
    key: string;
  };
}
