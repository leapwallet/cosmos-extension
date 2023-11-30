import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, GasPrice } from '@cosmjs/stargate';
import { DefaultGasEstimates, fromSmall, NativeDenom, NTRN_GOV_CONTRACT_ADDRESS } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useMemo, useState } from 'react';
import { Wallet } from 'secretjs';

import { useGasAdjustment } from '../fees';
import {
  TxStatus,
  useActiveChain,
  useAddress,
  useDefaultGasEstimates,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import { useCW20TxHandler } from '../tx';
import { ActivityType, TxCallback, VoteOptions } from '../types';
import { GasOptions, useGasRateQuery, useNativeFeeDenom } from '../utils';
import { getVoteNum } from './useGov';

export function useNtrnGov() {
  const activeChain = useActiveChain();
  const chainInfos = useGetChains();
  const defaultGasEstimates = useDefaultGasEstimates();
  const nativeFeeDenom = useNativeFeeDenom();
  const address = useAddress();
  const getCW20TxClient = useCW20TxHandler();
  const { setPendingTx } = usePendingTxState();

  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom);
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [txError, setTxError] = useState<string | undefined>(undefined);
  const [memo, setMemo] = useState<string>('');

  const gasEstimate = useMemo(
    () => (defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER) * 3,
    [activeChain, defaultGasEstimates],
  );

  const gasAdjustment = useGasAdjustment(activeChain);
  const selectedNetwork = useSelectedNetwork();
  const gasPrices = useGasRateQuery(activeChain, selectedNetwork);
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom];

  /**
   * Fee Calculation:
   * all gas options are used to display fees in big denom to the user.
   * These values should not be used for calculations
   */
  const allGasOptions = useMemo(() => {
    if (!gasPriceOptions) return;

    const getFeeValue = (gasPriceOption: GasPrice) => {
      const gasAdjustmentValue = gasAdjustment * 3;
      const stdFee = calculateFee(Math.ceil(gasEstimate * gasAdjustmentValue), gasPriceOption);
      return fromSmall(stdFee.amount[0].amount, feeDenom?.coinDecimals);
    };

    return {
      low: getFeeValue(gasPriceOptions.low),
      medium: getFeeValue(gasPriceOptions.medium),
      high: getFeeValue(gasPriceOptions.high),
    };
  }, [activeChain, gasEstimate, gasPriceOptions, feeDenom?.coinDecimals]);

  // This is the fee used in the transaction.
  const fee = useMemo(() => {
    const _gasLimit = userPreferredGasLimit ?? gasEstimate;
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption];
    if (!_gasPrice) return;

    const gasAdjustmentValue = gasAdjustment * 3;
    return calculateFee(Math.ceil(_gasLimit * gasAdjustmentValue), _gasPrice);

    // keep feeDenom in the dependency array to update the fee when the denom changes
  }, [gasPriceOptions, gasOption, gasEstimate, userPreferredGasLimit, userPreferredGasPrice, activeChain]);

  const clearTxError = useCallback(() => {
    setTxError(undefined);
  }, []);

  const voteOnProposal = async (wallet: OfflineSigner, proposalId: number, voteOption: VoteOptions) => {
    try {
      const client = await getCW20TxClient(wallet as Wallet);
      const promise = client.execute(
        address,
        NTRN_GOV_CONTRACT_ADDRESS,
        {
          vote: { proposal_id: proposalId, vote: voteOption.toLowerCase() },
        },
        fee ?? 'auto',
        memo,
      );

      return {
        success: true,
        pendingTx: {
          img: chainInfos[activeChain].chainSymbolImageUrl,
          subtitle1: `Proposal ${proposalId}`,
          title1: `Voted ${voteOption}`,
          txStatus: 'loading' as TxStatus,
          txType: 'vote' as ActivityType,
          promise,
          feeDenomination: fee?.amount[0].denom,
          feeQuantity: fee?.amount[0].amount,
          voteOption: getVoteNum(voteOption),
          proposalId: proposalId,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Transaction declined'],
      };
    }
  };

  const handleVote = async ({
    wallet,
    callback,
    voteOption,
    proposalId,
  }: {
    voteOption: VoteOptions;
    wallet: OfflineSigner;
    callback: TxCallback;
    proposalId: number;
  }) => {
    const result = await voteOnProposal(wallet, proposalId, voteOption);
    if (result.success === true && result.pendingTx) {
      setPendingTx({ ...result.pendingTx });
      callback('success');
    } else {
      if (result.errors?.includes('txDeclined')) {
        callback('txDeclined');
      }
      setTxError(result.errors?.join(',\n'));
    }
  };

  return {
    feeDenom,
    setFeeDenom,
    gasOption,
    setGasOption,
    gasEstimate,
    fee,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    userPreferredGasPrice,
    setUserPreferredGasPrice,
    allGasOptions,
    txError,
    clearTxError,
    memo,
    setMemo,
    isVoting: false,
    handleVote,
  };
}
