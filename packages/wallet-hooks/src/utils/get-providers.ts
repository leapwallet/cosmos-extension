import { axiosWrapper, Provider, ProvidersResponse } from '@leapwallet/cosmos-wallet-sdk';
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

  const providers: Provider[] = providers_response.flatMap((providerObj) =>
    providerObj.specs.map((spec) => ({
      provider: providerObj.provider,
      address: providerObj.provider,
      moniker: spec.moniker,
      spec: spec.spec,
      chain: spec.chain,
      image: undefined,
    })),
  );

  return {
    providers,
  };
}
