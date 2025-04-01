export const baseEthereumGasPrices: { low: number; medium: number; high: number } = {
  low: 1_000_000_000,
  medium: 1_200_000_000,
  high: 1_500_000_000,
};

export const EVM_GAS_PRICES: Record<string, { low: number; medium: number; high: number }> = {
  'pacific-1': {
    low: 1_000_000_000,
    medium: 1_200_000_000,
    high: 1_500_000_000,
  },
  'atlantic-2': {
    low: 1_000_000_000,
    medium: 1_200_000_000,
    high: 1_500_000_000,
  },
  'arctic-1': {
    low: 10_000_000,
    medium: 12_000_000,
    high: 15_000_000,
  },
  '1': baseEthereumGasPrices,
  '984122': baseEthereumGasPrices,
  '42161': baseEthereumGasPrices,
  '137': baseEthereumGasPrices,
  '8453': baseEthereumGasPrices,
  '10': baseEthereumGasPrices,
  '81457': baseEthereumGasPrices,
  '169': baseEthereumGasPrices,
  '3441006': baseEthereumGasPrices,
  '1890': baseEthereumGasPrices,
  '1891': baseEthereumGasPrices,
  '1301': baseEthereumGasPrices,
  '130': baseEthereumGasPrices,
  '253368190': baseEthereumGasPrices,
  '16604737732183': baseEthereumGasPrices,
  '43114': baseEthereumGasPrices,
  '56': baseEthereumGasPrices,
  '2741': baseEthereumGasPrices,
  '11124': baseEthereumGasPrices,
  '80084': baseEthereumGasPrices,
  '80094': baseEthereumGasPrices,
  '10143': baseEthereumGasPrices,
  '1514': baseEthereumGasPrices,
  '1513': baseEthereumGasPrices,
  '999': baseEthereumGasPrices,
  '998': baseEthereumGasPrices,
  '6342': baseEthereumGasPrices,
  '16600': baseEthereumGasPrices,
};
