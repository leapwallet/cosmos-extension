export type Bech32Config = {
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
};
export type Currency = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  coinGeckoId?: string;
  coinImageUrl?: string;
};
export type ChainInfo = {
  rpc: string;
  rest: string;
  chainId: string;
  chainName: string;
  stakeCurrency?: Currency;
  walletUrl?: string;
  walletUrlForStaking?: string;
  bip44: {
    coinType: number;
  };
  bech32Config: Bech32Config;
  currencies: Currency[];
  feeCurrencies: Currency[];
  coinType?: number;
  gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
  readonly features?: string[];
  readonly beta?: boolean;
};
