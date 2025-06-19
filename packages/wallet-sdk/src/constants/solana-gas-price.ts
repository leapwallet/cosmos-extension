const baseSolanaGasPrices: { low: number; medium: number; high: number } = {
  low: 0,
  medium: 1,
  high: 1,
};

export const SOLANA_GAS_PRICES: Record<string, { low: number; medium: number; high: number }> = {
  '101': baseSolanaGasPrices,
  '103': baseSolanaGasPrices,
  'fogo-1': baseSolanaGasPrices,
};
