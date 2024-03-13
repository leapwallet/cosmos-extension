import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';

import { LeapWalletApi } from '../apis/LeapWalletApi';
import { getDenomStoreSnapshot } from '../store';
import { getKeyToUseForDenoms } from './getKeyToUseForDenoms';

class DenomFetcher {
  // ibc denom -> minimal denom
  private denomMatcherCache: Record<string, string> = {};
  // cache axios promises to avoid multiple requests for the same data
  // wouldn't need this if had queryClient from tanstack, but not possible with current sdk
  private activePromises: Record<string, Promise<any>> = {};

  public async fetchDenomTrace(denom: string, restUrl: string, chainId: string): Promise<NativeDenom | undefined> {
    const denoms = await getDenomStoreSnapshot();
    const _baseDenom = getKeyToUseForDenoms(denom, chainId);

    const basicMatch = denoms[_baseDenom];
    if (basicMatch) {
      return basicMatch;
    }

    const cacheMatch = this.denomMatcherCache[_baseDenom];
    if (cacheMatch) {
      return denoms[cacheMatch];
    }

    if (this.activePromises[_baseDenom] !== undefined) {
      const trace = await this.activePromises[_baseDenom];
      return getDenom(trace, this.denomMatcherCache);
    }

    try {
      const tracePromise = LeapWalletApi.getIbcDenomData(denom, restUrl, chainId);
      this.activePromises[_baseDenom] = tracePromise;

      const trace = await tracePromise;
      return getDenom(trace, this.denomMatcherCache);
    } catch {
      return undefined;
    }

    function getDenom(trace: any, denomMatcherCache: Record<string, string>) {
      if (trace.baseDenom) {
        const baseDenom = getKeyToUseForDenoms(trace.baseDenom, trace.originChainId);
        const _denom = denoms[baseDenom];

        denomMatcherCache[_baseDenom] = baseDenom;
        return _denom;
      } else {
        return undefined;
      }
    }
  }
}

export const denomFetcher = new DenomFetcher();
