import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export type SelectedNetworkType = 'mainnet' | 'testnet';
export type AggregatedSupportedChainType = SupportedChain | 'aggregated';

export type LoadingStatusType = 'loading' | 'success' | 'error' | 'fetching-more';
