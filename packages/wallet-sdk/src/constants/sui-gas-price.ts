const baseSuiGasPrices: { low: number; medium: number; high: number } = {
  low: 1000,
  medium: 1200,
  high: 1400,
};

export const SUI_GAS_PRICES: Record<string, { low: number; medium: number; high: number }> = {
  'sui-101': baseSuiGasPrices,
  'sui-103': baseSuiGasPrices,
};
