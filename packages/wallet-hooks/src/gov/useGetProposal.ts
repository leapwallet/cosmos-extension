import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { useActiveChain, useChainApis, useSelectedNetwork } from '../store';
import { govQueryIds } from './queryIds';

export function useGetProposal(id: number, enabled: boolean) {
  const activeChain = useActiveChain();
  const selectedNetwork = useSelectedNetwork();
  const { lcdUrl, txUrl } = useChainApis();
  return useQuery(
    [govQueryIds.proposals, activeChain, selectedNetwork, id],
    async (): Promise<any> => {
      const url = `/cosmos/gov/v1beta1/proposals/${id}/tally`;
      const tallying = '/cosmos/gov/v1beta1/params/tallying';
      const poolUrl = '/cosmos/staking/v1beta1/pool';
      const proposerUrl = `/cosmos/gov/v1beta1/proposals/${id}/deposits`;

      const [data1, data2, data3, data4] = await Promise.all([
        axiosWrapper({ baseURL: lcdUrl, method: 'get', url }),
        axiosWrapper({ baseURL: lcdUrl, method: 'get', url: tallying }),
        axiosWrapper({ baseURL: lcdUrl, method: 'get', url: poolUrl }),
        axiosWrapper({ baseURL: lcdUrl, method: 'get', url: proposerUrl }),
      ]);
      const proposer = data4.data.deposits[data4.data.deposits.length - 1];
      return {
        ...data1.data.tally,
        ...data2.data.tally_params,
        ...data3.data.pool,
        proposer,
        proposerTxUrl: proposer?.depositor ? `${txUrl?.replace('txs', 'account')}/${proposer?.depositor}` : '',
      };
    },
    { enabled: !!activeChain && enabled, retry: 2 },
  );
}
