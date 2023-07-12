import { addressPrefixes } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import bech32 from 'bech32';

import { useChainApis } from '../store';
import { useCosmWasmClient } from '../utils/useCosmWasmClient';

const ibcDomainContractAddress: Record<'mainnet' | 'testnet', string> = {
  mainnet: 'juno1ce7wjfsuk79t2mdvpdjtv8280pcc64yh9mh62qptuvxe64twt4pqa68z2a',
  testnet: 'juno19al2ptpxz3xk6q8nl3eyvyslkz8g6nz25w48dfpaepwaxavq3mhqsjjqe5',
};

export const useIBCDomainsResolver = (queryAddress: string, currentNetwork: 'mainnet' | 'testnet') => {
  const { rpcUrl } = useChainApis('juno');

  if (!rpcUrl) {
    throw new Error('useIBCDomainsResolver: undefined rpcUrl for juno' + ' ' + currentNetwork);
  }

  const { client, status: clientStatus } = useCosmWasmClient(rpcUrl);

  const { data, status, error } = useQuery({
    queryKey: ['ibc-domain-resolution', queryAddress],
    queryFn: async () => {
      const [username, bech32_prefix] = queryAddress.split('.');
      const res = await client?.queryContractSmart(ibcDomainContractAddress[currentNetwork], {
        owner_of: {
          token_id: username,
        },
      });
      if (!res?.owner || !addressPrefixes[bech32_prefix]) {
        throw new Error('not found');
      }
      try {
        const { words } = bech32.decode(res.owner);
        return bech32.encode(bech32_prefix, words);
      } catch {
        throw new Error('not found');
      }
    },
    enabled: clientStatus === 'success' && client !== undefined && queryAddress !== '',
    retry: (_, err) => {
      return !(err as Error).message.includes('not found');
    },
  });

  return { data, status, error } as const;
};
