import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, GasPrice, StdFee } from '@cosmjs/stargate';
import {
  ChainInfo,
  DefaultGasEstimates,
  DenomsRecord,
  feeDenoms,
  fromSmall,
  getSimulationFee,
  LedgerError,
  NativeDenom,
  simulateClaimAndStake,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking';
import BigNumber from 'bignumber.js';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import { useformatCurrency } from '../settings';
import {
  useActiveChain,
  useActiveWalletStore,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  // useDenoms,
  useGasPriceSteps,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
  useTxMetadata,
} from '../store';
import { useTxHandler } from '../tx';
import { Amount, WALLETTYPE } from '../types';
import {
  formatTokenAmount,
  GasOptions,
  getChainId,
  getTxnLogAmountValue,
  SelectedNetwork,
  useGasRateQuery,
  useNativeFeeDenom,
} from '../utils';

export type ChainRewards = {
  rewards: any;
  rewardsUsdValue: BigNumber;
  rewardsStatus: string;
  usdValueStatus: string;
  denom: any;
  rewardsDenomValue: BigNumber;
};

export function getNativeDenom(
  chainInfos: Record<SupportedChain, ChainInfo>,
  activeChain: SupportedChain,
  selectedNetwork: 'mainnet' | 'testnet',
) {
  const nativeDenoms = Object.values(chainInfos[activeChain].nativeDenoms);
  return selectedNetwork === 'testnet' && nativeDenoms.length > 1 ? nativeDenoms[1] : nativeDenoms[0];
}

export function useClaimAndStakeRewards(
  denoms: DenomsRecord,
  delegations: Record<string, Delegation> | undefined,
  chainRewards: ChainRewards,
  refetchDelegatorRewards: () => Promise<void>,
  setError: Dispatch<SetStateAction<string>>,
  forceChain?: SupportedChain,
  forceAddress?: string,
  forceNetwork?: SelectedNetwork,
) {
  const txMetadata = useTxMetadata();
  const _userAddress = useAddress(forceChain);
  const userAddress = useMemo(() => forceAddress || _userAddress, [forceAddress, _userAddress]);

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetWork = useMemo(() => forceNetwork || _selectedNetwork, [forceNetwork, _selectedNetwork]);

  const chainInfos = useGetChains();
  const defaultGasEstimates = useDefaultGasEstimates();
  const gasPriceSteps = useGasPriceSteps();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const getTxHandler = useTxHandler({
    forceChain: activeChain,
    forceNetwork: selectedNetWork,
  });

  const { lcdUrl } = useChainApis(activeChain, selectedNetWork);
  const { setPendingTx } = usePendingTxState();
  const [formatCurrency] = useformatCurrency();

  const [loading, setLoading] = useState<boolean>(false);
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetWork);
  const gasAdjustment = useGasAdjustmentForChain(activeChain);
  const gasPrices = useGasRateQuery(denoms, activeChain, selectedNetWork);
  const { activeWallet } = useActiveWalletStore();

  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom);
  const [memo, setMemo] = useState<string>('');
  const [gasPriceOptions] = useState(gasPrices?.[feeDenom.coinMinimalDenom]);
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [ledgerError, setLedgerErrorMsg] = useState<string>();
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);
  const [recommendedGasLimit, setRecommendedGasLimit] = useState(() => {
    return defaultGasEstimates[activeChain]?.DEFAULT_GAS_STAKE.toString() ?? DefaultGasEstimates?.DEFAULT_GAS_STAKE;
  });

  const customFee = useMemo(() => {
    const _gasLimit = userPreferredGasLimit ?? Number(recommendedGasLimit);
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption];
    if (!_gasPrice) return;

    return calculateFee(Math.ceil(_gasLimit * gasAdjustment), _gasPrice as GasPrice);
  }, [userPreferredGasLimit, recommendedGasLimit, userPreferredGasPrice, gasPriceOptions, gasOption, gasAdjustment]);

  const { validatorsWithRewards, totalRewardsToBeClaimedAndStaked } = useMemo(() => {
    const nativeDenom = getNativeDenom(chainInfos, activeChain, selectedNetWork);

    const _validatorsWithRewards: {
      validator: string;
      amount: Amount;
    }[] = [];

    let _totalRewardsToBeClaimedAndStaked = 0;
    Object.values(chainRewards.rewards.rewardMap).forEach((rewardObj: any) => {
      const nativeDenomReward = rewardObj?.reward?.find((r: any) => r?.denom === nativeDenom.coinMinimalDenom);
      const sanitizedDenomRewardAmount = Math.floor(Number(nativeDenomReward?.amount ?? 0));

      const sanitizedDenomReward = nativeDenomReward
        ? {
            denom: nativeDenomReward?.denom,
            amount: String(sanitizedDenomRewardAmount),
          }
        : undefined;
      if (sanitizedDenomRewardAmount && sanitizedDenomReward) {
        _validatorsWithRewards.push({
          validator: rewardObj?.validator_address as string,
          amount: sanitizedDenomReward as Amount,
        });
        _totalRewardsToBeClaimedAndStaked += sanitizedDenomRewardAmount;
      }
    });

    return {
      validatorsWithRewards: _validatorsWithRewards,
      totalRewardsToBeClaimedAndStaked: _totalRewardsToBeClaimedAndStaked,
    };
  }, [activeChain, selectedNetWork, chainRewards.rewards.rewardMap]);

  const setLedgerError = useCallback((error?: string) => {
    setLedgerErrorMsg(error);
    setShowLedgerPopup(false);
  }, []);

  const claimAndStakeRewards = useCallback(
    async (wallet: OfflineSigner, callbacks?: { success?: () => void }) => {
      try {
        if (!userAddress) {
          return;
        }
        if (delegations) {
          setLoading(true);

          if (!wallet) {
            throw new Error('Unable to fetch offline signer');
          }

          if (!totalRewardsToBeClaimedAndStaked) {
            throw new Error('Amount to be claimed and staked is low');
          }

          const txHandler = await getTxHandler(wallet);
          const isLedgerWallet = activeWallet?.walletType === WALLETTYPE.LEDGER;
          const defaultGasStake = defaultGasEstimates[activeChain]?.DEFAULT_GAS_STAKE;

          let gasEstimate = defaultGasStake;
          try {
            const feeDenom = getNativeDenom(chainInfos, activeChain, selectedNetWork);
            const fee = getSimulationFee(feeDenom?.coinMinimalDenom);
            try {
              const { gasUsed } = await simulateClaimAndStake(
                lcdUrl ?? '',
                userAddress,
                validatorsWithRewards,
                fee,
                activeChain,
              );
              gasEstimate = gasUsed;
            } catch (e) {
              //
            }
          } catch (e: any) {
            if (e.code === 'ERR_BAD_REQUEST') {
              throw 'Insufficient balance for transaction fee.';
            } else {
              throw e.message;
            }
          }
          const gasPriceStep = gasPriceSteps[activeChain].low.toString();
          const denom = feeDenoms[selectedNetWork][activeChain]; // fee denom for given chain
          const gasPrice = GasPrice.fromString(`${gasPriceStep + denom.coinMinimalDenom}`);
          let fee: StdFee;
          if (customFee !== undefined) {
            fee = customFee;
          } else {
            fee = calculateFee(Math.round((gasEstimate ?? defaultGasStake) * 1.5), gasPrice);
          }

          setLedgerError(undefined);

          if (isLedgerWallet) {
            setShowLedgerPopup(true);
          }

          txHandler
            .claimAndStake(userAddress, validatorsWithRewards, fee, memo)
            .then(async (txHash: any) => {
              const txResult = txHandler.pollForTx(txHash);
              const metadata = {
                ...txMetadata,
                token: {
                  amount: totalRewardsToBeClaimedAndStaked,
                  denom: denom.coinMinimalDenom,
                },
              };
              const denomChainInfo = chainInfos[denom.chain as SupportedChain];
              const coinDenomAmount = fromSmall(String(totalRewardsToBeClaimedAndStaked), denom?.coinDecimals ?? 6);
              const txnLogAmountValue = await getTxnLogAmountValue(coinDenomAmount, {
                coinGeckoId: denoms?.[denom.coinMinimalDenom]?.coinGeckoId,
                chain: denoms?.[denom.coinMinimalDenom]?.chain as SupportedChain,
                coinMinimalDenom: denom.coinMinimalDenom,
                chainId: getChainId(denomChainInfo, selectedNetWork),
              });

              await txPostToDB({
                txHash,
                txType: CosmosTxType.StakeClaimAndDelegate,
                metadata,
                feeDenomination: fee.amount[0].denom,
                amount: txnLogAmountValue,
                feeQuantity: fee.amount[0].amount,
                forceChain: activeChain,
                forceNetwork: selectedNetWork,
                forceWalletAddress: userAddress,
              });

              setPendingTx({
                img: chainInfos[activeChain].chainSymbolImageUrl,
                sentAmount: formatTokenAmount(chainRewards.rewardsDenomValue.toString(), '', 4),
                sentTokenInfo: denom,
                sentUsdValue: formatCurrency(chainRewards.rewardsUsdValue),
                subtitle1: `Validator ${'Unknown'}`,
                title1: `Claim and Stake Rewards`,
                txStatus: 'loading',
                txType: 'delegate',
                promise: txResult,
                txHash,
                sourceChain: activeChain,
                sourceNetwork: selectedNetWork,
              });
              if (showLedgerPopup) {
                setShowLedgerPopup(false);
              }
              setLoading(false);
              refetchDelegatorRewards();
              callbacks?.success?.();
              // navigate(`/portfolio/activity?chain=${chain}`)
            })
            .catch((e: any) => {
              setLoading(false);
              if (typeof e === 'string') {
                setError(e);
              } else if (e instanceof Error) {
                setError(e.message);
              }
              setTimeout(() => setError(''), 3000);
            });
        }
      } catch (e) {
        if (e instanceof LedgerError) {
          setLedgerError(e.message.toString());
        } else if (typeof e === 'string') {
          setError(e);
        } else if (e instanceof Error) {
          setError(e.message);
        }
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
        setShowLedgerPopup(false);
      }
    },
    [
      userAddress,
      activeChain,
      chainRewards.rewardsUsdValue,
      defaultGasEstimates,
      customFee,
      delegations,
      gasPriceSteps,
      getTxHandler,
      lcdUrl,
      refetchDelegatorRewards,
      selectedNetWork,
      setError,
      setPendingTx,
      totalRewardsToBeClaimedAndStaked,
      txMetadata,
      txPostToDB,
      validatorsWithRewards,
      memo,
    ],
  );

  const { rewardsToBeDelegated, rewardsToBeDelegatedFormatted } = useMemo(() => {
    const nativeDenom = Object.values(chainInfos[activeChain].nativeDenoms).find(
      (d) => d.coinDenom === chainInfos[activeChain].denom,
    );

    const amount = fromSmall(String(totalRewardsToBeClaimedAndStaked), nativeDenom?.coinDecimals ?? 6);
    return {
      rewardsToBeDelegated: amount,
      rewardsToBeDelegatedFormatted: formatTokenAmount(amount, nativeDenom?.coinDenom),
    };
  }, [activeChain, totalRewardsToBeClaimedAndStaked]);

  useEffect(() => {
    (async function () {
      if (!userAddress) {
        return;
      }
      if (!validatorsWithRewards.length) {
        return;
      }
      const defaultGasStake =
        defaultGasEstimates[activeChain]?.DEFAULT_GAS_STAKE ?? DefaultGasEstimates?.DEFAULT_GAS_STAKE;
      let gasEstimate = defaultGasStake;
      const feeDenom = getNativeDenom(chainInfos, activeChain, selectedNetWork);
      const fee = getSimulationFee(feeDenom?.coinMinimalDenom);
      const { gasUsed } = await simulateClaimAndStake(
        lcdUrl ?? '',
        userAddress,
        validatorsWithRewards,
        fee,
        activeChain,
      );
      gasEstimate = gasUsed;
      setRecommendedGasLimit(gasEstimate.toString());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatorsWithRewards]);

  return {
    claimAndStakeRewards,
    loading,
    rewardsToBeDelegated,
    rewardsToBeDelegatedFormatted,
    recommendedGasLimit,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    setUserPreferredGasPrice,
    userPreferredGasPrice,
    gasOption,
    setGasOption,
    setFeeDenom,
    memo,
    setMemo,
    showLedgerPopup,
    setLedgerError,
    ledgerError,
  };
}
