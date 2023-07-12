import { ChainsList } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { useCallback } from 'react';

import { useSelectedNetwork } from '../store';

export function useChainsRegistry() {
  const selectedNetwork = useSelectedNetwork();
  const { data, status } = useQuery<any, unknown, AxiosResponse<ChainsList>>(['chains-registry', selectedNetwork], () =>
    axios.get(
      selectedNetwork === 'testnet' ? 'https://chains.testcosmos.directory' : 'https://chains.cosmos.directory',
    ),
  );

  const getChainInfoById = useCallback(
    (chainId: string) => {
      if (status === 'success') {
        const chainsList = data.data.chains;
        return chainsList?.find((chain: { chain_id: string }) => chain.chain_id === chainId);
      } else {
        return null;
      }
    },
    [data],
  );

  const getChainInfoByName = useCallback(
    (chainName: string) => {
      if (status === 'success') {
        const chainsList = data.data.chains;
        return chainsList?.find((chain: { name: string }) => chain.name === chainName);
      } else {
        return null;
      }
    },
    [data],
  );

  return { getChainInfoById, getChainInfoByName, status };
}
