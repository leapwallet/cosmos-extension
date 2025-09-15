import { BigNumber } from 'bignumber.js';

export type PriceCalculationInput = {
  coingeckoPrices: Record<string, number> | null | undefined;
  amount?: string;
  coinMinimalDenom: string;
  coinGeckoId?: string;
  chainId?: string;
};

export type PriceCalculationResult = {
  usdPrice: string | undefined;
  usdValue: string;
};

export function calculateTokenPriceAndValue(input: PriceCalculationInput): PriceCalculationResult {
  const { coingeckoPrices, coinGeckoId, coinMinimalDenom, chainId, amount } = input;

  let usdPrice: number | undefined;

  if (coingeckoPrices) {
    const alternateCoingeckoKey = chainId ? `${chainId}-${coinMinimalDenom}` : undefined;
    if (coinGeckoId) {
      usdPrice = coingeckoPrices[coinGeckoId];
    }
    if (!usdPrice && alternateCoingeckoKey) {
      usdPrice = coingeckoPrices[alternateCoingeckoKey] ?? coingeckoPrices[alternateCoingeckoKey.toLowerCase()];
    }
  }

  let usdValue = '';
  if (usdPrice && amount && parseFloat(amount) > 0) {
    usdValue = new BigNumber(amount).times(usdPrice).toString();
  }

  return {
    usdPrice: usdPrice ? String(usdPrice) : undefined,
    usdValue,
  };
}
