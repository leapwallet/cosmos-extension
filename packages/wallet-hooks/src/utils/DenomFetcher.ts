import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';

import { getDenomStoreSnapshot } from '../store';

class DenomFetcher {
  // ibc denom -> minimal denom
  private denomMatcherCache: Record<string, string> = {};
  // cache axios promises to avoid multiple requests for the same data
  // wouldn't need this if had queryClient from tanstack, but not possible with current sdk
  private activePromises: Record<string, Promise<any>> = {};

  public async fetchDenomTrace(denom: string, restUrl: string): Promise<NativeDenom | undefined> {
    const denoms = await getDenomStoreSnapshot();

    const basicMatch = denoms[denom];
    if (basicMatch) {
      return basicMatch;
    }
    const cacheMatch = this.denomMatcherCache[denom];
    if (cacheMatch) {
      return denoms[cacheMatch];
    }
    if (this.activePromises[denom] !== undefined) {
      const trace = await this.activePromises[denom];
      if (trace.data.denom_trace?.base_denom) {
        const _symbol = denoms[trace.data.denom_trace.base_denom];
        this.denomMatcherCache[denom] = _symbol?.coinMinimalDenom;
        return _symbol;
      } else {
        return undefined;
      }
    }
    try {
      const tracePromise = axios.get(`${restUrl}/ibc/apps/transfer/v1/denom_traces/${denom.replace('ibc/', '')}`);
      this.activePromises[denom] = tracePromise;
      const trace = await tracePromise;
      if (trace.data.denom_trace?.base_denom) {
        const _symbol = denoms[trace.data.denom_trace.base_denom];
        this.denomMatcherCache[denom] = _symbol?.coinMinimalDenom;
        return _symbol;
      } else {
        return undefined;
      }
    } catch {
      return undefined;
    }
  }
}

export const denomFetcher = new DenomFetcher();
