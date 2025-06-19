import { APTOS_CHAINS } from '../constants';

export function isAptosChain(chain: string | undefined) {
  if (!chain) return false;

  return APTOS_CHAINS.includes(chain) || chain?.includes('aptos-');
}
