import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useActivity } from '../activity';
import { AggregatedActivity, useAddress } from '../store';

const NETWORK = 'mainnet';

export function useFillAggregatedActivity(
  denoms: DenomsRecord,
  chain: SupportedChain,
  setAggregatedActivity: (aggregatedActivity: AggregatedActivity) => void,
) {
  const address = useAddress(chain);
  const { txResponse } = useActivity(denoms, chain, address, NETWORK);

  useEffect(() => {
    setAggregatedActivity({
      perChainActivity: {
        [chain]: {
          txResponse,
        },
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txResponse, chain]);
}
