import { calculateFee } from '@cosmjs/stargate';
import { gasAdjustments, GasPrice, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import bn from 'bignumber.js';

import { getGasPricesForOsmosisFee } from '../fees';
import { useChainsStore, useGasAdjustmentsStore, useGasPriceStepsStore } from '../store';

export function validateFee(
  feeAmount: string,
  feeDenom: string,
  gasLimit: number,
  chain: SupportedChain,
  gasPriceOption: number,
): boolean {
  const gasAdjustment = useGasAdjustmentsStore.getState().gasAdjustments;
  const chainGasAdjustment = gasAdjustment?.[chain] ?? gasAdjustments[chain];
  const gasPrice = `${gasPriceOption}${feeDenom}`;
  const gas = new bn(gasLimit)
    .multipliedBy(chainGasAdjustment ?? 1)
    .integerValue()
    .toNumber();

  const highFee = calculateFee(gas, GasPrice.fromString(gasPrice));
  return new bn(feeAmount).lte(highFee.amount[0].amount.toString());
}

export function validateCosmosFee(
  feeAmount: string,
  feeDenom: string,
  gasLimit: number,
  chain: SupportedChain,
): boolean {
  const gasPriceOptions = useGasPriceStepsStore.getState().gasPriceSteps;
  const { chains } = useChainsStore.getState();
  const chainGasPriceOptions = gasPriceOptions?.[chain] ?? chains[chain].gasPriceStep;
  return validateFee(feeAmount, feeDenom, gasLimit, chain, chainGasPriceOptions.high);
}

export async function validateOsmosisFee(
  feeAmount: string,
  feeDenom: string,
  gasLimit: number,
  chain: SupportedChain,
  lcdUrl: string,
): Promise<boolean> {
  const baseGasPriceOptions = useGasPriceStepsStore.getState().gasPriceSteps;
  const { chains } = useChainsStore.getState();
  const chainGasPriceOptions = baseGasPriceOptions?.[chain] ?? chains[chain].gasPriceStep;
  if (feeDenom === 'uosmo') {
    return validateFee(feeAmount, feeDenom, gasLimit, chain, chainGasPriceOptions.high);
  }

  const denomGasPriceSteps = await getGasPricesForOsmosisFee(lcdUrl, feeDenom, {
    low: chainGasPriceOptions.low,
    medium: chainGasPriceOptions.average,
    high: chainGasPriceOptions.high,
  });

  return validateFee(feeAmount, feeDenom, gasLimit, chain, denomGasPriceSteps.high);
}
