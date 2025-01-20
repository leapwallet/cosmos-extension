import { APTOS_CHAINS } from '../constants';

export function isAptosChain(chain: string) {
  return APTOS_CHAINS.includes(chain) || chain.includes('aptos-');
}
