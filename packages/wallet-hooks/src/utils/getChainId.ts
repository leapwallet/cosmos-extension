import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk';

export function getChainId(chainInfo: ChainInfo | undefined, selectedNetwork: string): string | undefined {
  return selectedNetwork === 'testnet' ? chainInfo?.testnetChainId : chainInfo?.chainId;
}
