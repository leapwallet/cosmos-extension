const baseAptosGasPrices: { low: number; medium: number; high: number } = {
  low: 100,
  medium: 120,
  high: 150,
};

export const APTOS_GAS_PRICES: Record<string, { low: number; medium: number; high: number }> = {
  'aptos-177': baseAptosGasPrices,
  'aptos-126': baseAptosGasPrices,
  'aptos-250': baseAptosGasPrices,
  'aptos-1': baseAptosGasPrices,
  'aptos-2': baseAptosGasPrices,
};
