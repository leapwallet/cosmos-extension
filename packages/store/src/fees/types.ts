import { EvmFeeType, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export enum GasOptions {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export type GasPriceStep = Record<EvmFeeType, number>;

export type FeeTokenData = {
  denom: NativeDenom;
  ibcDenom?: string;
  gasPriceStep: GasPriceStep;
};

export type FeeModel = {
  min_gas_price: MinGasPrice;
};

export type MinGasPrice = {
  denom: string;
  amount: string;
};

export type RemoteFeeTokenData = {
  denom: string;
  ibcDenom: string;
  gasPriceStep: GasPriceStep;
};

export type FeeValidationParams = {
  feeDenomData: NativeDenom;
  gaslimit: Long;
  feeAmount: string;
  feeDenom: string;
  chain: SupportedChain;
  maxFeeUsdValue: number;
  feeDenomUsdValue?: string;
  lcdUrl: string;
};

export type IbcDenomData = {
  path: string;
  baseDenom: string;
  originChainId: string;
  sourceChainId?: string;
  channelId: string;
};
