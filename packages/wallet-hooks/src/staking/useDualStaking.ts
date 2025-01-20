/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Coin } from '@cosmjs/amino';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, coin, StdFee } from '@cosmjs/stargate';
import {
  DEFAULT_GAS_REDELEGATE,
  DefaultGasEstimates,
  Delegation,
  DenomsRecord,
  fromSmall,
  GasPrice,
  getSimulationFee,
  LavaTx,
  LedgerError,
  NativeDenom,
  Provider,
  ProviderDelegation,
  simulateCancelUndelegation,
  simulateClaimProviderRewards,
  simulateDelegate,
  simulateDelegateLava,
  simulateRedelegate,
  simulateReDelegateLava,
  simulateUndelegate,
  simulateUnDelegateLava,
  SupportedChain,
  toSmall,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import { currencyDetail, useformatCurrency, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useActiveWalletStore,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useDualStakeDelegationsStore,
  useDualStakeProviderRewardsStore,
  useDualStakeProvidersStore,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import { useTxHandler } from '../tx';
import { STAKE_MODE, TxCallback, WALLETTYPE } from '../types';
import {
  GasOptions,
  getChainId,
  getMetaDataForClaimRewardsTx,
  getMetaDataForDelegateTx,
  getMetaDataForProviderRedelegateTx,
  getMetaDataForRedelegateTx,
  getTxnLogAmountValue,
  useActiveStakingDenom,
  useGasRateQuery,
  useGetGasPrice,
  useNativeFeeDenom,
} from '../utils';
import { fetchCurrency } from '../utils/findUSDValue';
import { getNativeDenom } from '../utils/getNativeDenom';
import { formatTokenAmount } from '../utils/strings';
import { useChainId } from '../utils-hooks';

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

export function useDualStaking() {
  const { delegationInfo, loadingDelegations, refetchDelegations } = useDualStakeDelegationsStore();
  const { rewards } = useDualStakeProviderRewardsStore();
  const { providers } = useDualStakeProvidersStore();

  return {
    providers,
    delegations: delegationInfo.delegations,
    loadingDelegations,
    refetchDelegations,
    rewards,
  };
}

export function useDualStakingTx(
  denoms: DenomsRecord,
  mode: STAKE_MODE,
  toValidator: Validator,
  fromValidator?: Validator,
  delegations?: Delegation[],
  providerDelegations?: ProviderDelegation[],
  toProvider?: Provider,
  fromProvider?: Provider,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
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
  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, selectedNetwork);

  const [amount, setAmount] = useState<string>('');
  const [creationHeight, setCreationHeight] = useState<string>('');
  const [fees, setFees] = useState<StdFee>();
  const [memo, setMemo] = useState<string>('');
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

  const gasAdjustment = useGasAdjustmentForChain(activeChain);
  const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork);
  const gasPrices = useGasRateQuery(denoms, activeChain, selectedNetwork);

  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom);
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [gasPriceOptions, setGasPriceOptions] = useState(gasPrices?.[feeDenom.coinMinimalDenom]);

  const customFee = useMemo(() => {
    const _gasLimit = userPreferredGasLimit ?? Number(recommendedGasLimit);
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption];
    if (!_gasPrice) return;
    // todo
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

    setPendingTx({
      img: chainInfos[activeChain].chainSymbolImageUrl,
      [amtKey]: formatTokenAmount(amount, activeStakingDenom.coinDenom, 4),
      [usdAmtKey]: formatCurrency(new BigNumber(amount).multipliedBy(tokenFiatValue ?? '')),
      sentTokenInfo: denom,
      title1: '',
      subtitle1: '',
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
        case 'DELEGATE':
          if (toProvider) {
            return simulateDelegateLava(
              lcdUrl ?? '',
              address,
              toValidator?.address ?? '',
              toProvider?.address ?? '',
              amount,
            );
          } else {
            return simulateDelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount, fee);
          }
        case 'REDELEGATE':
          if (toProvider) {
            return simulateReDelegateLava(
              lcdUrl ?? '',
              address,
              toProvider?.address ?? '',
              fromProvider?.address ?? '',
              amount,
            );
          } else {
            return simulateRedelegate(
              lcdUrl ?? '',
              address,
              toValidator?.address ?? '',
              fromValidator?.address ?? '',
              amount,
              fee,
            );
          }
        case 'CLAIM_REWARDS': {
          return simulateClaimProviderRewards(lcdUrl ?? '', address, '');
        }
        case 'CANCEL_UNDELEGATION':
          return simulateCancelUndelegation(
            lcdUrl ?? '',
            address,
            toValidator.address ?? '',
            amount,
            creationHeight ?? '',
            fee,
          );
        case 'UNDELEGATE':
          if (toProvider) {
            return simulateUnDelegateLava(
              lcdUrl ?? '',
              address,
              toValidator.address ?? '',
              toProvider.address ?? '',
              amount,
            );
          } else {
            return simulateUndelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount, fee);
          }
      }
    },
    [
      amount,
      feeDenom,
      creationHeight,
      mode,
      lcdUrl,
      address,
      toValidator,
      fromValidator,
      delegations,
      toProvider,
      fromProvider,
    ],
  );

  const executeTx = useCallback(
    async (amount: Coin, fee: StdFee, txHandler: LavaTx, creationHeight?: string) => {
      switch (mode) {
        case 'DELEGATE': {
          if (toProvider) {
            return await txHandler.delegateLava(
              address,
              toValidator?.address ?? '',
              toProvider?.address ?? '',
              amount,
              fee,
            );
          } else {
            return await txHandler.delegate(address, toValidator?.address ?? '', amount, fee, memo);
          }
        }
        case 'UNDELEGATE': {
          if (toProvider) {
            return await txHandler.unDelegateLava(
              address,
              toValidator.address ?? '',
              toProvider.address ?? '',
              amount,
              fee,
            );
          } else {
            return await txHandler.unDelegate(address, toValidator?.address ?? '', amount, fee, memo);
          }
        }
        case 'REDELEGATE': {
          if (toProvider) {
            return await txHandler.reDelegateLava(
              address,
              toProvider.address ?? '',
              fromProvider?.address ?? '',
              amount,
              fee,
            );
          } else {
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
        case 'CLAIM_REWARDS': {
          return await txHandler.claimProviderRewards(address, '', fee);
        }

        case 'CANCEL_UNDELEGATION': {
          return await txHandler.cancelUnDelegation(
            address,
            toValidator?.address ?? '',
            amount,
            creationHeight ?? '',
            fee,
            memo,
          );
        }
      }
    },
    [address, toValidator, fromValidator, mode, delegations, memo],
  );

  const getAmount = useCallback(
    (amount: string) => {
      switch (mode) {
        case 'REDELEGATE':
        case 'DELEGATE':
        case 'UNDELEGATE':
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
    if ((mode === 'DELEGATE' || mode === 'UNDELEGATE') && !toValidator) {
      return;
    }
    if (mode === 'REDELEGATE' && (!toValidator || !fromValidator || !delegations)) {
      if (!toProvider || !fromProvider || !providerDelegations) {
        return;
      }
    }
    if (mode === 'CLAIM_REWARDS' && new BigNumber(amount).lte(0.00001)) {
      setError('Reward is too low');
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
      const tx: LavaTx | undefined = !isSimulation && wallet ? ((await getTxHandler(wallet)) as LavaTx) : undefined;

      const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
      const amt = getAmount(amount);

      let fee: StdFee;
      let feeDenom: NativeDenom;

      if (customFee !== undefined && customFee.stdFee) {
        fee = customFee.stdFee;
        feeDenom = customFee.feeDenom;
      } else {
        const gasPrice = await getGasPrice();

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

        // todo
        if (mode === 'REDELEGATE') {
          if (fromProvider) {
            metadata = getMetaDataForProviderRedelegateTx(fromProvider?.address ?? '', toProvider?.address ?? '', {
              amount: amt.amount,
              denom: amt.denom,
            });
          } else {
            metadata = getMetaDataForRedelegateTx(fromValidator?.address ?? '', toValidator?.address ?? '', {
              amount: amt.amount,
              denom: amt.denom,
            });
          }
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
  }, [amount, toValidator, fromValidator, toProvider, fromProvider]);

  return {
    error,
    clearError,
    isLoading,
    setCreationHeight,
    creationHeight,
    simulationError,
    fees: fromSmall(fees?.amount[0]?.amount ?? '0', denom?.coinDecimals),
    currencyFees,
    amount,
    onReviewTransaction,
    setAmount,
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
    setGasPriceOptions,
    memo,
    setMemo,
  };
}
