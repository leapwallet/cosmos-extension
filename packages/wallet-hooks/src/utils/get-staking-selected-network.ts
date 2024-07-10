import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
export type SelectedNetwork = 'mainnet' | 'testnet';

export function getStakingSelectedNetwork(
  activeChain: SupportedChain,
  selectedNetwork: SelectedNetwork,
  pushForceNetwork?: SelectedNetwork,
  forceNetwork?: SelectedNetwork,
) {
  if (pushForceNetwork) {
    return pushForceNetwork;
  }

  if (forceNetwork) {
    return forceNetwork;
  }

  if ((activeChain as SupportedChain & 'aggregated') === 'aggregated') {
    return 'mainnet';
  }

  return selectedNetwork;
}
