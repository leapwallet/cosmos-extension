import axios from 'axios';
import { GasPriceStepsRecord } from 'types';

import { SupportedChain } from '../constants';

export type FeeModel = {
  min_gas_price: MinGasPrice;
};

export type MinGasPrice = {
  denom: string;
  amount: string;
};

export const roundOf = (value: number, tillDecimal: number) => {
  return Math.round(value * 10 ** tillDecimal) / 10 ** tillDecimal;
};

export const getCoreumGasPrice = async (lcdUrl: string, gasPriceSteps: GasPriceStepsRecord) => {
  const coreumGasLcd1 = 'https://full-node.mainnet-1.coreum.dev:1317';

  const gasPrice1 = await axios.get<FeeModel>(`${coreumGasLcd1}/coreum/feemodel/v1/min_gas_price`);
  const gasPrice2 = await axios.get<FeeModel>(`${lcdUrl}/coreum/feemodel/v1/min_gas_price`);

  const minGasPrice1 = parseFloat(gasPrice1.data.min_gas_price.amount);
  const minGasPrice2 = parseFloat(gasPrice2.data.min_gas_price.amount);

  const defaultGasPrice = gasPriceSteps.coreum?.low ?? 0;
  const minGasPrice = Math.max(minGasPrice1, minGasPrice2, defaultGasPrice);

  return isNaN(minGasPrice) ? defaultGasPrice : minGasPrice;
};

export const getSeiGasPrice = async (gasPriceSteps: GasPriceStepsRecord, chainId: string, chainKey: SupportedChain) => {
  const seiGasJSON = 'https://raw.githubusercontent.com/sei-protocol/chain-registry/main/gas.json';
  const { data } = await axios.get(seiGasJSON);

  const minGas = data[chainId]?.min_gas_price ?? 0;
  const defaultGasPrice = gasPriceSteps[chainKey]?.low ?? 0;

  return Math.max(minGas, defaultGasPrice);
};

export const getOsmosisGasPrice = async (lcdUrl: string, gasPriceSteps: GasPriceStepsRecord) => {
  const url = `${lcdUrl}/osmosis/txfees/v1beta1/cur_eip_base_fee`;
  const { data } = await axios.get(url);

  return roundOf(Number(data.base_fee), 4) ?? gasPriceSteps.osmosis?.low ?? 0;
};

export const getOsmosisGasPriceSteps = async (lcdUrl: string, gasPriceSteps: GasPriceStepsRecord) => {
  const minGasPrice = await getOsmosisGasPrice(lcdUrl ?? '', gasPriceSteps);

  const low = Math.max(gasPriceSteps.osmosis?.low ?? 0, minGasPrice);
  const medium = Math.max(gasPriceSteps.osmosis?.average ?? 0, roundOf(minGasPrice * 1.1, 5));
  const high = Math.max(gasPriceSteps.osmosis?.high ?? 0, roundOf(minGasPrice * 2, 5));

  return { low, medium, high };
};
