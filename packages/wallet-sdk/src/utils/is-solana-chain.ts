import { SOLANA_CHAINS } from '../constants';

export function isSolanaChain(chain: string) {
  return SOLANA_CHAINS.includes(chain);
}
