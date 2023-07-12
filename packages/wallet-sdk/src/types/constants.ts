import { NativeDenom, SecretToken, SupportedChain } from '../constants';

export type DenomsRecord = Record<string, NativeDenom>;

type GasEstimates = {
  DEFAULT_GAS_TRANSFER: number;
  DEFAULT_GAS_IBC: number;
  DEFAULT_GAS_STAKE: number;
};

export type DefaultGasEstimatesRecord = Record<SupportedChain, GasEstimates>;

type GasPriceStep = {
  low: number;
  average: number;
  high: number;
};

export type GasPriceStepsRecord = Record<SupportedChain, GasPriceStep>;

export type SnipDenomRecord = Record<string, SecretToken>;
