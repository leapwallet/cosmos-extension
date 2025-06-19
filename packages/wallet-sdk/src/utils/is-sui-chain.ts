import { SUI_CHAINS } from '../constants';

export function isSuiChain(chain: string) {
  return SUI_CHAINS.includes(chain);
}
