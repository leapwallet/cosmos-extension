import {
  fromSmallBN,
  GasPrice,
  getChainId,
  getIsCompass,
  isAptosChain,
  NativeDenom,
  NetworkType,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { ChainApisStore } from 'chains';
import { makeAutoObservable, runInAction } from 'mobx';

import { ChainCosmosSdkStore, ChainInfosStore, RootDenomsStore, TransactionConfigsStore } from '../assets';
import { Currency } from '../types';
import { CurrencyStore } from '../wallet';
import { AptosGasPricesStore } from './aptos-gas-prices-store';
import { DefaultGasEstimatesStore } from './default-gas-estimate-store';
import { EvmGasPricesStore } from './evm-gas-prices-store';
import { FeeDenomsStore } from './fee-denoms-store';
import { FeeTokensStore } from './fee-tokens-store';
import { GasPriceStepForChainStore } from './get-price-step-for-chain-store';
import { FeeTokenData, FeeValidationParams, GasOptions, GasPriceStep } from './types';

type GasPriceOption = { option: GasOptions; gasPrice: GasPrice };
type FeeToken = (FeeTokenData & { gasPriceStep: GasPriceStep }) | undefined;
type ValueOrFunction<T> = T | ((prevValue: T) => T);

export class ChainGasPriceOptionsStore {
  recommendedGasLimit: string;
  finalRecommendedGasLimit: string;
  viewAdditionalOptions = false;
  error: string | null = null;
  feeTokenData: FeeToken;
  userHasSelectedToken: boolean = false;
  feeIbcDenomTracker: { current?: string; previous?: string } = {};
  gasPriceOption?: GasPriceOption;
  feeDenom: NativeDenom & { ibcDenom?: string };
  gasError: string | null = null;
  showFeeSettingSheet = false;
  gasLimit?: string;
  prevFeeRef: string | null = null;

  private defaultGasEstimatesStore: DefaultGasEstimatesStore;
  private chainCosmosSdkStore: ChainCosmosSdkStore;
  private chainInfosStore: ChainInfosStore;
  private feeTokensStore: FeeTokensStore;
  private transactionConfigsStore: TransactionConfigsStore;
  private rootDenomsStore: RootDenomsStore;
  private chainApisStore: ChainApisStore;
  private gasPriceStepForChainStore: GasPriceStepForChainStore;
  private evmGasPricesStore: EvmGasPricesStore;
  private aptosGasPricesStore: AptosGasPricesStore;
  private feeDenomsStore: FeeDenomsStore;
  private activeChain: SupportedChain;
  private selectedNetwork: NetworkType;
  private currencyStore: CurrencyStore;

  constructor(params: {
    activeChain: SupportedChain;
    selectedNetwork: NetworkType;
    defaultGasEstimatesStore: DefaultGasEstimatesStore;
    chainCosmosSdkStore: ChainCosmosSdkStore;
    chainInfosStore: ChainInfosStore;
    feeTokensStore: FeeTokensStore;
    transactionConfigsStore: TransactionConfigsStore;
    rootDenomsStore: RootDenomsStore;
    chainApisStore: ChainApisStore;
    gasPriceStepForChainStore: GasPriceStepForChainStore;
    evmGasPricesStore: EvmGasPricesStore;
    aptosGasPricesStore: AptosGasPricesStore;
    feeDenomsStore: FeeDenomsStore;
    currencyStore: CurrencyStore;
  }) {
    this.activeChain = params.activeChain;
    this.selectedNetwork = params.selectedNetwork;
    this.defaultGasEstimatesStore = params.defaultGasEstimatesStore;
    this.chainCosmosSdkStore = params.chainCosmosSdkStore;
    this.chainInfosStore = params.chainInfosStore;
    this.feeTokensStore = params.feeTokensStore;
    this.transactionConfigsStore = params.transactionConfigsStore;
    this.rootDenomsStore = params.rootDenomsStore;
    this.chainApisStore = params.chainApisStore;
    this.gasPriceStepForChainStore = params.gasPriceStepForChainStore;
    this.evmGasPricesStore = params.evmGasPricesStore;
    this.aptosGasPricesStore = params.aptosGasPricesStore;
    this.feeDenomsStore = params.feeDenomsStore;
    this.currencyStore = params.currencyStore;

    this.recommendedGasLimit =
      this.defaultGasEstimatesStore.estimate?.[this.activeChain]?.DEFAULT_GAS_TRANSFER?.toString() || '0';
    this.finalRecommendedGasLimit = this.recommendedGasLimit;
    this.gasLimit == this.finalRecommendedGasLimit;
    this.feeDenom = this.feeDenomsStore.getNativeFeeDenom(
      this.rootDenomsStore.allDenoms,
      this.activeChain,
      this.selectedNetwork,
    );

    (async () => {
      const defaultGasPrice = await this.getDefaultGasPrice();

      this.gasPriceOption = {
        option: GasOptions.LOW,
        gasPrice: defaultGasPrice,
      };
    })();

    makeAutoObservable(this);
  }

  get nonNativeTokenGasLimitMultiplier() {
    if (this.activeChain === 'osmosis') {
      return 1.25;
    }

    return 1.05;
  }

  async getDefaultGasPrice(
    params: {
      feeDenom?: NativeDenom & { ibcDenom?: string };
      isSeiEvmTx?: boolean;
    } = {},
  ) {
    let lowGasPrice: number = 0;
    if (params.isSeiEvmTx || this.chainInfosStore.chainInfos[this.activeChain].evmOnlyChain) {
      const res = await this.evmGasPricesStore.getStore(this.activeChain, this.selectedNetwork)?.getData();
      lowGasPrice = res?.gasPrice?.low || 0;
    } else if (isAptosChain(this.activeChain)) {
      const res = await this.aptosGasPricesStore.getStore(this.activeChain, this.selectedNetwork)?.getData();
      lowGasPrice = res?.gasPrice?.low || 0;
    } else {
      lowGasPrice = await this.gasPriceStepForChainStore.getLowGasPriceStep(this.activeChain, this.selectedNetwork);
    }

    const nativeFeeDenom = this.feeDenomsStore.getNativeFeeDenom(
      this.rootDenomsStore.allDenoms,
      this.activeChain,
      this.selectedNetwork,
    );

    const feeDenom = params?.feeDenom ?? (nativeFeeDenom as NativeDenom & { ibcDenom?: string });

    return GasPrice.fromUserInput(
      new BigNumber(lowGasPrice).toString(),
      feeDenom?.ibcDenom ?? feeDenom?.coinMinimalDenom ?? '',
    );
  }

  handleGasPriceOptionChange(gasPriceOption: GasPriceOption, feeBaseDenom: FeeTokenData) {
    this.setGasPriceOption(gasPriceOption);
    this.setFeeDenom({ ...feeBaseDenom.denom, ibcDenom: feeBaseDenom.ibcDenom });
  }

  setUserHasSelectedToken(value: ValueOrFunction<boolean>) {
    runInAction(() => {
      if (typeof value === 'function') {
        value = value(this.userHasSelectedToken);
      }

      this.userHasSelectedToken = value;
    });
  }

  setFeeTokenData(value: ValueOrFunction<FeeToken>) {
    runInAction(() => {
      if (typeof value === 'function') {
        value = value(this.feeTokenData);
      }

      this.feeTokenData = value;
    });
  }

  setFeeDenom(value: ValueOrFunction<NativeDenom & { ibcDenom?: string }>) {
    runInAction(() => {
      if (typeof value === 'function') {
        value = value(this.feeDenom);
      }

      this.feeDenom = value;
    });
  }

  setFinalRecommendedGasLimit(value: ValueOrFunction<string>) {
    runInAction(() => {
      if (typeof value === 'function') {
        value = value(this.finalRecommendedGasLimit);
      }

      this.finalRecommendedGasLimit = value;
    });
  }

  setViewAdditionalPriceOptions(flag: boolean) {
    runInAction(() => {
      this.viewAdditionalOptions = flag;
    });
  }

  setGasLimit(value: ValueOrFunction<string | BigNumber | undefined>) {
    runInAction(() => {
      if (typeof value === 'function') {
        value = value(this.gasLimit);
      }

      this.gasLimit = value?.toString();
    });
  }

  setGasPriceOption(value: ValueOrFunction<GasPriceOption>) {
    runInAction(() => {
      if (typeof value === 'function') {
        value = value(this.gasPriceOption!);
      }

      this.gasPriceOption = value;
    });
  }

  setError(value: ValueOrFunction<string | null>) {
    runInAction(() => {
      if (typeof value === 'function') {
        value = value(this.error);
      }

      this.error = value;
    });
  }

  setGasError(value: ValueOrFunction<string | null>) {
    runInAction(() => {
      if (typeof value === 'function') {
        value = value(this.gasError);
      }

      this.gasError = value;
    });
  }

  get isSeiEvmChain() {
    return getIsCompass() && (this.activeChain === 'seiDevnet' || this.activeChain === 'seiTestnet2');
  }

  get hasToCalculateDynamicFee() {
    const chainId = getChainId(this.chainInfosStore.chainInfos[this.activeChain], this.selectedNetwork);

    if (chainId) {
      return this.chainCosmosSdkStore.chainCosmosSdk?.[chainId]?.dynamic_fee_market ?? false;
    }

    return false;
  }

  private async feeValidation({ feeDenomData, feeAmount, feeDenomUsdValue, maxFeeUsdValue }: FeeValidationParams) {
    if (!feeDenomUsdValue) return null;
    let isValidUsdValue = false;
    if (feeDenomUsdValue) {
      const feeAmountUsd = fromSmallBN(feeAmount, feeDenomData.coinDecimals).multipliedBy(feeDenomUsdValue);
      isValidUsdValue = feeAmountUsd.lt(maxFeeUsdValue);
    }
    return isValidUsdValue;
  }

  async validateFees(
    feeValidationParams: Omit<FeeValidationParams, 'feeDenomData' | 'maxFeeUsdValue' | 'feeDenomUsdValue' | 'lcdUrl'>,
    onValidationFailed: (tokenData: NativeDenom, isFeesValid: boolean | null) => void,
    fetchCurrency: (
      quantity: string,
      token: string | undefined,
      chain: SupportedChain,
      currencySelected: Currency,
      alternatePriceKey?: string,
    ) => Promise<string | undefined>,
  ) {
    const [txConfig, feeTokens] = await Promise.all([
      this.transactionConfigsStore.getData(),
      this.feeTokensStore.getStore(this.activeChain, this.selectedNetwork)?.getData(),
    ]);
    const maxFeeUsdValue = txConfig?.allChains.maxFeeValueUSD ?? 10;
    const feeToken = feeTokens?.find(({ ibcDenom, denom }) => {
      if (ibcDenom === feeValidationParams.feeDenom) {
        return ibcDenom === feeValidationParams.feeDenom;
      }
      return denom?.coinMinimalDenom === feeValidationParams.feeDenom;
    });

    let feeDenomData = feeToken?.denom;
    if (!feeDenomData) {
      feeDenomData = this.rootDenomsStore.allDenoms[feeValidationParams.feeDenom];
    }

    let usdValue;
    if (feeDenomData?.chain) {
      const chainId = getChainId(this.chainInfosStore.chainInfos[this.activeChain], this.selectedNetwork);

      usdValue = await fetchCurrency(
        '1',
        feeDenomData.coinGeckoId,
        feeDenomData.chain as SupportedChain,
        this.currencyStore.preferredCurrency,
        `${chainId}-${feeDenomData.coinMinimalDenom}`,
      );
    }

    const { lcdUrl = '' } = await this.chainApisStore.getChainApis(this.activeChain, this.selectedNetwork);

    const isFeeValid = await this.feeValidation({
      feeDenomData,
      maxFeeUsdValue,
      feeDenomUsdValue: usdValue,
      lcdUrl,
      ...feeValidationParams,
    });

    if (!isFeeValid) onValidationFailed(feeDenomData, isFeeValid);
    return isFeeValid;
  }
}

// replaces useFeeValidation
export class GasPriceOptionsStore {
  private defaultGasEstimatesStore: DefaultGasEstimatesStore;
  private chainCosmosSdkStore: ChainCosmosSdkStore;
  private chainInfosStore: ChainInfosStore;
  private feeTokensStore: FeeTokensStore;
  private transactionConfigsStore: TransactionConfigsStore;
  private rootDenomsStore: RootDenomsStore;
  private chainApisStore: ChainApisStore;
  private gasPriceStepForChainStore: GasPriceStepForChainStore;
  private evmGasPricesStore: EvmGasPricesStore;
  private aptosGasPricesStore: AptosGasPricesStore;
  private feeDenomsStore: FeeDenomsStore;
  private currencyStore: CurrencyStore;

  private store = {} as Record<`${SupportedChain}-${NetworkType}`, ChainGasPriceOptionsStore>;

  constructor(params: {
    defaultGasEstimatesStore: DefaultGasEstimatesStore;
    chainCosmosSdkStore: ChainCosmosSdkStore;
    chainInfosStore: ChainInfosStore;
    feeTokensStore: FeeTokensStore;
    transactionConfigsStore: TransactionConfigsStore;
    rootDenomsStore: RootDenomsStore;
    chainApisStore: ChainApisStore;
    gasPriceStepForChainStore: GasPriceStepForChainStore;
    evmGasPricesStore: EvmGasPricesStore;
    aptosGasPricesStore: AptosGasPricesStore;
    feeDenomsStore: FeeDenomsStore;
    currencyStore: CurrencyStore;
  }) {
    this.defaultGasEstimatesStore = params.defaultGasEstimatesStore;
    this.chainCosmosSdkStore = params.chainCosmosSdkStore;
    this.chainInfosStore = params.chainInfosStore;
    this.feeTokensStore = params.feeTokensStore;
    this.transactionConfigsStore = params.transactionConfigsStore;
    this.rootDenomsStore = params.rootDenomsStore;
    this.chainApisStore = params.chainApisStore;
    this.gasPriceStepForChainStore = params.gasPriceStepForChainStore;
    this.evmGasPricesStore = params.evmGasPricesStore;
    this.aptosGasPricesStore = params.aptosGasPricesStore;
    this.feeDenomsStore = params.feeDenomsStore;
    this.currencyStore = params.currencyStore;
  }

  getStore(activeChain: SupportedChain, selectedNetwork: NetworkType) {
    const key = `${activeChain}-${selectedNetwork}` as const;

    if (!this.store[key]) {
      this.store[key] = new ChainGasPriceOptionsStore({
        activeChain,
        selectedNetwork,
        defaultGasEstimatesStore: this.defaultGasEstimatesStore,
        chainCosmosSdkStore: this.chainCosmosSdkStore,
        chainInfosStore: this.chainInfosStore,
        feeTokensStore: this.feeTokensStore,
        transactionConfigsStore: this.transactionConfigsStore,
        rootDenomsStore: this.rootDenomsStore,
        chainApisStore: this.chainApisStore,
        gasPriceStepForChainStore: this.gasPriceStepForChainStore,
        evmGasPricesStore: this.evmGasPricesStore,
        aptosGasPricesStore: this.aptosGasPricesStore,
        feeDenomsStore: this.feeDenomsStore,
        currencyStore: this.currencyStore,
      });
    }

    return this.store[key];
  }
}
