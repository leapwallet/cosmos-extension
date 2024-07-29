import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, Coin, GasPrice, StdFee } from '@cosmjs/stargate';
import {
  ChainInfo,
  DefaultGasEstimates,
  feeDenoms,
  fromSmall,
  getSimulationFee,
  NativeDenom,
  simulateTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { getDelegateMsg } from '@leapwallet/cosmos-wallet-sdk';
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking';
import { CosmosTxType } from '@leapwallet/leap-api-js';
import BigNumber from 'bignumber.js';
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { useGasAdjustmentForChain } from '../fees';
import { useformatCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useDenoms,
  useGasPriceSteps,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
  useStakeClaimRewards,
  useTxMetadata,
} from '../store';
import { useTxHandler } from '../tx';
import { Amount } from '../types';
import {
  formatTokenAmount,
  GasOptions,
  getChainId,
  getTxnLogAmountValue,
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

export async function simulateClaimAndStake(
  lcdEndpoint: string,
  fromAddress: string,
  validatorsWithRewards: { validator: string; amount: Coin }[],
  fee: Coin[],
) {
  const encodedClaimAndStakeMsgs: {
    typeUrl: string;
    value: Uint8Array;
  }[] = [];
  validatorsWithRewards.map((validatorWithReward) => {
    const msg = getDelegateMsg(fromAddress, validatorWithReward.validator, validatorWithReward.amount);
    const delegateMsg = {
      typeUrl: msg.typeUrl,
      value: MsgDelegate.encode(msg.value).finish(),
    };
    encodedClaimAndStakeMsgs.push(delegateMsg);
  });
  return await simulateTx(lcdEndpoint, fromAddress, encodedClaimAndStakeMsgs, { amount: fee });
}

export function useClaimAndStakeRewards(
  delegations: Record<string, Delegation> | undefined,
  chainRewards: ChainRewards,
  setError: Dispatch<SetStateAction<string>>,
  forceChain?: SupportedChain,
  forceAddress?: string,
) {
  const denoms = useDenoms();
  const txMetadata = useTxMetadata();
  const userAddress = useAddress();
  const address = forceAddress ?? userAddress;
  const activeChain = useActiveChain();
  const chain = forceChain ?? activeChain;
  const chainInfos = useGetChains();
  const defaultGasEstimates = useDefaultGasEstimates();
  const gasPriceSteps = useGasPriceSteps();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const getTxHandler = useTxHandler();
  const { lcdUrl } = useChainApis(chain as SupportedChain);
  const { setPendingTx } = usePendingTxState();
  const selectedNetwork = useSelectedNetwork();
  const { refetchDelegatorRewards } = useStakeClaimRewards();
  const [formatCurrency] = useformatCurrency();

  const [loading, setLoading] = useState<boolean>(false);
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const nativeFeeDenom = useNativeFeeDenom();
  const gasAdjustment = useGasAdjustmentForChain();
  const gasPrices = useGasRateQuery(activeChain, selectedNetwork);

  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom);
  const [gasPriceOptions, setGasPriceOptions] = useState(gasPrices?.[feeDenom.coinMinimalDenom]);
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
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
    const nativeDenom = getNativeDenom(chainInfos, chain as SupportedChain, 'mainnet');

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
  }, [chain, chainRewards.rewards.rewardMap]);

  const claimAndStakeRewards = useCallback(
    async (wallet: OfflineSigner, callbacks?: { success?: () => void; error?: () => void }) => {
      try {
        if (!address) {
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

          const defaultGasStake = defaultGasEstimates[chain as SupportedChain]?.DEFAULT_GAS_STAKE;

          let gasEstimate = defaultGasStake;
          try {
            const feeDenom = getNativeDenom(chainInfos, chain, selectedNetwork);
            const fee = getSimulationFee(feeDenom?.coinMinimalDenom);
            try {
              const { gasUsed } = await simulateClaimAndStake(lcdUrl ?? '', address, validatorsWithRewards, fee);
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
          const gasPriceStep = gasPriceSteps[chain as SupportedChain].low.toString();
          const denom = feeDenoms['mainnet'][chain as SupportedChain]; // fee denom for given chain
          const gasPrice = GasPrice.fromString(`${gasPriceStep + denom.coinMinimalDenom}`);
          let fee: StdFee;
          if (customFee !== undefined) {
            fee = customFee;
          } else {
            fee = calculateFee(Math.round((gasEstimate ?? defaultGasStake) * 1.5), gasPrice);
          }

          txHandler
            .claimAndStake(address, validatorsWithRewards, fee)
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
                chainId: getChainId(denomChainInfo, selectedNetwork),
              });
              await txPostToDB({
                txHash,
                txType: CosmosTxType.StakeClaimAndDelegate,
                metadata,
                feeDenomination: fee.amount[0].denom,
                amount: txnLogAmountValue,
                feeQuantity: fee.amount[0].amount,
              });
              setPendingTx({
                img: chainInfos[chain as SupportedChain].chainSymbolImageUrl,
                sentAmount: formatTokenAmount(chainRewards.rewardsDenomValue.toString(), '', 4),
                sentTokenInfo: denom,
                sentUsdValue: formatCurrency(chainRewards.rewardsUsdValue),
                subtitle1: `Validator ${'Unknown'}`,
                title1: `Claim and Stake Rewards`,
                txStatus: 'loading',
                txType: 'delegate',
                promise: txResult,
                txHash,
              });
              setLoading(false);
              refetchDelegatorRewards();
              callbacks?.success?.();
              // navigate(`/portfolio/activity?chain=${chain}`)
            })
            .catch((e: any) => {
              setLoading(false);
              if (callbacks?.error) {
                callbacks?.error?.();
              }
              if (typeof e === 'string') {
                setError(e);
              } else if (e instanceof Error) {
                setError(e.message);
              }
              setTimeout(() => setError(''), 3000);
            });
        }
      } catch (e) {
        setLoading(false);
        if (callbacks?.error) {
          callbacks?.error?.();
        }
        if (typeof e === 'string') {
          setError(e);
        } else if (e instanceof Error) {
          setError(e.message);
        }
        setTimeout(() => setError(''), 3000);
      }
    },
    [
      address,
      chain,
      chainRewards.rewardsUsdValue,
      defaultGasEstimates,
      customFee,
      delegations,
      gasPriceSteps,
      getTxHandler,
      lcdUrl,
      refetchDelegatorRewards,
      selectedNetwork,
      setError,
      setPendingTx,
      totalRewardsToBeClaimedAndStaked,
      txMetadata,
      txPostToDB,
      validatorsWithRewards,
    ],
  );

  const { rewardsToBeDelegated, rewardsToBeDelegatedFormatted } = useMemo(() => {
    const nativeDenom = Object.values(chainInfos[chain].nativeDenoms).find(
      (d) => d.coinDenom === chainInfos[chain].denom,
    );

    const amount = fromSmall(String(totalRewardsToBeClaimedAndStaked), nativeDenom?.coinDecimals ?? 6);
    return {
      rewardsToBeDelegated: amount,
      rewardsToBeDelegatedFormatted: formatTokenAmount(amount, nativeDenom?.coinDenom),
    };
  }, [chain, totalRewardsToBeClaimedAndStaked]);

  useEffect(() => {
    (async function () {
      if (!address) {
        return;
      }
      const defaultGasStake =
        defaultGasEstimates[chain as SupportedChain]?.DEFAULT_GAS_STAKE ?? DefaultGasEstimates?.DEFAULT_GAS_STAKE;
      let gasEstimate = defaultGasStake;
      const feeDenom = getNativeDenom(chainInfos, chain, selectedNetwork);
      const fee = getSimulationFee(feeDenom?.coinMinimalDenom);
      const { gasUsed } = await simulateClaimAndStake(lcdUrl ?? '', address, validatorsWithRewards, fee);
      gasEstimate = gasUsed;
      setRecommendedGasLimit(gasEstimate.toString());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalRewardsToBeClaimedAndStaked]);

  return {
    claimAndStakeRewards,
    loading,
    rewardsToBeDelegated,
    rewardsToBeDelegatedFormatted,
    recommendedGasLimit,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    userPreferredGasPrice,
    gasOption,
    setGasOption,
    setFeeDenom,
  };
}
