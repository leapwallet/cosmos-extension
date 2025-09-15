import { SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { EvmFeeMarketBaseFee,FeeMarketGasPrices } from '../types';

const CHAINS_WITH_EVM_FEE_MARKET: SupportedChain[] = [
  'mantra'
]

/**
 * Fetch gas price from different fee market endpoints based on the FeeMarket module implementation in different chains.
 * @param lcdUrl
 * @param activeChain
 * @param feeDenom
 * @returns The gas price as a string, or null if not found or an error occurs.
 */
export async function getFeeMarketAmountData(lcdUrl: string, activeChain: SupportedChain, feeDenom: string): Promise<string | undefined> {
  if (CHAINS_WITH_EVM_FEE_MARKET.includes(activeChain)) {
    return await getEvmFeeMarketBaseFee(lcdUrl);
  } else {
    const feeMarketData: FeeMarketGasPrices = await getFeeMarketGasPrices(lcdUrl ?? '');
    const feeMarketDenomData = feeMarketData.find(({ denom }) => denom === feeDenom);
    return feeMarketDenomData?.amount ?? undefined;
  }
}

export async function getFeeMarketGasPrices(lcdUrl: string): Promise<FeeMarketGasPrices> {
  try {
    const { data } = await axiosWrapper({
      baseURL: lcdUrl,
      method: 'get',
      url: '/feemarket/v1/gas_prices',
    });

    return data?.prices ?? [];
  } catch {
    return [];
  }
}

export async function getEvmFeeMarketBaseFee(lcdUrl: string): Promise<string | undefined> {
  try {
    const { data } = await axiosWrapper({
      baseURL: lcdUrl,
      method: 'get',
      url: '/cosmos/evm/feemarket/v1/base_fee',
    });

    return (data as EvmFeeMarketBaseFee)?.base_fee ?? undefined
  } catch {
    return undefined;
  }
}
