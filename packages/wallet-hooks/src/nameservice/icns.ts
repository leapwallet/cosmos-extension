import { useQuery } from '@tanstack/react-query';

import { useChainApis } from '../store';
import { useCosmWasmClient } from '../utils/useCosmWasmClient';

const ICNSContractAddress: Record<'mainnet' | 'testnet', string> = {
  mainnet: 'osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd',
  testnet: 'osmo1q2qpencrnnlamwalxt6tac2ytl35z5jejn0v4frnp6jff7gwp37sjcnhu5',
};

export const useICNSResolver = (queryAddress: string, currentNetwork: 'mainnet' | 'testnet') => {
  const { rpcUrl } = useChainApis('osmosis');

  if (!rpcUrl) {
    throw new Error('useICNSResolver: undefined rpcUrl for osmosis' + ' ' + currentNetwork);
  }

  const { client, status: clientStatus } = useCosmWasmClient(rpcUrl);

  const { data, error, status } = useQuery({
    queryKey: ['icns-resolution', queryAddress],
    queryFn: async () => {
      const [name, bech32_prefix] = queryAddress.split('.');
      const res = await client?.queryContractSmart(ICNSContractAddress[currentNetwork], {
        address: {
          name,
          bech32_prefix,
        },
      });
      if (!res?.address) {
        throw new Error('not found');
      }
      return res.address;
    },
    retry: (_, err) => {
      return !(err as Error).message.includes('not found');
    },
    enabled: clientStatus === 'success' && client !== undefined && queryAddress !== '',
    networkMode: 'always',
  });

  return { data, error, status } as const;
};
