import axios from 'axios';
export interface AccountRestResponse {
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

export interface InjectiveAccountRestResponse {
  account: {
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

export interface AccountDetails {
  address: string;
  accountNumber: string;
  sequence: string;
  type: string;
  pubKey: {
    type: string;
    key: string;
  };
}

/**
 * This function is used to fetch the account details for a given address
 *
 * @param lcdEndpoint - The lcd endpoint for the chain
 * @param address - The address of the account whose details are being fetched
 * @returns AccountDetails - The account details for the given address
 * */

export async function fetchAccountDetails(lcdEndpoint: string, address: string, retry = 3): Promise<AccountDetails> {
  try {
    /**
     * Injective has different response than the rest of the
     * cosmos chains when querying the auth account endpoint
     * */

    const { data } = await axios.get(`${lcdEndpoint}/cosmos/auth/v1beta1/accounts/${address}`);
    const baseAccount = data.account.base_account
      ? (data as InjectiveAccountRestResponse).account.base_account
      : (data as AccountRestResponse).account;
    return {
      address: baseAccount.address,
      accountNumber: baseAccount.account_number,
      sequence: baseAccount.sequence,
      pubKey: {
        type: baseAccount.pub_key ? baseAccount.pub_key['@type'] : '',
        key: baseAccount.pub_key ? baseAccount.pub_key.key : '',
      },
    } as AccountDetails;
  } catch (e) {
    if (retry > 0) {
      return fetchAccountDetails(lcdEndpoint, address, retry - 1);
    }
    throw new Error((e as any).message);
  }
}
