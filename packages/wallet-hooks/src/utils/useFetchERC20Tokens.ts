import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk';
import { Erc20Denoms } from '@leapwallet/cosmos-wallet-sdk/dist/constants/erc20-denoms';
import { useQuery } from '@tanstack/react-query';

import { useActiveChain, useERC20TokensStore } from '../store';
import { useGetStorageLayer } from './global-vars';
import { initResourceFromS3 } from './initResourceFromS3';

const ERC20_TOKENS = 'erc20-tokens';
const ERC20_TOKENS_LAST_UPDATED_AT = 'erc20-tokens-last-updated-at';

export function useFetchERC20Tokens() {
  const activeChain = useActiveChain();
  const storage = useGetStorageLayer();
  const { setERC20Tokens } = useERC20TokensStore();

  useQuery(
    ['fetch-erc20-tokens', activeChain],
    () => {
      if (activeChain) {
        const resourceKey = `${activeChain}-${ERC20_TOKENS}`;
        const resourceURL = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${activeChain}/erc20.json`;

        const lastUpdatedAtKey = `${activeChain}-${ERC20_TOKENS_LAST_UPDATED_AT}`;
        const lastUpdatedAtURL = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${activeChain}/erc20-last-updated-at.json`;

        initResourceFromS3({
          storage,
          setResource: setERC20Tokens,
          resourceKey,
          resourceURL,
          lastUpdatedAtKey,
          lastUpdatedAtURL,
          defaultResourceData: Erc20Denoms[activeChain as 'evmos'] ?? {},
        });
      }
    },
    {
      enabled: !!activeChain && activeChain === ChainInfos.evmos.key,
      retry: (failureCount: number, error: any) => {
        if (error.response?.status === 404 || error.response?.status === 403 || error.response?.status === 429) {
          return false;
        }

        return failureCount < 3;
      },
    },
  );
}
