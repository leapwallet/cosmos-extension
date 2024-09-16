import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export type Token = {
  name?: string;
  symbol: string;
  coinMinimalDenom: string;
  amount: string;
  usdValue?: string;
  percentChange?: number;
  img: string;
  ibcDenom?: string;
  ibcChainInfo?: IbcChainInfo;
  usdPrice?: string;
  coinDecimals?: number;
  invalidKey?: boolean;
  chain?: string;
  coinGeckoId?: string;
  isEvm?: boolean;
  tokenBalanceOnChain?: SupportedChain; // for aggregated view
};

export type IbcChainInfo = {
  pretty_name: string;
  icon: string;
  name: string;
  channelId: string;
};
