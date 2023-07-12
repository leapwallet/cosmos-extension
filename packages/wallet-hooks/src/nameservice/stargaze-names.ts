import { addressPrefixes } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import bech32 from 'bech32';

import { useChainApis } from '../store';
import { useCosmWasmClient } from '../utils/useCosmWasmClient';

const stargazeNamesContract: Record<'mainnet' | 'testnet', string> = {
  mainnet: 'stars1fx74nkqkw2748av8j7ew7r3xt9cgjqduwn8m0ur5lhe49uhlsasszc5fhr',
  testnet: 'stars1rp5ttjvd5g0vlpltrkyvq62tcrdz949gjtpah000ynh4n2laz52qarz2z8',
};

export const useStargazeNamesResolver = (queryAddress: string, currentNetwork: 'mainnet' | 'testnet') => {
  const { rpcUrl } = useChainApis('stargaze');

  if (!rpcUrl) {
    throw new Error('useStargazeNamesResolver: undefined rpcUrl for stargaze' + ' ' + currentNetwork);
  }

  const { client, status: clientStatus } = useCosmWasmClient(rpcUrl);

  const { data, error, status } = useQuery({
    queryKey: ['stargaze-name-resolution', queryAddress],
    queryFn: async () => {
      const [username, bech32_prefix] = queryAddress.split('.');
      const res = await client?.queryContractSmart(stargazeNamesContract[currentNetwork], {
        nft_info: {
          token_id: username,
        },
      });
      if (!res?.token_uri || !addressPrefixes[bech32_prefix]) {
        throw new Error('not found');
      }
      try {
        const { words } = bech32.decode(res.token_uri);
        return bech32.encode(bech32_prefix, words);
      } catch {
        throw new Error('not found');
      }
    },
    retry: (_, err) => {
      return !(err as Error).message.includes('not found');
    },
    enabled: clientStatus === 'success' && client !== undefined && queryAddress !== '',
    networkMode: 'always',
  });

  return { data, error, status } as const;
};
