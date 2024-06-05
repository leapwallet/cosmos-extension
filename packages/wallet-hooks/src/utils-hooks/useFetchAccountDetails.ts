import { AccountDetails, fetchAccountDetails } from '@leapwallet/cosmos-wallet-sdk';
import { FetchStatus, QueryStatus, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useChainApis } from '../store';

export function useFetchAccountDetails() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<QueryStatus | FetchStatus>('idle');
  const [error, setError] = useState<string>('');
  const { lcdUrl } = useChainApis();
  const queryClient = useQueryClient();
  const [data, setData] = useState<AccountDetails>();

  const fetchDetails = useCallback(
    async (address: string) => {
      if (lcdUrl && address) {
        try {
          setIsLoading(true);
          setStatus('loading');

          const data = await queryClient.fetchQuery({
            queryKey: ['query-fetch-account-details-conditionally'],
            queryFn: async function () {
              return await fetchAccountDetails(lcdUrl, address);
            },
          });

          setData(data);
          setStatus('success');
        } catch (error) {
          setStatus('error');
          console.log('fetch account details conditionally error - ', error);
          setError((error as Error).message);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [lcdUrl],
  );

  return { isLoading, status, error, fetchDetails, data, setData };
}
