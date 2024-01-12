import { calculateFee } from '@cosmjs/stargate';
import { gasAdjustments, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import bn from 'bignumber.js';

import { useChainsStore, useGasAdjustmentsStore, useGasPriceStepsStore } from '../store';

export function validateFee(feeAmount: string, feeDenom: string, gasLimit: number, chain: SupportedChain): boolean {
  const gasPriceOptions = useGasPriceStepsStore.getState().gasPriceSteps;
  const { chains } = useChainsStore.getState();
  const gasAdjustment = useGasAdjustmentsStore.getState().gasAdjustments;
  const chainGasPriceOptions = gasPriceOptions?.[chain] ?? chains[chain].gasPriceStep;
  const chainGasAdjustment = gasAdjustment?.[chain] ?? gasAdjustments[chain];
  const gasPrice = `${chainGasPriceOptions.high}${feeDenom}`;
  const gas = new bn(gasLimit)
    .multipliedBy(chainGasAdjustment ?? 1)
    .integerValue()
    .toNumber();
  const highFee = calculateFee(gas, gasPrice);
  return new bn(feeAmount).lte(highFee.amount[0].amount.toString());
}
