import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants';

export function getNativeDenom(
  chainInfos: Record<SupportedChain, ChainInfo>,
  activeChain: SupportedChain,
  selectedNetwork: 'mainnet' | 'testnet',
) {
  const nativeDenoms = Object.values(chainInfos[activeChain].nativeDenoms);
  return selectedNetwork === 'testnet' && nativeDenoms.length > 1 ? nativeDenoms[1] : nativeDenoms[0];
}
