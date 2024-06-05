import { toUtf8 } from '@cosmjs/encoding';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, GasPrice, StdFee } from '@cosmjs/stargate';
import { DefaultGasEstimates, fromSmall, NativeDenom, NTRN_GOV_CONTRACT_ADDRESS } from '@leapwallet/cosmos-wallet-sdk';
import PollForTx from '@leapwallet/cosmos-wallet-sdk/dist/browser/tx/nft-transfer/contract';
import { CosmosTxType } from '@leapwallet/leap-api-js';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { useCallback, useMemo, useState } from 'react';
import { Wallet } from 'secretjs';

import { LeapWalletApi } from '../apis';
import { useGasAdjustmentForChain } from '../fees';
import { sendTokensReturnType } from '../send';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import { useCW20TxHandler } from '../tx';
import { TxCallback, VoteOptions } from '../types';
import { GasOptions, getMetaDataForGovVoteTx, useGasRateQuery, useNativeFeeDenom } from '../utils';
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

  const [gasEstimate, setGasEstimate] = useState(
    () => defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
  );

  const [isVoting, setIsVoting] = useState(false);
  const { lcdUrl } = useChainApis();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();

  const gasAdjustment = useGasAdjustmentForChain(activeChain);
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
      const gasAdjustmentValue = gasAdjustment;
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

    const gasAdjustmentValue = gasAdjustment;
    return calculateFee(Math.ceil(_gasLimit * gasAdjustmentValue), _gasPrice);

    // keep feeDenom in the dependency array to update the fee when the denom changes
  }, [gasPriceOptions, gasOption, gasEstimate, userPreferredGasLimit, userPreferredGasPrice, activeChain]);

  const clearTxError = useCallback(() => {
    setTxError(undefined);
  }, []);

  const voteOnProposal = async (
    wallet: OfflineSigner,
    proposalId: number,
    voteOption: VoteOptions,
    customFee?: {
      stdFee: StdFee;
      feeDenom: NativeDenom;
    },
  ): Promise<sendTokensReturnType> => {
    try {
      const pollForTx = new PollForTx(lcdUrl ?? '');
      const client = await getCW20TxClient(wallet as Wallet);

      const result = await client.execute(
        address,
        NTRN_GOV_CONTRACT_ADDRESS,
        {
          vote: { proposal_id: proposalId, vote: voteOption.toLowerCase() },
        },
        customFee?.stdFee ?? fee ?? 'auto',
        memo,
      );

      const txHash = result.transactionHash;
      const pollPromise = pollForTx.pollForTx(txHash);

      return {
        success: true,
        pendingTx: {
          img: chainInfos[activeChain].chainSymbolImageUrl,
          title1: `Voted ${voteOption}`,
          subtitle1: `Proposal ${proposalId}`,
          txStatus: 'loading',
          txType: 'vote',
          promise: pollPromise,
          txHash,
        },
        data: {
          txHash,
          txType: CosmosTxType.GovVote,
          metadata: getMetaDataForGovVoteTx(String(proposalId), getVoteNum(voteOption)),
          feeDenomination: fee?.amount[0].denom ?? '',
          feeQuantity: fee?.amount[0].amount ?? '',
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
    customFee,
  }: {
    voteOption: VoteOptions;
    wallet: OfflineSigner;
    callback: TxCallback;
    proposalId: number;
    customFee?: {
      stdFee: StdFee;
      feeDenom: NativeDenom;
    };
  }) => {
    setIsVoting(true);
    const result = await voteOnProposal(wallet, proposalId, voteOption, customFee);
    setIsVoting(false);

    if (result.success === true) {
      if (result.data) txPostToDB(result.data);
      setPendingTx({ ...result.pendingTx });
      callback('success');
    } else {
      if (result.errors?.includes('txDeclined')) {
        callback('txDeclined');
      }
      setTxError(result.errors?.join(',\n'));
    }
  };

  const simulateNtrnVote = useCallback(
    async (wallet: OfflineSigner, proposalId: number, voteOption: VoteOptions) => {
      try {
        const client = await getCW20TxClient(wallet as Wallet);
        const result = await client.simulate(
          address,
          [
            {
              typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
              value: MsgExecuteContract.fromPartial({
                sender: address,
                contract: NTRN_GOV_CONTRACT_ADDRESS,
                msg: toUtf8(
                  JSON.stringify({
                    vote: { proposal_id: proposalId, vote: voteOption.toLowerCase() },
                  }),
                ),
                funds: [],
              }),
            },
          ],
          memo,
        );

        setGasEstimate(result);
      } catch (_) {
        //
      }
    },
    [memo],
  );

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
    isVoting,
    handleVote,
    simulateNtrnVote,
  };
}
