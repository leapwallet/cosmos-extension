import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export function getStakingActiveChain(
  activeChain: SupportedChain,
  pushForceChain?: SupportedChain,
  forceChain?: SupportedChain,
) {
  if (pushForceChain) {
    return pushForceChain;
  }

  if (forceChain) {
    return forceChain;
  }

  return activeChain;
}
