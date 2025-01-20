import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/utils/classes';
import { useQuery } from '@tanstack/react-query';

import { useCoingeckoPricesStore, useIbcTraceStore } from '../store';

export function useProviderApr(address: string, denoms: DenomsRecord) {
  const { ibcTraceData } = useIbcTraceStore();
  const { coingeckoPrices } = useCoingeckoPricesStore();

  async function getApr() {
    const response = await fetch(
      `https://lava.lava.build/lavanet/lava/subscription/estimated_provider_rewards/${address}/10000000000ulava`,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch APR data');
    }
    const data = await response.json();

    const totalAmount: BigNumber = data.total.reduce((sum: BigNumber, item: any) => {
      let denom = item.denom;
      if (denom.startsWith('ibc')) {
        denom = ibcTraceData[denom].baseDenom;
      }
      const denomInfo = denoms[denom as keyof typeof denoms];
      const price = coingeckoPrices['USD'][denomInfo.coinGeckoId];
      if (!denomInfo || !price) {
        return sum;
      }
      const usdValue = new BigNumber(item.amount).div(10 ** denomInfo.coinDecimals).multipliedBy(price);

      return sum.plus(usdValue);
    }, new BigNumber(0));

    const investedAmount = new BigNumber(10000).multipliedBy(coingeckoPrices['USD']['lava-network']);

    const rate = totalAmount.div(investedAmount);

    return rate.plus(1).pow(12).minus(1).multipliedBy(100).toFixed(2);
  }
  const {
    data: apr,
    isLoading: loading,
    error,
  } = useQuery(['providerAPR', address], getApr, {
    enabled: !!address && Object.keys(denoms).length > 0,
    cacheTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  return { apr, loading, error };
}
