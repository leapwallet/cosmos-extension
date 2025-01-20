import { Provider, ProvidersResponse } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/utils/classes';
import axios from 'axios';

import { SelectedNetwork } from './get-staking-selected-network';

export type GetProvidersReturn = {
  providers: Provider[];
};

const MAINNET_BASE_URL = 'https://jsinfo.mainnet.lavanet.xyz/listProviders';
const TESTNET_BASE_URL = 'https://jsinfo.lavanet.xyz/listProviders';

export async function getProviders(selectedNetwork: SelectedNetwork): Promise<GetProvidersReturn> {
  const res = await axios.get(selectedNetwork === 'mainnet' ? MAINNET_BASE_URL : TESTNET_BASE_URL, {
    timeout: 60000,
  });

  const {
    data: { providers: providers_response },
  } = res.data as ProvidersResponse;

  const providers: Provider[] = providers_response.map((providerObj) => {
    return {
      provider: providerObj.provider,
      address: providerObj.provider,
      moniker: providerObj.specs[0].moniker,
      image: undefined,
      delegateCommission: providerObj.specs[0].delegateCommission,
      delegateTotal: providerObj.specs
        .map((item) => item.delegateTotal)
        .reduce((acc, val) => acc.plus(new BigNumber(val ?? '0')), new BigNumber(0))
        .toString(),
      specs: providerObj.specs.map((item) => item.spec),
      stakestatus: providerObj.specs.some((item) => item.stakestatus === 'Active') ? 'Active' : 'Inactive',
    };
  });

  return {
    providers,
  };
}
