// use init snip20 denoms
import { initResourceFromS3, SnipDenoms as defaultDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useEffect } from 'react';

import { useSnipDenomsStore } from '../store';
import { useGetStorageLayer } from './global-vars';

const SNIP_DENOMS = 'snip-denoms';
const SNIP_DENOMS_LAST_UPDATED_AT = 'snip-denoms-last-updated-at';

const SNIP_DENOMS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/secret/snip20.json';
const SNIP_DENOMS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/denoms/secret/snip20-last-updated-at.json';

export const BETA_SNIP_20_TOKENS = 'beta-snip-20-tokens';

export function useInitSnipDenoms() {
  const storage = useGetStorageLayer();
  const { setDenoms } = useSnipDenomsStore();

  const setResource = useCallback(async (resource: any) => {
    const betaSnipTokens = await storage.get<Record<string, Record<string, string>>>(BETA_SNIP_20_TOKENS);
    if (betaSnipTokens) {
      let allBetaSnipTokens: Record<string, any> = {};
      for (const chain in betaSnipTokens) {
        allBetaSnipTokens = { ...allBetaSnipTokens, ...betaSnipTokens[chain] };
      }

      for (const contract in allBetaSnipTokens) {
        if (resource[contract]) {
          delete allBetaSnipTokens[contract];
        }
      }

      setDenoms({ ...resource, ...allBetaSnipTokens });
    } else {
      setDenoms(resource);
    }
  }, []);

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource,
      resourceKey: SNIP_DENOMS,
      resourceURL: SNIP_DENOMS_URL,
      lastUpdatedAtKey: SNIP_DENOMS_LAST_UPDATED_AT,
      lastUpdatedAtURL: SNIP_DENOMS_LAST_UPDATED_AT_URL,
      defaultResourceData: defaultDenoms,
    });
  }, []);
}
