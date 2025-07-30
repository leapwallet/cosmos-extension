import { useCallback, useEffect } from 'react';
import create from 'zustand';

import { useGetStorageLayer } from '../utils';

const GAS_ESTIMATE_CACHE_KEY = 'gas-estimate-cache';

type GasEstimateCache = { [key: string]: number };

type GasEstimateCacheStore = {
  gasEstimateCache: GasEstimateCache;
  setGasEstimateCache: (gasEstimateCache: GasEstimateCache) => void;
};

export const useGasEstimateCacheStore = create<GasEstimateCacheStore>((set) => ({
  gasEstimateCache: {},
  setGasEstimateCache: (gasEstimateCache) => set(() => ({ gasEstimateCache })),
}));

export const useGasEstimateCache = () => {
  return useGasEstimateCacheStore((store) => store.gasEstimateCache);
};

export const getGasEstimateCacheKey = (chainId: string, txType: string, feeDenom: string) => {
  return `gas-estimate-${chainId}-${txType}-${feeDenom}`;
};

export const useUpdateGasEstimateCache = () => {
  const storageLayer = useGetStorageLayer();
  const { gasEstimateCache, setGasEstimateCache } = useGasEstimateCacheStore();
  return useCallback(
    async (
      props:
        | { chainId: string | undefined; txType: string; feeDenom: string; gasEstimate: number }
        | { gasEstimateCacheKey: string; gasEstimate: number },
    ) => {
      try {
        if (!props || !props.gasEstimate) return;
        let key = '';
        if ('txType' in props) {
          if (!props.chainId) {
            return;
          }
          key = getGasEstimateCacheKey(props.chainId, props.txType, props.feeDenom);
        } else {
          key = props.gasEstimateCacheKey;
        }
        if (!key) {
          throw new Error('Invalid props for gas estimate cache');
        }
        const roundedGasEstimate = Math.round(props.gasEstimate);
        const newGasEstimateCache = { ...gasEstimateCache, [key]: roundedGasEstimate };
        await storageLayer.set(GAS_ESTIMATE_CACHE_KEY, JSON.stringify(newGasEstimateCache));
        setGasEstimateCache(newGasEstimateCache);
      } catch (error) {
        //
      }
    },
    [storageLayer, gasEstimateCache, setGasEstimateCache],
  );
};

export const useInitGasEstimateCache = () => {
  const storageLayer = useGetStorageLayer();
  const { setGasEstimateCache } = useGasEstimateCacheStore();

  useEffect(() => {
    storageLayer
      .get(GAS_ESTIMATE_CACHE_KEY)
      .then((gasEstimateCache) => {
        setGasEstimateCache(JSON.parse(gasEstimateCache || '{}'));
      })
      .catch(() => {
        //
      });
  }, [storageLayer, setGasEstimateCache]);
};
