import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export type NftChain = {
  forceChain: SupportedChain;
  forceContractsListChain: SupportedChain;
  forceNetwork: 'testnet' | 'mainnet';
};
