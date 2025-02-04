import { denoms as defaultDenoms, initResourceFromS3 } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useEffect } from 'react';

import { useDenomsStore } from '../store';
import { useGetStorageLayer } from './global-vars';

const BASE_DENOMS = 'base-denoms';
const BASE_DENOMS_LAST_UPDATED_AT = 'base-denoms-last-updated-at';

const BASE_DENOMS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/base.json';
const BASE_DENOMS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/denoms/base-last-updated-at.json';

export const BETA_CW20_TOKENS = 'beta-cw20-tokens';
export const BETA_NATIVE_TOKENS = 'beta-native-tokens';
export const BETA_ERC20_TOKENS = 'beta-erc20-tokens';

export function useInitDenoms() {
  const storage = useGetStorageLayer();
  const { setDenoms } = useDenomsStore();

  const setResource = useCallback(async (resource: any) => {
    const betaERC20Tokens = await storage.get(BETA_ERC20_TOKENS);
    const betaCW20Tokens = await storage.get(BETA_CW20_TOKENS);
    const betaNativeTokens = await storage.get(BETA_NATIVE_TOKENS);

    if (betaERC20Tokens) {
      let allBetaERC20Tokens = {};
      for (const chain in betaERC20Tokens) {
        for (const coinMinimalDenom in betaERC20Tokens[chain]) {
          if (resource[coinMinimalDenom]) {
            delete betaERC20Tokens[chain][coinMinimalDenom];
          }
        }

        allBetaERC20Tokens = { ...allBetaERC20Tokens, ...betaERC20Tokens[chain] };
      }

      await storage.set(BETA_ERC20_TOKENS, betaERC20Tokens);
      resource = { ...resource, ...allBetaERC20Tokens };
    }

    if (betaCW20Tokens) {
      let allBetaCW20Tokens = {};
      for (const chain in betaCW20Tokens) {
        for (const coinMinimalDenom in betaCW20Tokens[chain]) {
          if (resource[coinMinimalDenom]) {
            delete betaCW20Tokens[chain][coinMinimalDenom];
          }
        }

        allBetaCW20Tokens = { ...allBetaCW20Tokens, ...betaCW20Tokens[chain] };
      }

      await storage.set(BETA_CW20_TOKENS, betaCW20Tokens);
      resource = { ...resource, ...allBetaCW20Tokens };
    }

    if (betaNativeTokens) {
      let allBetaNativeTokens = {};
      for (const chain in betaNativeTokens) {
        for (const coinMinimalDenom in betaNativeTokens[chain]) {
          if (resource[coinMinimalDenom]) {
            delete betaNativeTokens[chain][coinMinimalDenom];
          }
        }

        allBetaNativeTokens = { ...allBetaNativeTokens, ...betaNativeTokens[chain] };
      }

      await storage.set(BETA_NATIVE_TOKENS, betaNativeTokens);
      resource = { ...resource, ...allBetaNativeTokens };
    }

    setDenoms(resource);
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
