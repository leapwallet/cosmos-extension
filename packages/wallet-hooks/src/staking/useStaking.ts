import { Coin } from '@cosmjs/amino';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, coin, StdFee } from '@cosmjs/stargate';
import {
  ChainData,
  DefaultGasEstimates,
  Delegation,
  EthermintTxHandler,
  fromSmall,
  getApr,
  getChainInfo,
  getUnbondingTime,
  InjectiveTx,
  Reward,
  RewardsResponse,
  SeiTxHandler,
  simulateDelegate,
  simulateRedelegate,
  simulateUndelegate,
  simulateWithdrawRewards,
  SupportedDenoms,
  toSmall,
  Tx,
  UnbondingDelegation,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk';
import { GasPrice, SupportedChain, transactionDeclinedError } from '@leapwallet/cosmos-wallet-sdk';
import CosmosDirectory from '@leapwallet/cosmos-wallet-sdk/dist/chains/cosmosDirectory';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk/dist/constants';
import Network, { NetworkChainData } from '@leapwallet/cosmos-wallet-sdk/dist/stake/network';
import StakeQueryClient from '@leapwallet/cosmos-wallet-sdk/dist/stake/queryClient';
import { ParsedTransaction } from '@leapwallet/parser-parfait';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import currency from 'currency.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { useGetTokenBalances } from '../bank';
import { CosmosTxType } from '../connectors';
import { useGasAdjustment } from '../fees';
import { currencyDetail, useChainsRegistry, useformatCurrency, useUserPreferredCurrency } from '../settings';
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
  useTxMetadata,
} from '../store';
import { useTxHandler } from '../tx';
import { TxCallback, WALLETTYPE } from '../types';
import { STAKE_MODE } from '../types';
import { useGetGasPrice, useGetIbcDenomInfo } from '../utils';
import { fetchCurrency } from '../utils/findUSDValue';
import { getNativeDenom } from '../utils/getNativeDenom';
import { capitalize, formatTokenAmount } from '../utils/strings';
import { stakeQueryIds } from './queryIds';

function getStakeTxType(mode: STAKE_MODE): CosmosTxType {
  switch (mode) {
    case 'DELEGATE':
      return CosmosTxType.StakeDelegate;
    case 'UNDELEGATE':
      return CosmosTxType.StakeUndelegate;
    case 'REDELEGATE':
      return CosmosTxType.StakeRedelgate;
    default:
      return CosmosTxType.StakeClaim;
  }
}

export function useInvalidateDelegations() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries([stakeQueryIds.delegations]);
    queryClient.invalidateQueries([stakeQueryIds.unboundingDelegations]);
  }, [queryClient]);
}

export function useStaking() {
  const chainInfos = useGetChains();
  const [preferredCurrency] = useUserPreferredCurrency();
  const activeChain = useActiveChain();
  const isTestnet = useSelectedNetwork() === 'testnet';

  const { allAssets } = useGetTokenBalances();
  const token = allAssets?.find((e) => e.symbol === chainInfos[activeChain].denom);
  const { lcdUrl } = useChainApis();
  const denoms = useDenoms();

  const { status: chainRegistryStatus, getChainInfoById } = useChainsRegistry();
  const getIbcDenomInfo = useGetIbcDenomInfo();
  const address = useAddress();
  const denom = Object.values(chainInfos[activeChain].nativeDenoms)[0];

  const { data: denomFiatValue, status: fiatValueStatus } = useQuery(
    ['input-fiat-value', token, currency],
    async () => {
      return await fetchCurrency(
        '1',
        denom.coinGeckoId,
        denom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
      );
    },
    { enabled: !!token, retry: 5, staleTime: 5 * 60 * 1000, retryDelay: 10 },
  );

  const {
    data: rewards,
    status: loadingRewardsStatus,
    refetch: refetchDelegatorRewards,
    isFetching: isFetchingRewards,
  } = useQuery(
    [stakeQueryIds.delegatorRewards, address, activeChain, currency, isTestnet],
    async (): Promise<{
      rewardMap: Record<string, Reward>;
      result: RewardsResponse;
      totalRewards: string;
      formattedTotalRewards: string;
      currencyAmountReward: string;
      totalRewardsDollarAmt: string;
    }> => {
      const client = await StakeQueryClient(activeChain, lcdUrl ?? '', denoms);
      const { rewards, result } = await client.getRewards(address, {}, getIbcDenomInfo, getChainInfoById);

      const resultTotal = await Promise.all(
        result.total.map(async (c) => {
          const denomInfo = (await getIbcDenomInfo(c.denom, getChainInfoById)) as NativeDenom;

          let denomFiatValue = '0';
          if (denomInfo?.coinGeckoId) {
            denomFiatValue =
              (await fetchCurrency(
                '1',
                denomInfo.coinGeckoId,
                denomInfo.chain as SupportedChain,
                currencyDetail[preferredCurrency].currencyPointer,
              )) ?? '0';
          }

          const currenyAmount = new BigNumber(c.amount).multipliedBy(denomFiatValue).toString();

          let formatted_amount = '';
          if (denomInfo) {
            formatted_amount = formatTokenAmount(c.amount, denomInfo.coinDenom, denomInfo.coinDecimals);

            if (c.formatted_amount === 'NaN') {
              formatted_amount = '0 ' + denomInfo.coinDenom;
            }
          }

          return {
            ...c,
            currenyAmount,
            formatted_amount,
            tokenInfo: denomInfo,
            denomFiatValue,
          };
        }),
      );

      const resultRewards = await Promise.all(
        result.rewards.map(async (r) => {
          const reward = await Promise.all(
            r.reward.map(async (c) => {
              const denomInfo = resultTotal.find((token) => token.denom === c.denom);
              const denomFiatValue = denomInfo?.denomFiatValue ?? '0';
              const currenyAmount = new BigNumber(c.amount).multipliedBy(denomFiatValue).toString();

              let formatted_amount = '';
              if (denomInfo && denomInfo.tokenInfo) {
                const tokenInfo = denomInfo.tokenInfo;
                formatted_amount = formatTokenAmount(c.amount, tokenInfo.coinDenom, tokenInfo.coinDecimals);

                if (c.formatted_amount === 'NaN') {
                  formatted_amount = '0 ' + tokenInfo.coinDenom;
                }
              }

              return {
                ...c,
                currenyAmount,
                formatted_amount,
                tokenInfo: denomInfo?.tokenInfo,
              };
            }),
          );

          return { ...r, reward };
        }),
      );

      const totalRewards = resultTotal
        .reduce((a, v) => {
          return a + +v.amount;
        }, 0)
        .toString();

      let totalRewardsDollarAmt = '0';
      if (resultTotal[0]) {
        totalRewardsDollarAmt = resultTotal
          .reduce((totalSum, token) => {
            return totalSum.plus(new BigNumber(token.currenyAmount ?? ''));
          }, new BigNumber('0'))
          .toString();
      }

      let currencyAmountReward = '0';
      if (result?.total[0]) {
        currencyAmountReward = new BigNumber(totalRewards).multipliedBy(denomFiatValue ?? '0').toString();
      }

      let formattedTotalRewards = formatTokenAmount(totalRewards, chainInfos[activeChain].denom, 4);
      if (formattedTotalRewards === 'NaN') {
        formattedTotalRewards = '0 ' + chainInfos[activeChain].denom;
      }

      return {
        rewardMap: rewards,
        result: { ...result, total: resultTotal, rewards: resultRewards },
        totalRewards,
        formattedTotalRewards,
        currencyAmountReward,
        totalRewardsDollarAmt,
      };
    },
    { enabled: !!address && chainRegistryStatus === 'success', staleTime: 60 * 1000, refetchOnWindowFocus: true },
  );

  const {
    data: delegationInfo,
    isLoading: loadingDelegations,
    refetch: refetchDelegations,
  } = useQuery(
    [stakeQueryIds.delegations, address, activeChain, denomFiatValue, isTestnet],
    async (): Promise<{
      totalDelegationAmount: string;
      currencyAmountDelegation: string;
      delegations: Record<string, Delegation>;
    }> => {
      const client = await StakeQueryClient(activeChain, lcdUrl ?? '', denoms);
      const rawDelegations: Record<string, Delegation> = await client.getDelegations(address);
      const delegations = Object.entries(rawDelegations)
        .filter(([, d]) => new BigNumber(d.balance.amount).gt(0))
        .reduce((formattedDelegations, [validator, d]) => {
          d.balance.currenyAmount = new BigNumber(d.balance.amount).multipliedBy(denomFiatValue ?? '0').toString();
          d.balance.formatted_amount = formatTokenAmount(d.balance.amount, chainInfos[activeChain].denom, 6);
          return { [validator]: d, ...formattedDelegations };
        }, {});

      const tda = Object.values(rawDelegations)
        .reduce(
          (a, v) => a + +v.balance.amount,

          0,
        )
        .toString();
      const totalDelegationAmount = formatTokenAmount(tda, chainInfos[activeChain].denom);
      const currencyAmountDelegation = new BigNumber(tda).multipliedBy(denomFiatValue ?? '0').toString();
      return { delegations, totalDelegationAmount, currencyAmountDelegation };
    },
    { enabled: !!address, staleTime: 60 * 1000, refetchOnWindowFocus: true },
  );

  const {
    data: unboundingDelegationsInfo,
    status: loadingUnboundingDegStatus,
    refetch: refetchUnboundingDelegations,
  } = useQuery(
    [stakeQueryIds.unboundingDelegations, address, activeChain, isTestnet],
    async (): Promise<Record<string, UnbondingDelegation>> => {
      const client = await StakeQueryClient(activeChain, lcdUrl ?? '', denoms);

      const denom = Object.values(chainInfos[activeChain].nativeDenoms).filter(
        (denom) => denom.coinDenom === chainInfos[activeChain].denom,
      )[0].coinMinimalDenom;

      const uDelegations: Record<string, UnbondingDelegation> = await client.getUnbondingDelegations(
        address,
        denom as SupportedDenoms,
      );
      Object.values(uDelegations).map(async (r) => {
        r.entries.map((e) => {
          e.formattedBalance = formatTokenAmount(e.balance, chainInfos[activeChain].denom, 6);
        });
      });
      return uDelegations;
    },
    { enabled: !!address, staleTime: 60 * 1000 },
  );

  const {
    data: validatorData,
    status: validatorDataStatus,
    refetch: refetchNetwork,
  } = useQuery(
    ['stakeValidators', activeChain, isTestnet],
    async (): Promise<{
      chainData: NetworkChainData;
      validators: Validator[];
    }> => {
      const chainId = chainInfos[activeChain].key;

      const _chainData = chainInfos[activeChain].beta
        ? { params: { calculated_apr: 0, estimated_apr: 0 } }
        : ((await getChainInfo(chainId, isTestnet)) as ChainData);

      const denom = Object.values(chainInfos[activeChain].nativeDenoms).find(
        (denom) => denom.coinDenom === chainInfos[activeChain].denom,
      );

      const validators = (await CosmosDirectory(isTestnet).getValidators(
        (chainId === 'terra' ? 'terra2' : chainId) as SupportedChain,
        lcdUrl,
        denom,
        chainInfos,
      )) as Validator[];

      // validators = await fillValidatorsImage(validators);

      const { unbonding_time = 0 } = await getUnbondingTime(chainId, isTestnet, lcdUrl, chainInfos);
      const calculatedApr = await getApr(activeChain, isTestnet, chainInfos);

      return {
        chainData: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          params: { ...(_chainData?.params ?? {}), calculated_apr: calculatedApr, unbonding_time },
        },
        validators,
      };
    },
    {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount) => {
        return failureCount < 3;
      },
    },
  );

  const networkData = useMemo(() => {
    if (validatorData?.chainData && validatorData?.validators)
      return new Network(validatorData?.chainData, validatorData?.validators);
    else return;
  }, [validatorData, validatorData?.chainData, validatorData?.validators]);

  const loadingUnboundingDelegations =
    loadingUnboundingDegStatus !== 'success' && loadingUnboundingDegStatus !== 'error';
  const loadingFiatValue = fiatValueStatus !== 'success' && fiatValueStatus !== 'error';
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
    currencyAmountReward: rewards?.currencyAmountReward,
    network: networkData,
    minMaxApy: networkData?.minMaxApy,
    delegations: delegationInfo?.delegations,
    token,
    totalDelegationAmount: delegationInfo?.totalDelegationAmount,
    currencyAmountDelegation: delegationInfo?.currencyAmountDelegation,
    unboundingDelegationsInfo,
    loadingFiatValue,
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
  const selectedNetwork = useSelectedNetwork();
  const activeChain = useActiveChain();
  const { chains } = useChainsStore();
  const { lcdUrl } = useChainApis();

  const getAmount = useCallback(
    (amount: string) => {
      const denom = getNativeDenom(chains, activeChain, selectedNetwork);
      switch (mode) {
        case 'REDELEGATE':
          return coin(toSmall(amount, denom?.coinDecimals), delegations?.[0].balance.denom ?? '');
        case 'DELEGATE':
        case 'UNDELEGATE':
          return coin(toSmall(amount, denom?.coinDecimals), denom.coinMinimalDenom);
        default:
          return coin(toSmall('0'), denom.coinMinimalDenom);
      }
    },
    [mode, activeChain, delegations, chains],
  );

  const simulateTx = useCallback(
    async (_amount: string) => {
      const amount = getAmount(_amount);
      switch (mode) {
        case 'REDELEGATE':
          return await simulateRedelegate(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            fromValidator?.address ?? '',
            amount,
          );
        case 'DELEGATE':
          return await simulateDelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount);
        case 'CLAIM_REWARDS': {
          const validators =
            (toValidator ? [toValidator.operator_address] : delegations?.map((d) => d.delegation.validator_address)) ??
            [];
          return await simulateWithdrawRewards(lcdUrl ?? '', address, validators);
        }
        case 'UNDELEGATE':
          return await simulateUndelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount);
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
) {
  // HOOKS
  const denoms = useDenoms();
  const txMetadata = useTxMetadata();
  const chainInfos = useGetChains();
  const getTxHandler = useTxHandler();
  const activeChain = useActiveChain();
  const { activeWallet } = useActiveWalletStore();
  const address = useAddress();
  const [preferredCurrency] = useUserPreferredCurrency();
  const [formatCurrency] = useformatCurrency();
  const { setPendingTx } = usePendingTxState();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const defaultGasEstimates = useDefaultGasEstimates();
  const gasPriceSteps = useGasPriceSteps();

  // STATES
  const [memo, setMemo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [fees, setFees] = useState<StdFee>();
  const [currencyFees, setCurrencyFees] = useState<string>();
  const [error, setError] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);
  const [, setGasPriceFactor] = useState<'low' | 'average' | 'high'>('low');
  const selectedNetwork = useSelectedNetwork();

  const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
  const { lcdUrl } = useChainApis();
  const getGasPrice = useGetGasPrice(activeChain);
  const gasAdjustment = useGasAdjustment();

  // FUNCTIONS
  const onTxSuccess = async (promise: any, callback?: TxCallback) => {
    const amtKey = mode === 'UNDELEGATE' || mode === 'CLAIM_REWARDS' ? 'receivedAmount' : 'sentAmount';
    const title = mode === 'CLAIM_REWARDS' ? 'claim rewards' : mode.toLowerCase();

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
      sentTokenInfo: denom,
      title1: `${capitalize(title)}`,
      subtitle1,
      title2: 'Transaction Successful',
      txStatus: 'loading',
      txType: mode === 'DELEGATE' || mode === 'REDELEGATE' ? 'delegate' : 'undelegate',
      promise,
    });
    if (showLedgerPopup) {
      setShowLedgerPopup(false);
    }
    callback?.('success');
  };

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const simulateTx = useCallback(
    (amount: Coin) => {
      switch (mode) {
        case 'REDELEGATE':
          return simulateRedelegate(
            lcdUrl ?? '',
            address,
            toValidator?.address ?? '',
            fromValidator?.address ?? '',
            amount,
          );
        case 'DELEGATE':
          return simulateDelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount);
        case 'CLAIM_REWARDS': {
          const validators =
            (toValidator ? [toValidator.operator_address] : delegations?.map((d) => d.delegation.validator_address)) ??
            [];
          return simulateWithdrawRewards(lcdUrl ?? '', address, validators);
        }
        case 'UNDELEGATE':
          return simulateUndelegate(lcdUrl ?? '', address, toValidator?.address ?? '', amount);
      }
    },
    [address, toValidator, fromValidator, memo, mode, delegations],
  );

  const executeTx = useCallback(
    async (amount: Coin, fee: StdFee, txHandler: Tx | InjectiveTx | EthermintTxHandler | SeiTxHandler) => {
      switch (mode) {
        case 'UNDELEGATE':
          return await txHandler.unDelegate(address, toValidator?.address ?? '', amount, fee, memo);
        case 'CLAIM_REWARDS': {
          const validators =
            (toValidator ? [toValidator.operator_address] : delegations?.map((d) => d.delegation.validator_address)) ??
            [];
          return await txHandler.withdrawRewards(address, validators, fee, memo);
        }
        case 'DELEGATE':
          return await txHandler.delegate(address, toValidator?.address ?? '', amount, fee, memo);
        case 'REDELEGATE':
          return await txHandler.reDelegate(
            address,
            toValidator?.address ?? '',
            fromValidator?.address ?? '',
            amount,
            fee,
            memo,
          );
      }
    },
    [address, toValidator, fromValidator, memo, mode, delegations],
  );

  const getAmount = useCallback(
    (amount: string) => {
      const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
      switch (mode) {
        case 'REDELEGATE':
          return coin(toSmall(amount, denom?.coinDecimals), delegations?.[0].balance.denom ?? '');
        case 'DELEGATE':
        case 'UNDELEGATE':
          return coin(toSmall(amount, denom?.coinDecimals), denom.coinMinimalDenom);
        default:
          return coin(toSmall('0'), denom.coinMinimalDenom);
      }
    },
    [mode, activeChain, delegations, chainInfos],
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
      stdFee: StdFee;
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

    setError('');

    if (!amount || new BigNumber(amount).lte(0)) {
      setFees(undefined);
      setCurrencyFees('');
      return;
    }

    setLoading(true);

    try {
      const tx = !isSimulation && wallet ? await getTxHandler(wallet) : undefined;

      const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
      const amt = getAmount(amount);

      let fee: StdFee;
      let feeDenom: NativeDenom;

      if (customFee !== undefined) {
        fee = customFee.stdFee;
        feeDenom = customFee.feeDenom;
      } else {
        let gasPrice = await getGasPrice();
        if (activeChain === 'akash') {
          gasPrice = GasPrice.fromString(
            `${gasPriceSteps[activeChain].high.toString()}${denoms.uakt.coinMinimalDenom}`,
          );
        }

        const defaultGasStake =
          defaultGasEstimates[activeChain].DEFAULT_GAS_STAKE || DefaultGasEstimates.DEFAULT_GAS_STAKE;
        let gasEstimate = defaultGasStake;

        if (mode === 'CLAIM_REWARDS' && delegations) {
          gasEstimate = defaultGasStake * Math.max(delegations?.length, 1);
        }

        try {
          const { gasUsed } = await simulateTx(amt);
          gasEstimate = gasUsed;
        } catch (e) {
          //
        }

        fee = calculateFee(Math.round((gasEstimate ?? defaultGasStake) * gasAdjustment), gasPrice);

        feeDenom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
      }

      if (isSimulation) {
        const feeCurrencyValue = await fetchCurrency(
          fromSmall(fee.amount[0].amount, feeDenom.coinDecimals),
          feeDenom.coinGeckoId,
          feeDenom.chain as SupportedChain,
          currencyDetail[preferredCurrency].currencyPointer,
        );
        setCurrencyFees(feeCurrencyValue ?? '0');
        setFees(fee);
      }

      setError('');

      if (tx) {
        if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
          setShowLedgerPopup(true);
        }
        const txHash = await executeTx(amt, fee, tx);
        const txType = getStakeTxType(mode);
        let metadata = {};
        if (mode === 'REDELEGATE') {
          metadata = {
            ...txMetadata,
            fromValidator: fromValidator?.address,
            toValidator: toValidator?.address,
            token: {
              amount: amt.amount,
              denom: amt.denom,
            },
          };
        } else if (mode === 'DELEGATE' || mode === 'UNDELEGATE') {
          metadata = {
            ...txMetadata,
            validatorAddress: toValidator?.address,
            token: {
              amount: amt.amount,
              denom: amt.denom,
            },
          };
        } else if (mode === 'CLAIM_REWARDS') {
          metadata = {
            ...txMetadata,
            validators:
              (toValidator
                ? [toValidator.operator_address]
                : delegations?.map((d) => d.delegation.validator_address)) ?? [],
            token: {
              amount: toSmall(amount.toString(), denom?.coinDecimals ?? 6),
              denom: amt?.denom,
            },
          };
        }

        await txPostToDB({
          txHash,
          txType,
          metadata,
          feeDenomination: fee.amount[0].denom,
          feeQuantity: fee.amount[0].amount,
        });
        const txResult = tx.pollForTx(txHash);

        if (txResult) onTxSuccess(txResult, callback);
        setError('');
      }
    } catch (e: any) {
      if (e.message === transactionDeclinedError.message) {
        // navigate('/home?txDeclined=true');
        callback && callback('txDeclined');
      }
      setError(e.message.toString());
    } finally {
      setLoading(false);
    }
  };

  const onReviewTransaction = async (
    wallet: OfflineSigner,
    callback: TxCallback,
    isSimulation: boolean,
    customFee?: {
      stdFee: StdFee;
      feeDenom: NativeDenom;
    },
  ) => {
    try {
      executeDelegateTx({ wallet, callback, isSimulation, customFee });
    } catch {
      //
    }
  };

  const onSimulateTx = () => {
    try {
      executeDelegateTx({ isSimulation: true });
    } catch {
      //
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
    }, 250);

    return () => clearTimeout(timeoutID);
  }, [amount]);

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
  };
}
