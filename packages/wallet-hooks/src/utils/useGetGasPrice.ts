import {
  ChainInfo,
  defaultGasPriceStep,
  GasPrice,
  GasPriceStepsRecord,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useChainApis, useChainsStore, useGasPriceSteps, useSelectedNetwork } from '../store';
import { FeeModel } from '../types/fee-model';
import { useLowGasPriceStep } from './useLowGasPriceStep';
import { useNativeFeeDenom } from './useNativeFeeDenom';

function roundOf(value: number, tillDecimal: number) {
  return Math.round(value * 10 ** tillDecimal) / 10 ** tillDecimal;
}

async function getCoreumGasPrice(lcdUrl: string, gasPriceSteps: GasPriceStepsRecord) {
  const coreumGasLcd1 = 'https://full-node.mainnet-1.coreum.dev:1317';

  const gasPrice1 = await axios.get<FeeModel>(`${coreumGasLcd1}/coreum/feemodel/v1/min_gas_price`);
  const gasPrice2 = await axios.get<FeeModel>(`${lcdUrl}/coreum/feemodel/v1/min_gas_price`);

  const minGasPrice1 = parseFloat(gasPrice1.data.min_gas_price.amount);
  const minGasPrice2 = parseFloat(gasPrice2.data.min_gas_price.amount);

  const defaultGasPrice = gasPriceSteps.coreum?.low;
  const minGasPrice = Math.max(minGasPrice1, minGasPrice2, defaultGasPrice);

  return isNaN(minGasPrice) ? defaultGasPrice : minGasPrice;
}

async function getSeiGasPrice(gasPriceSteps: GasPriceStepsRecord, chainId: string) {
  const seiGasJSON = 'https://raw.githubusercontent.com/sei-protocol/chain-registry/main/gas.json';
  const { data } = await axios.get(seiGasJSON);

  const minGas = data[chainId]?.min_gas_price;
  const defaultGasPrice = gasPriceSteps.seiTestnet2?.low;

  return minGas ?? defaultGasPrice;
}

async function getOsmosisGasPrice(lcdUrl: string, gasPriceSteps: GasPriceStepsRecord) {
  const url = `${lcdUrl}/osmosis/txfees/v1beta1/cur_eip_base_fee`;
  const { data } = await axios.get(url);

  return roundOf(Number(data.base_fee), 4) ?? gasPriceSteps.osmosis.low;
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
  let gasPrices = defaultGasPriceStep;
  const gasPriceStepsForChain = allChainsGasPriceSteps[chain.key];
  if (chain.beta && chain.gasPriceStep) {
    gasPrices = chain.gasPriceStep;
  } else if (gasPriceStepsForChain) {
    gasPrices = gasPriceStepsForChain;
  }
  return { low: gasPrices.low, medium: gasPrices.average, high: gasPrices.high };
}

export function useGetGasPrice(chain: SupportedChain) {
  const { chains } = useChainsStore();
  const { lcdUrl } = useChainApis(chain);
  const gasPriceSteps = useGasPriceSteps();
  const lowGasPriceStep = useLowGasPriceStep(chain);
  const selectedNetwork = useSelectedNetwork();

  return useCallback(async () => {
    const chainInfo = chains[chain];
    const feeDenom = Object.values(chainInfo.nativeDenoms)[0];
    let gasPrice = lowGasPriceStep;

    try {
      if ((chain === 'coreum' || chain === 'mainCoreum') && lcdUrl) {
        gasPrice = await getCoreumGasPrice(lcdUrl ?? '', gasPriceSteps);
      }

      if (chain === 'seiTestnet2') {
        const chainId =
          selectedNetwork === 'mainnet' ? chains['seiTestnet2'].chainId : chains['seiTestnet2'].testnetChainId ?? '';
        gasPrice = await getSeiGasPrice(gasPriceSteps, chainId);
      }

      if (chain === 'osmosis') {
        gasPrice = await getOsmosisGasPrice(lcdUrl ?? '', gasPriceSteps);
      }
    } catch {
      gasPrice = gasPriceSteps[chain]?.low ?? lowGasPriceStep;
    }

    return GasPrice.fromString(`${gasPrice + feeDenom.coinMinimalDenom}`);
  }, [chains, chain, lowGasPriceStep, selectedNetwork, lcdUrl]);
}

export enum GasOptions {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export type GasPriceStep = { low: number; medium: number; high: number };

export function useGasPriceStepForChain(chainKey: SupportedChain, forceNetwork?: 'mainnet' | 'testnet'): GasPriceStep {
  const { chains } = useChainsStore();
  const chain = chains[chainKey];
  const { lcdUrl } = useChainApis(chainKey);
  const allChainsGasPriceSteps = useGasPriceSteps();
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const [gasPriceStep, setGasPriceStep] = useState<GasPriceStep>(() => {
    return getGasPriceStep(chain, allChainsGasPriceSteps);
  });

  const setGasPrice = useCallback(async () => {
    try {
      if ((chainKey === 'coreum' || chainKey === 'mainCoreum') && lcdUrl) {
        const minGasPrice = await getCoreumGasPrice(lcdUrl, allChainsGasPriceSteps);
        setGasPriceStep({ low: minGasPrice, medium: minGasPrice * 1.2, high: minGasPrice * 1.5 });
      }

      if (chainKey === 'seiTestnet2') {
        const chainId =
          selectedNetwork === 'mainnet' ? chains['seiTestnet2'].chainId : chains['seiTestnet2'].testnetChainId ?? '';
        const minGasPrice = await getSeiGasPrice(allChainsGasPriceSteps, chainId);
        setGasPriceStep({ low: minGasPrice, medium: minGasPrice * 1.2, high: minGasPrice * 1.5 });
      }

      if (chainKey === 'osmosis') {
        const minGasPrice = await getOsmosisGasPrice(lcdUrl ?? '', allChainsGasPriceSteps);

        const low = Math.max(allChainsGasPriceSteps.osmosis.low, minGasPrice);
        const medium = Math.max(allChainsGasPriceSteps.osmosis.average, minGasPrice * 1.1);
        const high = Math.max(allChainsGasPriceSteps.osmosis.high, minGasPrice * 2);

        setGasPriceStep({ low, medium, high });
      }
    } catch {
      setGasPriceStep({
        low: allChainsGasPriceSteps[chainKey]?.low ?? defaultGasPriceStep.low,
        medium: allChainsGasPriceSteps[chainKey]?.average ?? defaultGasPriceStep.average,
        high: allChainsGasPriceSteps[chainKey]?.high ?? defaultGasPriceStep.high,
      });
    }
  }, [allChainsGasPriceSteps, chainKey, selectedNetwork, lcdUrl]);

  useEffect(() => {
    setGasPriceStep(getGasPriceStep(chain, allChainsGasPriceSteps));
  }, [chain, allChainsGasPriceSteps]);

  useEffect(() => {
    setGasPrice().catch(console.warn);
  }, [chainKey, lcdUrl, selectedNetwork]);

  return gasPriceStep;
}

export type GasRate = Record<GasOptions, GasPrice>;

export function useGasRateQuery(
  chainKey: SupportedChain,
  activeNetwork?: 'mainnet' | 'testnet',
):
  | {
      [key: string]: GasRate;
    }
  | undefined {
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = activeNetwork ?? _selectedNetwork;

  const nativeFeeDenom = useNativeFeeDenom(chainKey, selectedNetwork);
  const gasPriceStep = useGasPriceStepForChain(chainKey);

  if (!gasPriceStep) return undefined;

  return {
    [nativeFeeDenom.coinMinimalDenom]: {
      low: GasPrice.fromString(`${gasPriceStep.low}${nativeFeeDenom.coinMinimalDenom}`),
      medium: GasPrice.fromString(`${gasPriceStep.medium}${nativeFeeDenom.coinMinimalDenom}`),
      high: GasPrice.fromString(`${gasPriceStep.high}${nativeFeeDenom.coinMinimalDenom}`),
    },
  } as const;
}
