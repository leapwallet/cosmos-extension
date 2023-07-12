import { useQuery } from '@tanstack/react-query';
import { Faucet } from 'types/faucet';

type FaucetResponse = {
  [key: string]: Faucet;
};

export function useGetFaucetApi() {
  return useQuery<FaucetResponse>(
    ['faucet-new-data'],
    async () => {
      const res = await fetch('https://assets.leapwallet.io/faucet-v3.json');
      const data: FaucetResponse = await res.json();
      return data;
    },
    {
      retry: 2,
    },
  );
}

export function useGetFaucet(key: string) {
  const { data } = useQuery<FaucetResponse>(['faucet-new-data']);
  return data?.[key];
}
