import { axiosWrapper } from '../healthy-nodes';
import { FeeMarketGasPrices } from '../types';

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
