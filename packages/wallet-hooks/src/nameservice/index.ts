import { useDebounce } from '../utils/useDebounce';
import { useIBCDomainsResolver } from './ibc-domains';
import { useICNSResolver } from './icns';
import { useStargazeNamesResolver } from './stargaze-names';

export * from './ibc-domains';
export * from './icns';
export * from './stargaze-names';

export const useNameServiceResolver = (queryAddress: string, network: 'mainnet' | 'testnet') => {
  const debouncedQueryAddress = useDebounce(queryAddress, 500);

  const ibcDomains = useIBCDomainsResolver(debouncedQueryAddress, network);
  const icns = useICNSResolver(debouncedQueryAddress, network);
  const stargazeNames = useStargazeNamesResolver(debouncedQueryAddress, network);

  return {
    ibcDomains,
    icns,
    stargazeNames,
  } as const;
};

export const nameServices: Record<string, string> = {
  ibcDomains: 'IBC Domains',
  icns: 'Interchain Name Service',
  stargazeNames: 'Stargaze Names',
};
