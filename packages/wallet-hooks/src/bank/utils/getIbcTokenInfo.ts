import { fromSmall } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { fetchIbcTrace, IbcDenomData, useDenomsStore, useIbcTraceStore } from 'store';
import { getKeyToUseForDenoms } from 'utils';

export async function getIbcTokenInfo(ibcHash: string, amount: string, lcdUrl: string, chainId: string) {
  const { denoms } = useDenomsStore.getState();

  const { ibcTraceData } = useIbcTraceStore.getState();
  let trace = ibcTraceData[ibcHash];
  const ibcTraceDataToAdd: Record<string, IbcDenomData> = {};
  if (!trace) {
    trace = await fetchIbcTrace(ibcHash, lcdUrl ?? '', chainId);
    if (trace) {
      ibcTraceDataToAdd[ibcHash] = trace;
    }
  }

  const baseDenom = trace.baseDenom;

  const ibcChainInfo = {
    pretty_name: trace?.originChainId,
    icon: '',
    name: trace?.originChainId,
    channelId: trace.channelId,
  };

  const _baseDenom = getKeyToUseForDenoms(baseDenom, String(trace?.sourceChainId || trace?.originChainId || ''));
  const denomInfo = denoms?.[_baseDenom];
  const qty = fromSmall(new BigNumber(amount).toString(), denomInfo?.coinDecimals);

  return {
    name: denomInfo?.name,
    amount: qty,
    symbol: denomInfo?.coinDenom ?? _baseDenom ?? '',
    coinMinimalDenom: denomInfo?.coinMinimalDenom ?? _baseDenom ?? '',
    img: denomInfo?.icon ?? '',
    ibcDenom: ibcHash,
    ibcChainInfo,
    coinDecimals: denomInfo?.coinDecimals ?? 6,
    coinGeckoId: denomInfo?.coinGeckoId ?? '',
    chain: denomInfo?.chain ?? '',
  };
}
