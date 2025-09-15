/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Coin } from '@cosmjs/amino';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, coin, StdFee } from '@cosmjs/stargate';
import {
  DEFAULT_GAS_REDELEGATE,
  DefaultGasEstimates,
  defaultGasPriceStep,
  Delegation,
  DenomsRecord,
  EthermintTxHandler,
  fromSmall,
  GasPrice,
  getOsmosisGasPriceSteps,
  getSimulationFee,
  InjectiveTx,
  LedgerError,
  NativeDenom,
  RewardsResponse,
  simulateCancelUndelegation,
  simulateDelegate,
  simulateRedelegate,
  simulateUndelegate,
  simulateWithdrawRewards,
  SupportedChain,
  toSmall,
  Tx,
  UnbondingDelegation,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk';
import { Network } from '@leapwallet/cosmos-wallet-sdk/dist/browser/stake/network';
import {
  ChainClaimRewards,
  ChainDelegations,
  ChainUndelegations,
  ChainValidators,
  Undelegations,
} from '@leapwallet/cosmos-wallet-store/dist/types';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import { currencyDetail, useformatCurrency, useUserPreferredCurrency } from '../settings';
import {
  getGasEstimateCacheKey,
  useActiveChain,
  useActiveWalletStore,
  useAddress,
  useChainApis,
  useChainsStore,
  useDefaultGasEstimates,
  useGasEstimateCache,
  useGasPriceSteps,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
  useUpdateGasEstimateCache,
} from '../store';
import { useTxHandler } from '../tx';
import { STAKE_MODE, Token, TxCallback, WALLETTYPE } from '../types';
import {
  GasOptions,
  getChainId,
  getMetaDataForClaimRewardsTx,
  getMetaDataForDelegateTx,
  getMetaDataForRedelegateTx,
  getTxnLogAmountValue,
  SelectedNetwork,
  useActiveStakingDenom,
  useGasRateQuery,
  useGetGasPrice,
  useNativeFeeDenom,
} from '../utils';
import { fetchCurrency } from '../utils/findUSDValue';
import { getNativeDenom } from '../utils/getNativeDenom';
import { capitalize, formatTokenAmount, sliceWord } from '../utils/strings';
import { useChainId, useGetFeeMarketGasPricesSteps, useHasToCalculateDynamicFee } from '../utils-hooks';

type StakeTxHandler = Tx | InjectiveTx | EthermintTxHandler;

function getStakeTxType(mode: STAKE_MODE): CosmosTxType {
  switch (mode) {
    case 'DELEGATE':
      return CosmosTxType.StakeDelegate;
    case 'UNDELEGATE':
      return CosmosTxType.StakeUndelegate;
    case 'REDELEGATE':
      return CosmosTxType.StakeRedelgate;
    case 'CANCEL_UNDELEGATION':
      return CosmosTxType.StakeCancelUndelegate;
    default:
      return CosmosTxType.StakeClaim;
  }
}

export function useInvalidateDelegations(
  denoms: DenomsRecord,
  delegations: ChainDelegations,
  validators: ChainValidators,
  unDelegations: ChainUndelegations,
  claimRewards: ChainClaimRewards,
  forceChain?: SupportedChain,
  forceNetwork?: SelectedNetwork,
) {
  const { refetchDelegations, refetchUnboundingDelegations } = useStaking(
    denoms,
    delegations,
    validators,
    unDelegations,
    claimRewards,
    forceChain,
    forceNetwork,
  );

  return useCallback(() => {
    refetchDelegations();
    refetchUnboundingDelegations();
  }, []);
}

interface Staking {
  isTestnet: boolean;
  rewards: RewardsResponse | undefined;
  totalRewardsDollarAmt: string | undefined;
  formattedTotalRewardAmount: string | undefined;
  totalRewards: string | undefined;
  network: Network | undefined;
  minMaxApr: number[] | undefined;
  delegations: Record<string, Delegation>;
  totalDelegation: BigNumber | undefined;
  token: Token | undefined;
  totalDelegationAmount: string | undefined;
  currencyAmountDelegation: string | undefined;
  unboundingDelegationsInfo: Undelegations | undefined;
  loadingUnboundingDelegations: boolean;
  loadingRewards: boolean;
  isFetchingRewards: boolean;
  loadingNetwork: boolean;
  loadingDelegations: boolean;
  refetchAllStakingData: () => Promise<void>;
  refetchDelegations: () => Promise<void>;
  refetchDelegatorRewards: () => Promise<void>;
  refetchNetwork: () => Promise<void>;
  refetchUnboundingDelegations: () => Promise<void>;
}

export function useStaking(
  denoms: DenomsRecord,
  delegations: ChainDelegations,
  validators: ChainValidators,
  unDelegations: ChainUndelegations,
  claimRewards: ChainClaimRewards,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
  allAssets?: Token[],
): Staking {
  const isTestnet = useSelectedNetwork() === 'testnet';
  const { delegationInfo, loadingDelegations, refetchDelegations } = delegations;
  const { validatorData, validatorDataStatus, refetchNetwork } = validators;
  const { unboundingDelegationsInfo, loadingUnboundingDegStatus, refetchUnboundingDelegations } = unDelegations;
  const { rewards, loadingRewardsStatus, isFetchingRewards, refetchDelegatorRewards } = claimRewards;

  const [activeStakingDenom] = useActiveStakingDenom(denoms, forceChain, forceNetwork);
  const token = allAssets?.find((e) => e.symbol === activeStakingDenom.coinDenom);

  const networkData = useMemo(() => {
    if (validatorData?.chainData && validatorData?.validators)
      return new Network(validatorData?.chainData, validatorData?.validators);
    else return;
  }, [validatorData, validatorData?.chainData, validatorData?.validators]);

  const loadingUnboundingDelegations =
    loadingUnboundingDegStatus !== 'success' && loadingUnboundingDegStatus !== 'error';
  const loadingRewards = loadingRewardsStatus !== 'success' && loadingRewardsStatus !== 'error';
  const loadingNetwork = validatorDataStatus !== 'success' && validatorDataStatus !== 'error';

  const refetchAllStakingData = async () => {
    await refetchDelegations();
    await refetchDelegatorRewards();
    await refetchNetwork();
    await refetchUnboundingDelegations();
  };

  return {
    isTestnet,
    rewards: rewards?.result,
    totalRewardsDollarAmt: rewards?.totalRewardsDollarAmt,
    formattedTotalRewardAmount: rewards?.formattedTotalRewards,
    totalRewards: rewards?.totalRewards,
    network: networkData,
    minMaxApr: networkData?.minMaxApr,
    delegations: delegationInfo?.delegations,
    totalDelegation: delegationInfo?.totalDelegation,
    token,
    totalDelegationAmount: delegationInfo?.totalDelegationAmount,
    currencyAmountDelegation: delegationInfo?.currencyAmountDelegation,
    unboundingDelegationsInfo,
    loadingUnboundingDelegations,
    loadingRewards: loadingRewards,
    isFetchingRewards,
    loadingNetwork: loadingNetwork,
    loadingDelegations,
    refetchAllStakingData,
    refetchDelegations,
    refetchDelegatorRewards,
    refetchNetwork,
    refetchUnboundingDelegations,
  };
}

export function useSimulateStakeTx(
  denoms: DenomsRecord,
  mode: STAKE_MODE,
  toValidator: Validator,
  fromValidator?: Validator,
  delegations?: Delegation[],
) {
  const address = useAddress();
  const { lcdUrl } = useChainApis();
  const activeChain = useActiveChain();
  const [activeStakingDenom] = useActiveStakingDenom(denoms);

  const getAmount = useCallback(
    (amount: string) => {
      switch (mode) {
        case 'REDELEGATE':
          return coin(toSmall(amount, activeStakingDenom.coinDecimals), delegations?.[0].balance.denom ?? '');

        case 'DELEGATE':
        case 'UNDELEGATE':
          return coin(toSmall(amount, activeStakingDenom.coinDecimals), activeStakingDenom.coinMinimalDenom);

        case 'CANCEL_UNDELEGATION':
          return coin(toSmall(amount, activeStakingDenom.coinDecimals), activeStakingDenom.coinMinimalDenom);

        default:
          return coin(toSmall('0'), activeStakingDenom.coinMinimalDenom);
      }
    },
    [mode, delegations, activeStakingDenom.coinDecimals, activeStakingDenom.coinMinimalDenom],
  );

  const simulateTx = useCallback(
    async (_amount: string, feeDenom: string, creationHeight?: string) => {
      const amount = getAmount(_amount);
      const fee = getSimulationFee(feeDenom);
      switch (mode) {
        case 'REDELEGATE':
          return await simulateRedelegate(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            fromValidator?.address ?? '',
            amount,
            fee,
            activeChain,
          );

        case 'DELEGATE':
          return await simulateDelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount, fee, activeChain);

        case 'CLAIM_REWARDS': {
          const validators =
            (toValidator ? [toValidator.operator_address] : delegations?.map((d) => d.delegation.validator_address)) ??
            [];
          return await simulateWithdrawRewards(lcdUrl ?? '', address, validators, fee);
        }

        case 'CANCEL_UNDELEGATION': {
          return await simulateCancelUndelegation(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            amount,
            creationHeight ?? '',
            fee,
            activeChain,
          );
        }

        case 'UNDELEGATE':
          return await simulateUndelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount, fee, activeChain);
      }
    },
    [address, toValidator, fromValidator, mode, delegations, activeChain],
  );

  return simulateTx;
}

export function useStakeTx(
  denoms: DenomsRecord,
  mode: STAKE_MODE,
  toValidator: Validator,
  fromValidator?: Validator,
  delegations?: Delegation[],
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  // HOOKS

  const chainInfos = useGetChains();
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [forceNetwork, _selectedNetwork]);

  const getTxHandler = useTxHandler({
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });
  const { activeWallet } = useActiveWalletStore();
  const address = useAddress(activeChain);
  const [preferredCurrency] = useUserPreferredCurrency();
  const [formatCurrency] = useformatCurrency();
  const { setPendingTx } = usePendingTxState();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const defaultGasEstimates = useDefaultGasEstimates();
  const gasPriceSteps = useGasPriceSteps();
  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, selectedNetwork);

  // STATES
  const [memo, setMemo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [creationHeight, setCreationHeight] = useState<string>('');
  const [fees, setFees] = useState<StdFee>();
  const [currencyFees, setCurrencyFees] = useState<string>();
  const [error, setError] = useState<string>();
  const [simulationError, setSimulationError] = useState<string>();
  const [ledgerError, setLedgerErrorMsg] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);
  const [showKeystonePopup, setShowKeystonePopup] = useState(false);
  const [, setGasPriceFactor] = useState<'low' | 'average' | 'high'>('low');

  const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const getGasPrice = useGetGasPrice(activeChain, selectedNetwork);
  const activeChainId = useChainId(activeChain, selectedNetwork);

  /**
   * Fee calculation
   */

  const gasAdjustment = useGasAdjustmentForChain(activeChain);
  const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork);
  const gasPrices = useGasRateQuery(denoms, activeChain, selectedNetwork);
  const hasToCalculateDynamicFee = useHasToCalculateDynamicFee(activeChain, selectedNetwork);
  const getFeeMarketGasPricesSteps = useGetFeeMarketGasPricesSteps(activeChain, selectedNetwork);

  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom);
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [gasPriceOptions, setGasPriceOptions] = useState(gasPrices?.[feeDenom.coinMinimalDenom]);
  const gasEstimateCache = useGasEstimateCache();
  const updateGasEstimateCache = useUpdateGasEstimateCache();

  const cachedGasEstimate = useMemo(() => {
    if (!activeChainId) return;
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption];
    let _feeDenom = feeDenom?.ibcDenom || feeDenom?.coinMinimalDenom;
    if (!_feeDenom && _gasPrice) {
      _feeDenom = _gasPrice.denom;
    }
    const key = getGasEstimateCacheKey(activeChainId, mode, _feeDenom);
    return gasEstimateCache[key];
  }, [
    activeChainId,
    feeDenom.coinMinimalDenom,
    gasEstimateCache,
    gasOption,
    gasPriceOptions,
    mode,
    userPreferredGasPrice,
  ]);

  const [recommendedGasLimit, setRecommendedGasLimit] = useState(() => {
    if (cachedGasEstimate) return cachedGasEstimate.toString();
    if (mode === 'REDELEGATE') return DEFAULT_GAS_REDELEGATE.toString();
    return defaultGasEstimates[activeChain]?.DEFAULT_GAS_STAKE.toString() ?? DefaultGasEstimates.DEFAULT_GAS_STAKE;
  });

  useEffect(() => {
    (async function () {
      if (feeDenom.coinMinimalDenom === 'uosmo' && activeChain === 'osmosis') {
        const { low, medium, high } = await getOsmosisGasPriceSteps(lcdUrl ?? '', gasPriceSteps);
        setGasPriceOptions({
          low: GasPrice.fromString(`${low}${feeDenom.coinMinimalDenom}`),
          medium: GasPrice.fromString(`${medium}${feeDenom.coinMinimalDenom}`),
          high: GasPrice.fromString(`${high}${feeDenom.coinMinimalDenom}`),
        });
      } else if (hasToCalculateDynamicFee && feeDenom.coinMinimalDenom === nativeFeeDenom?.coinMinimalDenom) {
        const { low, medium, high } = await getFeeMarketGasPricesSteps(feeDenom.coinMinimalDenom);

        setGasPriceOptions({
          low: GasPrice.fromString(`${low}${feeDenom.coinMinimalDenom}`),
          medium: GasPrice.fromString(`${medium}${feeDenom.coinMinimalDenom}`),
          high: GasPrice.fromString(`${high}${feeDenom.coinMinimalDenom}`),
        });
      }
    })();
  }, [
    feeDenom.coinMinimalDenom,
    gasOption,
    recommendedGasLimit,
    userPreferredGasLimit,
    userPreferredGasPrice,
    activeChain,
    selectedNetwork,
    hasToCalculateDynamicFee,
    nativeFeeDenom?.coinMinimalDenom,
  ]);

  const customFee = useMemo(() => {
    const _gasLimit = userPreferredGasLimit ?? Number(recommendedGasLimit);
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption];
    if (!_gasPrice) return;

    return calculateFee(Math.ceil(_gasLimit * gasAdjustment), _gasPrice);
  }, [
    gasPriceOptions,
    gasOption,
    recommendedGasLimit,
    userPreferredGasLimit,
    userPreferredGasPrice,
    activeChain,
    feeDenom.coinMinimalDenom,
  ]);

  /**
   * Currency Calculation Selected Token
   */
  const { data: tokenFiatValue } = useQuery(['use-staking-native-denom-fiat-value', denom], async () => {
    const _denom = denoms[denom.coinMinimalDenom];

    if (_denom) {
      const denomChainInfo = chainInfos[_denom.chain as SupportedChain];
      const _chainId = getChainId(denomChainInfo, selectedNetwork);
      const price = await fetchCurrency(
        '1',
        _denom.coinGeckoId,
        _denom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
        `${_chainId}-${_denom.coinMinimalDenom}`,
      );

      return price;
    }

    return;
  });

  // FUNCTIONS
  const handleSimulationError = (errorMsg: string) => {
    if (errorMsg.includes('currently jailed')) {
      setSimulationError('This validator is currently jailed');
    } else if (errorMsg.includes('tx parse error')) {
      setSimulationError('Not Supported');
    } else {
      setSimulationError(errorMsg);
    }
  };
  const onTxSuccess = async (promise: any, txHash: string, callback?: TxCallback) => {
    const amtKey = mode === 'UNDELEGATE' || mode === 'CLAIM_REWARDS' ? 'receivedAmount' : 'sentAmount';
    const usdAmtKey = mode === 'UNDELEGATE' || mode === 'CLAIM_REWARDS' ? 'receivedUsdValue' : 'sentUsdValue';
    let title = mode === 'CLAIM_REWARDS' ? 'claim rewards' : mode.toLowerCase();
    switch (mode) {
      case 'CLAIM_REWARDS':
        title = 'claim rewards';
        break;
      case 'CANCEL_UNDELEGATION':
        title = 'Unstaking Cancelled';
        break;
      default:
        title = mode.toLowerCase();
        break;
    }

    let subtitle1: string;
    if (mode === 'CLAIM_REWARDS') {
      subtitle1 = `From ${
        ((toValidator ? [toValidator.operator_address] : delegations?.map((d) => d.delegation.validator_address)) ?? [])
          .length
      } validators`;
    } else {
      subtitle1 = `Validator ${toValidator?.moniker ?? 'Unkown'}`;
    }

    let subtitle2: string = '';
    const value = formatTokenAmount(amount, activeStakingDenom.coinDenom, 4);

    switch (mode) {
      case 'DELEGATE':
        subtitle2 = `You staked ${value} to ${sliceWord(
          toValidator.moniker,
          15,
        )}. Your rewards will start accumulating shortly`;
        break;
      case 'UNDELEGATE':
        subtitle2 = `You unstaked ${value} from ${sliceWord(
          toValidator.moniker,
          15,
        )}. Funds will be available after the unbonding period`;
        break;
      case 'REDELEGATE':
        subtitle2 = `You redelegated ${value} to ${toValidator.moniker} successfully`;
        break;
      case 'CANCEL_UNDELEGATION':
        subtitle2 = `You cancelled unstake of ${value} successfully`;
        break;
      case 'CLAIM_REWARDS':
        subtitle2 = (delegations ?? []).length > 0 ? `You claimed ${value} from ${delegations?.length} validators` : '';
    }

    setPendingTx({
      img: chainInfos[activeChain].chainSymbolImageUrl,
      [amtKey]: formatTokenAmount(amount, activeStakingDenom.coinDenom, 4),
      [usdAmtKey]: formatCurrency(new BigNumber(amount).multipliedBy(tokenFiatValue ?? '')),
      sentTokenInfo: denom,
      title1: `${capitalize(title)}`,
      subtitle1,
      subtitle2,
      title2: 'Transaction Successful',
      txStatus: 'loading',
      txType: mode === 'DELEGATE' || mode === 'REDELEGATE' ? 'delegate' : 'undelegate',
      promise,
      txHash,
      sourceChain: activeChain,
      sourceNetwork: selectedNetwork,
    });
    if (showLedgerPopup) {
      setShowLedgerPopup(false);
    }
    if (showKeystonePopup) {
      setShowKeystonePopup(false);
    }
    callback?.('success');
  };

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const setLedgerError = useCallback((error?: string) => {
    setLedgerErrorMsg(error);
    setShowLedgerPopup(false);
  }, []);

  const simulateTx = useCallback(
    (amount: Coin, feeDenom: string, creationHeight?: string) => {
      const fee = getSimulationFee(feeDenom, '1');
      switch (mode) {
        case 'REDELEGATE':
          return simulateRedelegate(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            fromValidator?.address ?? '',
            amount,
            fee,
            activeChain,
          );

        case 'DELEGATE':
          return simulateDelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount, fee, activeChain);

        case 'CLAIM_REWARDS': {
          const validators =
            (toValidator ? [toValidator.operator_address] : delegations?.map((d) => d.delegation.validator_address)) ??
            [];
          return simulateWithdrawRewards(lcdUrl ?? '', address, validators, fee);
        }

        case 'CANCEL_UNDELEGATION':
          return simulateCancelUndelegation(
            lcdUrl ?? '',
            address,
            toValidator.address ?? '',
            amount,
            creationHeight ?? '',
            fee,
            activeChain,
          );

        case 'UNDELEGATE':
          return simulateUndelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount, fee, activeChain);
      }
    },
    [address, toValidator, fromValidator, memo, mode, delegations, activeChain],
  );

  const executeTx = useCallback(
    async (amount: Coin, fee: StdFee, txHandler: StakeTxHandler, creationHeight?: string) => {
      switch (mode) {
        case 'UNDELEGATE': {
          return await txHandler.unDelegate(address, toValidator?.address ?? '', amount, fee, memo);
        }

        case 'CLAIM_REWARDS': {
          const validators =
            (toValidator ? [toValidator.operator_address] : delegations?.map((d) => d.delegation.validator_address)) ??
            [];

          return await txHandler.withdrawRewards(address, validators, fee, memo);
        }

        case 'DELEGATE': {
          return await txHandler.delegate(address, toValidator?.address ?? '', amount, fee, memo);
        }

        case 'CANCEL_UNDELEGATION': {
          return await (txHandler as Tx).cancelUnDelegation(
            address,
            toValidator?.address ?? '',
            amount,
            creationHeight ?? '',
            fee,
            memo,
          );
        }

        case 'REDELEGATE': {
          return await txHandler.reDelegate(
            address,
            toValidator?.address ?? '',
            fromValidator?.address ?? '',
            amount,
            fee,
            memo,
          );
        }
      }
    },
    [address, toValidator, fromValidator, memo, mode, delegations],
  );

  const getAmount = useCallback(
    (amount: string) => {
      switch (mode) {
        case 'REDELEGATE':
          return coin(toSmall(amount, activeStakingDenom.coinDecimals), delegations?.[0].balance.denom ?? '');

        case 'DELEGATE':
        case 'UNDELEGATE':
          return coin(toSmall(amount, activeStakingDenom.coinDecimals), activeStakingDenom.coinMinimalDenom);

        case 'CANCEL_UNDELEGATION':
          return coin(toSmall(amount, activeStakingDenom.coinDecimals), activeStakingDenom.coinMinimalDenom);

        default:
          return coin(toSmall('0'), activeStakingDenom.coinMinimalDenom);
      }
    },
    [mode, activeStakingDenom?.coinDecimals, activeStakingDenom?.coinMinimalDenom, delegations],
  );

  const executeDelegateTx = async ({
    wallet,
    callback,
    isSimulation = true,
    customFee,
    simulationParams,
  }: {
    wallet?: OfflineSigner;
    callback?: TxCallback;
    isSimulation: boolean;
    customFee?: {
      stdFee: StdFee | undefined;
      feeDenom: NativeDenom;
    };
    simulationParams?: {
      forceSimulationFeeDenom?: string;
    };
  }) => {
    if (isLoading || !address || !activeChain) {
      return;
    }
    if (mode === 'REDELEGATE' && (!toValidator || !fromValidator || !delegations)) {
      return;
    }
    if (mode === 'CLAIM_REWARDS' && (!delegations?.length || new BigNumber(amount).lte(0.00001))) {
      setError('Reward is too low');
      return;
    }
    if ((mode === 'DELEGATE' || mode === 'UNDELEGATE') && !toValidator) {
      return;
    }

    setError(undefined);

    if (!amount || new BigNumber(amount).lte(0)) {
      setFees(undefined);
      setCurrencyFees('');
      return;
    }

    setLoading(true);

    try {
      const isLedgerWallet = activeWallet?.walletType === WALLETTYPE.LEDGER;
      const isKeystoneWallet = activeWallet?.walletType === WALLETTYPE.KEYSTONE;
      const tx: StakeTxHandler | undefined = !isSimulation && wallet ? await getTxHandler(wallet) : undefined;

      const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
      const amt = getAmount(amount);

      let fee: StdFee;
      let feeDenom: NativeDenom;

      if (customFee !== undefined && customFee.stdFee) {
        fee = customFee.stdFee;
        feeDenom = customFee.feeDenom;
      } else {
        let gasPrice = await getGasPrice();
        if (activeChain === 'akash') {
          gasPrice = GasPrice.fromString(
            `${(gasPriceSteps[activeChain]?.high ?? defaultGasPriceStep.high).toString()}${
              denoms.uakt.coinMinimalDenom
            }`,
          );
        }

        const defaultGasStake =
          defaultGasEstimates[activeChain]?.DEFAULT_GAS_STAKE || DefaultGasEstimates.DEFAULT_GAS_STAKE;
        let gasEstimate = defaultGasStake;

        if (mode === 'CLAIM_REWARDS' && delegations) {
          gasEstimate = defaultGasStake * Math.max(delegations?.length, 1);
        }

        const simulationFeeDenom = simulationParams?.forceSimulationFeeDenom ?? gasPrice.denom;

        try {
          const { gasUsed } = await simulateTx(amt, simulationFeeDenom, creationHeight);
          gasEstimate = gasUsed;
          setRecommendedGasLimit(gasUsed.toString());
          updateGasEstimateCache({
            chainId: activeChainId,
            txType: mode,
            feeDenom: simulationFeeDenom,
            gasEstimate: gasUsed,
          });
        } catch (error: any) {
          if (error.message.includes('redelegation to this validator already in progress')) {
            setError(error.message);
            return;
          } else if (mode === 'CANCEL_UNDELEGATION') {
            handleSimulationError(error.message);
          }
        }

        fee = calculateFee(Math.round((gasEstimate ?? defaultGasStake) * gasAdjustment), gasPrice);

        feeDenom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
      }

      if (isSimulation) {
        const denomChainInfo = chainInfos[feeDenom.chain as SupportedChain];
        const _chainId = getChainId(denomChainInfo, selectedNetwork);
        const feeCurrencyValue = await fetchCurrency(
          fromSmall(fee.amount[0].amount, feeDenom.coinDecimals),
          feeDenom.coinGeckoId,
          feeDenom.chain as SupportedChain,
          currencyDetail[preferredCurrency].currencyPointer,
          `${_chainId}-${feeDenom.coinMinimalDenom}`,
        );
        setCurrencyFees(feeCurrencyValue ?? '0');
        setFees(fee);
      }

      setError(undefined);
      setLedgerError(undefined);

      if (tx) {
        if (isLedgerWallet) {
          setShowLedgerPopup(true);
        }
        if (isKeystoneWallet) {
          setShowKeystonePopup(true);
        }

        const txHash = await executeTx(amt, fee, tx, creationHeight);
        const txType = getStakeTxType(mode);
        let metadata = {};

        if (mode === 'REDELEGATE') {
          metadata = getMetaDataForRedelegateTx(fromValidator?.address ?? '', toValidator?.address ?? '', {
            amount: amt.amount,
            denom: amt.denom,
          });
        } else if (mode === 'DELEGATE' || mode === 'UNDELEGATE' || mode === 'CANCEL_UNDELEGATION') {
          metadata = getMetaDataForDelegateTx(toValidator?.address ?? '', { amount: amt.amount, denom: amt.denom });
        } else if (mode === 'CLAIM_REWARDS') {
          metadata = getMetaDataForClaimRewardsTx(
            (toValidator ? [toValidator.operator_address] : delegations?.map((d) => d.delegation.validator_address)) ??
              [],
            { amount: toSmall(amount.toString(), denom?.coinDecimals ?? 6), denom: amt?.denom },
          );
        }

        const denomChainInfo = chainInfos[feeDenom.chain as SupportedChain];

        const txnLogAmountValue = await getTxnLogAmountValue(amount, {
          coinGeckoId: denoms?.[denom.coinMinimalDenom]?.coinGeckoId,
          chain: denoms?.[denom.coinMinimalDenom]?.chain as SupportedChain,
          coinMinimalDenom: denom.coinMinimalDenom,
          chainId: getChainId(denomChainInfo, selectedNetwork),
        });
        await txPostToDB({
          txHash,
          txType,
          metadata,
          feeDenomination: fee.amount[0].denom,
          feeQuantity: fee.amount[0].amount,
          amount: txnLogAmountValue,
          forceChain: activeChain,
          forceNetwork: selectedNetwork,
          forceWalletAddress: address,
          chainId: activeChainId,
        });

        const txResult = tx.pollForTx(txHash);
        if (txResult) onTxSuccess(txResult, txHash, callback);
        setError(undefined);
      }
    } catch (e: any) {
      if (e instanceof LedgerError || e.message.includes('Ledger')) {
        setLedgerError(e.message.toString());
      } else {
        setError(e.message.toString());
      }
    } finally {
      setLoading(false);
      setShowLedgerPopup(false);
      setShowKeystonePopup(false);
    }
  };

  const onReviewTransaction = async (
    wallet: OfflineSigner,
    callback: TxCallback,
    isSimulation: boolean,
    customFee?: {
      stdFee: StdFee | undefined;
      feeDenom: NativeDenom;
    },
  ) => {
    try {
      executeDelegateTx({ wallet, callback, isSimulation, customFee });
    } catch (e) {
      //
    }
  };

  const onSimulateTx = () => {
    try {
      executeDelegateTx({ isSimulation: true });
    } catch (e: any) {
      const errorMessage: string = e.message.toString();
      handleSimulationError(errorMessage);
    }
  };

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      const amountBN = new BigNumber(amount);
      if (!amountBN.isNaN() && amountBN.gt(0)) {
        try {
          const forceSimulationFeeDenom = userPreferredGasPrice?.denom;
          executeDelegateTx({
            isSimulation: true,
            simulationParams: forceSimulationFeeDenom ? { forceSimulationFeeDenom } : undefined,
          });
        } catch {
          //
        }
      }
    }, 750);

    return () => clearTimeout(timeoutID);
  }, [amount, toValidator, fromValidator]);

  const displayFeeText =
    amount.length === 0 || !fees
      ? 'Enter amount to see the transaction fee'
      : `Transaction fee: ${formatTokenAmount(fromSmall(fees?.amount[0]?.amount, denom?.coinDecimals), '', 5)} ${
          denom?.coinDenom
        } (${formatCurrency(new BigNumber(currencyFees ?? '0'))})`;

  return {
    error,
    clearError,
    isLoading,
    setCreationHeight,
    creationHeight,
    simulationError,
    memo,
    fees: fromSmall(fees?.amount[0]?.amount ?? '0', denom?.coinDecimals),
    currencyFees,
    amount,
    displayFeeText,
    onReviewTransaction,
    setAmount,
    setMemo,
    showLedgerPopup,
    showKeystonePopup,
    onSimulateTx,
    setGasPriceFactor,
    setLedgerError,
    ledgerError,
    recommendedGasLimit,
    tokenFiatValue,
    gasOption,
    setGasOption,
    userPreferredGasLimit,
    userPreferredGasPrice,
    setUserPreferredGasLimit,
    setUserPreferredGasPrice,
    feeDenom,
    setFeeDenom,
    customFee,
  };
}

export function useIsCancleUnstakeSupported(
  unboundingDelegation: UnbondingDelegation,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [forceNetwork, _selectedNetwork]);

  const address = useAddress(activeChain);
  const { chains } = useChainsStore();
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const getGasPrice = useGetGasPrice(activeChain, selectedNetwork);
  const checkIsCancelUnstakeSupported = useCallback(async () => {
    try {
      const denom = getNativeDenom(chains, activeChain, selectedNetwork);
      const gasPrice = await getGasPrice();
      const fee = getSimulationFee(gasPrice.denom);
      const amount = coin('1', denom.coinMinimalDenom);
      await simulateCancelUndelegation(
        lcdUrl ?? '',
        address,
        unboundingDelegation?.validator_address,
        amount,
        unboundingDelegation?.entries?.[0]?.creation_height?.toString() ?? '',
        fee,
        activeChain,
      );
      return true;
    } catch (e: any) {
      const errorMessage: string = e.message.toString();
      if (errorMessage.includes('tx parse error') || errorMessage.includes(`reading 'gas_info'`)) {
        return false;
      } else {
        return true;
      }
    }
  }, [activeChain, selectedNetwork, unboundingDelegation]);

  const { data: isCancleUnstakeSupported } = useQuery(
    [['@cancelUnstakingSupport', activeChain, selectedNetwork, unboundingDelegation?.validator_address]],
    async () => {
      if ((activeChain !== 'initiaEvm' && chains[activeChain].bip44.coinType === '60') || activeChain === 'injective') {
        return false;
      }
      return await checkIsCancelUnstakeSupported();
    },
    {
      cacheTime: 1000 * 60 * 60 * 24 * 3, //3days
      staleTime: 1000 * 60 * 60 * 5, // 5 hour
      enabled: !!unboundingDelegation,
    },
  );

  return { isCancleUnstakeSupported: isCancleUnstakeSupported ?? false };
}
