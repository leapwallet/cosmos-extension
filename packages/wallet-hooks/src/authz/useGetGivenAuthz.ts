import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useAddress, useChainApis } from '../store';

export function useGetGivenAuthz(chain: SupportedChain, network?: 'mainnet' | 'testnet') {
  const { lcdUrl } = useChainApis(chain, network);
  const address = useAddress(chain);

  return useQuery(['get-given-authz-query', chain, lcdUrl, address], async function () {
    const url = `${lcdUrl}/cosmos/authz/v1beta1/grants/granter/${address}?pagination.limit=1000`;
    const { data } = await axios.get(url);

    return data.grants;
  });
}
