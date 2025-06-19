import {
  axiosWrapper,
  ChainInfo,
  defaultGasPriceStep,
  DenomsRecord,
  GasPrice,
  GasPriceStepsRecord,
  getGasPricesSteps,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useChainApis, useChainsStore, useGasPriceSteps, useGetChains, useSelectedNetwork } from '../store';
import { useGetAptosGasPrices, useGetEvmGasPrices, useGetSolanaGasPrices, useGetSuiGasPrices } from '../utils-hooks';
import { useNativeFeeDenom } from './useNativeFeeDenom';

export async function getFeeMarketGasPrices(lcdUrl: string) {
  try {
    const { data } = await axiosWrapper({
      baseURL: lcdUrl,
      method: 'get',
      url: '/feemarket/v1/gas_prices',
    });

    return data?.prices ?? [];
  } catch {
    return [];
  }
}

export async function getMayaTxFee(lcdUrl: string) {
  const url = `${lcdUrl}/mayachain/mimir`;
  const { data } = await axios.get(url);
  return data.NATIVETRANSACTIONFEE ?? 10000000000;
}

export async function getThorChainTxFee(lcdUrl: string) {
  const url = `${lcdUrl}/thorchain/network`;
  const { data } = await axios.get(url);
  return data['native_tx_fee_rune'] ?? 2000000;
}

function getGasPriceStep(chain: ChainInfo, allChainsGasPriceSteps: GasPriceStepsRecord): GasPriceStep {
  let gasPrices = allChainsGasPriceSteps[chain.key];
  if (!gasPrices && chain.beta && chain.gasPriceStep) {
    gasPrices = chain.gasPriceStep;
  } else if (!gasPrices) {
    gasPrices = defaultGasPriceStep;
  }

  return { low: gasPrices.low, medium: gasPrices.average, high: gasPrices.high };
}

export function useGetGasPrice(chain: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [forceNetwork, _selectedNetwork]);

  const { chains } = useChainsStore();
  const { lcdUrl } = useChainApis(chain, selectedNetwork);
  const gasPriceSteps = useGasPriceSteps();

  return useCallback(async () => {
    const chainInfo = chains[chain];
    const feeDenom = Object.values(chainInfo.nativeDenoms)[0];

    const { low: lowGasPrice } = await getGasPricesSteps({
      activeChain: chain,
      selectedNetwork,
      allChainsGasPriceSteps: gasPriceSteps,
      chains,
      lcdUrl,
    });

    return GasPrice.fromString(`${lowGasPrice + feeDenom.coinMinimalDenom}`);
  }, [chains, chain, selectedNetwork, lcdUrl]);
}

export enum GasOptions {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export type GasPriceStep = { low: number; medium: number; high: number };

/**
 * Please use `GasPriceStepForChainStore` from `@leapwallet/cosmos-wallet-store` instead.
 */
export function useGasPriceStepForChain(chainKey: SupportedChain, forceNetwork?: 'mainnet' | 'testnet'): GasPriceStep {
  const { chains } = useChainsStore();
  const chain = useMemo(() => chains[chainKey], [chains, chainKey]);
  const { lcdUrl } = useChainApis(chainKey);
  const allChainsGasPriceSteps = useGasPriceSteps();
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork ?? _selectedNetwork, [forceNetwork, _selectedNetwork]);

  const [gasPriceStep, setGasPriceStep] = useState<GasPriceStep>(() => {
    return getGasPriceStep(chain, allChainsGasPriceSteps);
  });

  const setGasPrice = useCallback(async () => {
    const gasData = await getGasPricesSteps({
      activeChain: chainKey,
      selectedNetwork,
      allChainsGasPriceSteps,
      chains,
      lcdUrl,
    });

    setGasPriceStep(gasData);
  }, [allChainsGasPriceSteps, chainKey, selectedNetwork, lcdUrl]);

  useEffect(() => {
    if (Object.keys(allChainsGasPriceSteps).length > 0) {
      setGasPriceStep(getGasPriceStep(chain, allChainsGasPriceSteps));
    }
  }, [chain, allChainsGasPriceSteps]);

  useEffect(() => {
    setGasPrice().catch(console.warn);
  }, [chainKey, lcdUrl, selectedNetwork]);

  return gasPriceStep;
}

export type GasRate = Record<GasOptions, GasPrice>;

export function useGasRateQuery(
  denoms: DenomsRecord,
  chainKey: SupportedChain,
  activeNetwork?: 'mainnet' | 'testnet',
  isSeiEvmTransaction?: boolean,
):
  | {
      [key: string]: GasRate;
    }
  | undefined {
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = activeNetwork ?? _selectedNetwork;

  const nativeFeeDenom = useNativeFeeDenom(denoms, chainKey, selectedNetwork);
  const gasPriceStep = useGasPriceStepForChain(chainKey);
  const { gasPrice: evmGasPrice } = useGetEvmGasPrices(chainKey, selectedNetwork);
  const { gasPrice: aptosGasPrice } = useGetAptosGasPrices(chainKey, selectedNetwork);
  const { gasPrice: solanaGasPrice } = useGetSolanaGasPrices(chainKey, selectedNetwork);
  const { gasPrice: suiGasPrice } = useGetSuiGasPrices(chainKey, selectedNetwork);
  const chains = useGetChains();
  if (!gasPriceStep && !isSeiEvmTransaction && !chains[chainKey]?.evmOnlyChain) return undefined;
  return useMemo(() => {
    if (isAptosChain(chainKey)) {
      const lowAmount = new BigNumber(aptosGasPrice.low);
      const mediumAmount = new BigNumber(aptosGasPrice.medium);
      const highAmount = new BigNumber(aptosGasPrice.high);

      return {
        [nativeFeeDenom.coinMinimalDenom]: {
          low: GasPrice.fromUserInput(lowAmount.toString(), nativeFeeDenom.coinMinimalDenom),
          medium: GasPrice.fromUserInput(mediumAmount.toString(), nativeFeeDenom.coinMinimalDenom),
          high: GasPrice.fromUserInput(highAmount.toString(), nativeFeeDenom.coinMinimalDenom),
        },
      } as const;
    }

    if (isSolanaChain(chainKey)) {
      const lowAmount = new BigNumber(solanaGasPrice.low);
      const mediumAmount = new BigNumber(solanaGasPrice.medium);
      const highAmount = new BigNumber(solanaGasPrice.high);

      return {
        [nativeFeeDenom.coinMinimalDenom]: {
          low: GasPrice.fromUserInput(lowAmount.toString(), nativeFeeDenom.coinMinimalDenom),
          medium: GasPrice.fromUserInput(mediumAmount.toString(), nativeFeeDenom.coinMinimalDenom),
          high: GasPrice.fromUserInput(highAmount.toString(), nativeFeeDenom.coinMinimalDenom),
        },
      } as const;
    }

    if (isSuiChain(chainKey)) {
      const lowAmount = new BigNumber(suiGasPrice.low);
      const mediumAmount = new BigNumber(suiGasPrice.medium);
      const highAmount = new BigNumber(suiGasPrice.high);

      return {
        [nativeFeeDenom.coinMinimalDenom]: {
          low: GasPrice.fromUserInput(lowAmount.toString(), nativeFeeDenom.coinMinimalDenom),
          medium: GasPrice.fromUserInput(mediumAmount.toString(), nativeFeeDenom.coinMinimalDenom),
          high: GasPrice.fromUserInput(highAmount.toString(), nativeFeeDenom.coinMinimalDenom),
        },
      } as const;
    }

    if (isSeiEvmTransaction || chains[chainKey]?.evmOnlyChain) {
      const lowAmount = new BigNumber(evmGasPrice.low);
      const mediumAmount = new BigNumber(evmGasPrice.medium);
      const highAmount = new BigNumber(evmGasPrice.high);

      return {
        [nativeFeeDenom.coinMinimalDenom]: {
          low: GasPrice.fromUserInput(lowAmount.toString(), nativeFeeDenom.coinMinimalDenom),
          medium: GasPrice.fromUserInput(mediumAmount.toString(), nativeFeeDenom.coinMinimalDenom),
          high: GasPrice.fromUserInput(highAmount.toString(), nativeFeeDenom.coinMinimalDenom),
        },
      } as const;
    }

    return {
      [nativeFeeDenom.coinMinimalDenom]: {
        low: GasPrice.fromString(`${gasPriceStep.low}${nativeFeeDenom.coinMinimalDenom}`),
        medium: GasPrice.fromString(`${gasPriceStep.medium}${nativeFeeDenom.coinMinimalDenom}`),
        high: GasPrice.fromString(`${gasPriceStep.high}${nativeFeeDenom.coinMinimalDenom}`),
      },
    } as const;
  }, [
    nativeFeeDenom?.coinMinimalDenom,
    gasPriceStep,
    isSeiEvmTransaction,
    evmGasPrice.low,
    evmGasPrice.medium,
    evmGasPrice.high,
    aptosGasPrice.low,
    aptosGasPrice.medium,
    aptosGasPrice.high,
    solanaGasPrice.low,
    solanaGasPrice.medium,
    solanaGasPrice.high,
    suiGasPrice.low,
    suiGasPrice.medium,
    suiGasPrice.high,
    chainKey,
    chains,
  ]);
}
