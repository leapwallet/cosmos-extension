/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Coin } from '@cosmjs/amino';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, coin, StdFee } from '@cosmjs/stargate';
import {
  DefaultGasEstimates,
  Delegation,
  EthermintTxHandler,
  fromSmall,
  getSimulationFee,
  InjectiveTx,
  LedgerError,
  SeiTxHandler,
  simulateCancelUndelegation,
  simulateDelegate,
  simulateRedelegate,
  simulateUndelegate,
  simulateWithdrawRewards,
  toSmall,
  Tx,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk';
import {
  DEFAULT_GAS_REDELEGATE,
  defaultGasPriceStep,
  GasPrice,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import Network from '@leapwallet/cosmos-wallet-sdk/dist/browser/stake/network';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { useGetTokenSpendableBalances } from '../bank';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import { currencyDetail, useformatCurrency, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useActiveWalletStore,
  useAddress,
  useChainApis,
  useChainsStore,
  useDefaultGasEstimates,
  useDenoms,
  useGasPriceSteps,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
  useStakeClaimRewardsStore,
  useStakeDelegationsStore,
  useStakeUndelegationsStore,
  useStakeValidatorsStore,
} from '../store';
import { useTxHandler } from '../tx';
import { TxCallback, WALLETTYPE } from '../types';
import { STAKE_MODE } from '../types';
import {
  GasOptions,
  getChainId,
  getMetaDataForClaimRewardsTx,
  getMetaDataForDelegateTx,
  getMetaDataForRedelegateTx,
  getOsmosisGasPriceSteps,
  getTxnLogAmountValue,
  useActiveStakingDenom,
  useGasRateQuery,
  useGetGasPrice,
  useNativeFeeDenom,
} from '../utils';
import { fetchCurrency } from '../utils/findUSDValue';
import { getNativeDenom } from '../utils/getNativeDenom';
import { capitalize, formatTokenAmount } from '../utils/strings';
import { useChainId, useGetFeeMarketGasPricesSteps, useHasToCalculateDynamicFee } from '../utils-hooks';

type StakeTxHandler = Tx | InjectiveTx | EthermintTxHandler | SeiTxHandler;

function getTypeUrl(mode: STAKE_MODE, chain: SupportedChain) {
  if (chain === 'initia') {
    switch (mode) {
      case 'DELEGATE':
        return '/initia.mstaking.v1.MsgDelegate';
      case 'UNDELEGATE':
        return '/initia.mstaking.v1.MsgUndelegate';
      case 'REDELEGATE':
        return '/initia.mstaking.v1.MsgBeginRedelegate';
      case 'CANCEL_UNDELEGATION':
        return '/initia.mstaking.v1.MsgCancelUnbondingDelegation';
    }
  }

  return;
}

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

export function useInvalidateDelegations() {
  const { refetchDelegations, refetchUnboundingDelegations } = useStaking();

  return useCallback(() => {
    refetchDelegations();
    refetchUnboundingDelegations();
  }, []);
}

export function useStaking(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const { allAssets } = useGetTokenSpendableBalances(forceChain, forceNetwork);
  const isTestnet = useSelectedNetwork() === 'testnet';
  const activeChain = useActiveChain();

  const {
    rewards,
    loadingRewardsStatus,
    isFetchingRewards,
    refetchDelegatorRewards,
    setClaimStatus,
    setClaimPushForceChain,
    setClaimPushForceNetwork,
  } = useStakeClaimRewardsStore();

  const {
    delegationInfo,
    loadingDelegations,
    refetchDelegations,
    setStakeDelegationLoading,
    setStakeDelegationPushForceChain,
    setStakeDelegationPushForceNetwork,
  } = useStakeDelegationsStore();

  const {
    validatorData,
    validatorDataStatus,
    refetchNetwork,
    setStakeValidatorStatus,
    setStakeValidatorPushForceChain,
    setStakeValidatorPushForceNetwork,
  } = useStakeValidatorsStore();

  const {
    unboundingDelegationsInfo,
    loadingUnboundingDegStatus,
    refetchUnboundingDelegations,
    setStakeUndelegationsStatus,
    setStakeUndelegationsPushForceChain,
    setStakeUndelegationsPushForceNetwork,
  } = useStakeUndelegationsStore();

  useLayoutEffect(() => {
    if (forceChain && (activeChain as SupportedChain & 'aggregated') === 'aggregated') {
      setStakeDelegationLoading(true);
      setStakeUndelegationsStatus('loading');
      setStakeValidatorStatus('loading');
      setClaimStatus('loading');
    }
  }, [forceChain, activeChain]);

  useLayoutEffect(() => {
    if (forceChain) {
      setStakeValidatorPushForceChain(forceChain);
      setStakeDelegationPushForceChain(forceChain);
      setClaimPushForceChain(forceChain);
      setStakeUndelegationsPushForceChain(forceChain);
    }

    if (forceNetwork) {
      setStakeValidatorPushForceNetwork(forceNetwork);
      setStakeDelegationPushForceNetwork(forceNetwork);
      setClaimPushForceNetwork(forceNetwork);
      setStakeUndelegationsPushForceNetwork(forceNetwork);
    }

    return () => {
      setStakeValidatorPushForceChain(undefined);
      setStakeDelegationPushForceChain(undefined);
      setClaimPushForceChain(undefined);
      setStakeUndelegationsPushForceChain(undefined);

      setStakeValidatorPushForceNetwork(undefined);
      setStakeDelegationPushForceNetwork(undefined);
      setClaimPushForceNetwork(undefined);
      setStakeUndelegationsPushForceNetwork(undefined);
    };
  }, [forceChain, forceNetwork]);

  const [activeStakingDenom] = useActiveStakingDenom(forceChain, forceNetwork);
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
    minMaxApy: networkData?.minMaxApy,
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
  mode: STAKE_MODE,
  toValidator: Validator,
  fromValidator?: Validator,
  delegations?: Delegation[],
) {
  const address = useAddress();
  const { lcdUrl } = useChainApis();
  const activeChain = useActiveChain();
  const [activeStakingDenom] = useActiveStakingDenom();

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
            getTypeUrl(mode, activeChain),
          );

        case 'DELEGATE':
          return await simulateDelegate(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            amount,
            fee,
            getTypeUrl(mode, activeChain),
          );

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
            getTypeUrl(mode, activeChain),
          );
        }

        case 'UNDELEGATE':
          return await simulateUndelegate(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            amount,
            fee,
            getTypeUrl(mode, activeChain),
          );
      }
    },
    [address, toValidator, fromValidator, mode, delegations],
  );

  return simulateTx;
}

export function useStakeTx(
  mode: STAKE_MODE,
  toValidator: Validator,
  fromValidator?: Validator,
  delegations?: Delegation[],
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  // HOOKS
  const denoms = useDenoms();
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
  const [activeStakingDenom] = useActiveStakingDenom(activeChain, selectedNetwork);

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
  const [, setGasPriceFactor] = useState<'low' | 'average' | 'high'>('low');
  const [recommendedGasLimit, setRecommendedGasLimit] = useState(() => {
    if (mode === 'REDELEGATE') return DEFAULT_GAS_REDELEGATE.toString();
    return defaultGasEstimates[activeChain]?.DEFAULT_GAS_STAKE.toString() ?? DefaultGasEstimates.DEFAULT_GAS_STAKE;
  });

  const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const getGasPrice = useGetGasPrice(activeChain, selectedNetwork);
  const activeChainId = useChainId(activeChain, selectedNetwork);

  /**
   * Fee calculation
   */

  const gasAdjustment = useGasAdjustmentForChain(activeChain);
  const nativeFeeDenom = useNativeFeeDenom(activeChain, selectedNetwork);
  const gasPrices = useGasRateQuery(activeChain, selectedNetwork);
  const hasToCalculateDynamicFee = useHasToCalculateDynamicFee(activeChain, selectedNetwork);
  const getFeeMarketGasPricesSteps = useGetFeeMarketGasPricesSteps(activeChain, selectedNetwork);

  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom);
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [gasPriceOptions, setGasPriceOptions] = useState(gasPrices?.[feeDenom.coinMinimalDenom]);

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

    setPendingTx({
      img: chainInfos[activeChain].chainSymbolImageUrl,
      [amtKey]: formatTokenAmount(amount, '', 4),
      [usdAmtKey]: formatCurrency(new BigNumber(amount).multipliedBy(tokenFiatValue ?? '')),
      sentTokenInfo: denom,
      title1: `${capitalize(title)}`,
      subtitle1,
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
      const fee = getSimulationFee(feeDenom);
      switch (mode) {
        case 'REDELEGATE':
          return simulateRedelegate(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            fromValidator?.address ?? '',
            amount,
            fee,
            getTypeUrl(mode, activeChain),
          );

        case 'DELEGATE':
          return simulateDelegate(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            amount,
            fee,
            getTypeUrl(mode, activeChain),
          );

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
            getTypeUrl(mode, activeChain),
          );

        case 'UNDELEGATE':
          return simulateUndelegate(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            amount,
            fee,
            getTypeUrl(mode, activeChain),
          );
      }
    },
    [address, toValidator, fromValidator, memo, mode, delegations],
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
          return await (txHandler as Tx | SeiTxHandler).cancelUnDelegation(
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
  }: {
    wallet?: OfflineSigner;
    callback?: TxCallback;
    isSimulation: boolean;
    customFee?: {
      stdFee: StdFee | undefined;
      feeDenom: NativeDenom;
    };
  }) => {
    if (isLoading || !address || !activeChain) {
      return;
    }
    if (mode === 'REDELEGATE' && (!toValidator || !fromValidator || !delegations)) {
      return;
    }
    if (mode === 'CLAIM_REWARDS' && (!delegations || new BigNumber(amount).lte(0.00001))) {
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

        try {
          const { gasUsed } = await simulateTx(amt, gasPrice.denom, creationHeight);
          gasEstimate = gasUsed;
          setRecommendedGasLimit(gasUsed.toString());
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
      if (e instanceof LedgerError) {
        setLedgerError(e.message.toString());
      } else {
        setError(e.message.toString());
      }
    } finally {
      setLoading(false);
      setShowLedgerPopup(false);
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
          executeDelegateTx({ isSimulation: true });
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

export function useIsCancleUnstakeSupported(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [forceNetwork, _selectedNetwork]);

  const address = useAddress(activeChain);
  const { chains } = useChainsStore();
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);

  const checkIsCancelUnstakeSupported = useCallback(async () => {
    try {
      const denom = getNativeDenom(chains, activeChain, selectedNetwork);
      const amount = coin(toSmall('1', denom?.coinDecimals), denom.coinMinimalDenom);
      await simulateCancelUndelegation(
        lcdUrl ?? '',
        address,
        'cosmosvaloper13n6wqhq8la352je00nwq847ktp47pgknseu6kk',
        amount,
        '500',
        [amount],
        getTypeUrl('CANCEL_UNDELEGATION', activeChain),
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
  }, [activeChain, selectedNetwork]);

  const { data: isCancleUnstakeSupported } = useQuery(
    [['@cancelUnstakingSupport', activeChain, selectedNetwork]],
    async () => {
      if (chains[activeChain].bip44.coinType === '60' || activeChain === 'injective') return false;
      return await checkIsCancelUnstakeSupported();
    },
    {
      cacheTime: 1000 * 60 * 60 * 24 * 3, //3days
      staleTime: 1000 * 60 * 60 * 5, // 5 hour
    },
  );

  return { isCancleUnstakeSupported: isCancleUnstakeSupported ?? false };
}
