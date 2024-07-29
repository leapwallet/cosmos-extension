import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getChainsAprSnapshot, useChainsAprStore } from '../store';

export function useInitChainsApr() {
  const { setChainsApr } = useChainsAprStore();

  useQuery(['query-init-chains-apr'], async function () {
    const chainsApr = await getChainsAprSnapshot();
    if (Object.values(chainsApr).length) {
      setChainsApr(chainsApr);
    } else {
      const url = `${process.env.LEAP_WALLET_BACKEND_API_URL}/market/apr-changes`;
      const { data } = await axios.get(url);
      setChainsApr(data);
    }
  });
}
