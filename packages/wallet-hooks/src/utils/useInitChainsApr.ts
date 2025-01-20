import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getChainsAprSnapshot, useChainsAprStore } from '../store';
import { getLeapapiBaseUrl } from './global-vars';

export function useInitChainsApr() {
  const { setChainsApr } = useChainsAprStore();

  useQuery(['query-init-chains-apr'], async function () {
    const chainsApr = await getChainsAprSnapshot();
    if (Object.values(chainsApr).length) {
      setChainsApr(chainsApr);
    } else {
      const url = `${getLeapapiBaseUrl()}/market/apr-changes`;
      const { data } = await axios.get(url);
      setChainsApr(data);
    }
  });
}
