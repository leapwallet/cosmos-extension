import { AxiosRequestConfig } from 'axios';

import { Bech32Config } from './bech32';
import { BIP44 } from './bip44';
import { AppCurrency, Currency } from './currency';

export interface ChainInfo {
  readonly rpc: string;
  readonly rpcConfig?: AxiosRequestConfig;
  readonly rest: string;
  readonly restConfig?: AxiosRequestConfig;
  readonly chainId: string;
  readonly chainName: string;

  readonly stakeCurrency?: Currency;
  readonly walletUrl?: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config: Bech32Config;

  readonly currencies: AppCurrency[];

  readonly feeCurrencies: Currency[];

  readonly coinType?: number;

  readonly gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
  readonly features?: string[];
  readonly apiStatus?: boolean;
  readonly beta?: boolean;
  readonly image?: string;
  readonly theme?: {
    primaryColor?: string;
    gradient?: string;
  };
  readonly chainRegistryPath?: string;
}
