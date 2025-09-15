import axios from 'axios';

import { getBaseURL } from '../globals/config';

export async function fetchActivity(walletAddress: string, offset: number, chainId: string) {
  const leapApiBaseUrl = getBaseURL();
  const { data } = await axios.get(
    `${leapApiBaseUrl}/v2/activity?chain-id=${chainId}&wallet-address=${walletAddress}&use-ecostake-proxy=false&pagination-offset=${offset}`,
    {
      timeout: 30000,
    },
  );
  return { data: data.txs };
}
