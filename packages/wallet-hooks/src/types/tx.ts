import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export type LoggingDenom = {
  coinGeckoId: string;
  chain: SupportedChain;
  coinMinimalDenom?: string;
  chainId?: string;
};

export type TxCallback = (status: 'success' | 'txDeclined') => void;
