import { denoms as defaultDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useEffect } from 'react';

import { useDenomsStore } from '../store';
import { useGetStorageLayer } from './global-vars';
import { initResourceFromS3 } from './initResourceFromS3';

const BASE_DENOMS = 'base-denoms';
const BASE_DENOMS_LAST_UPDATED_AT = 'base-denoms-last-updated-at';

const BASE_DENOMS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/base.json';
const BASE_DENOMS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/denoms/base-last-updated-at.json';

export const BETA_CW20_TOKENS = 'beta-cw20-tokens';

export function useInitDenoms() {
  const storage = useGetStorageLayer();
  const { setDenoms } = useDenomsStore();

  const setResource = useCallback(async (resouce: any) => {
    const betaCW20Tokens = await storage.get(BETA_CW20_TOKENS);
    if (betaCW20Tokens) {
      let allBetaCW20Tokens = {};
      for (const chain in betaCW20Tokens) {
        allBetaCW20Tokens = { ...allBetaCW20Tokens, ...betaCW20Tokens[chain] };
      }

      setDenoms({ ...resouce, ...allBetaCW20Tokens });
    } else {
      setDenoms(resouce);
    }
  }, []);

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource,
      resourceKey: BASE_DENOMS,
      resourceURL: BASE_DENOMS_URL,
      lastUpdatedAtKey: BASE_DENOMS_LAST_UPDATED_AT,
      lastUpdatedAtURL: BASE_DENOMS_LAST_UPDATED_AT_URL,
      defaultResourceData: defaultDenoms,
    });
  }, []);
}
