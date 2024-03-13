import { MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { toUtf8 } from '@cosmjs/encoding';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, GasPrice, StdFee } from '@cosmjs/stargate';
import {
  DefaultGasEstimates,
  Dict,
  EthermintTxHandler,
  fromSmall,
  InjectiveTx,
  NativeDenom,
  SigningSscrt,
  SupportedChain,
  Tx,
} from '@leapwallet/cosmos-wallet-sdk';
import PollForTx from '@leapwallet/cosmos-wallet-sdk/dist/tx/nft-transfer/contract';
import { Coin } from '@leapwallet/parser-parfait';
import { BigNumber } from 'bignumber.js';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { useMemo, useState } from 'react';
import { Wallet } from 'secretjs';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import {
  PendingTx,
  useActiveChain,
  useChainApis,
  useDefaultGasEstimates,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import { useChainInfo } from '../store/useChainInfo';
import { ActivityCardContent } from '../types/activity';
import { Token } from '../types/bank';
import { GasOptions, getMetaDataForNFTSendTx, useGasRateQuery, useNativeFeeDenom } from '../utils';
import { sliceAddress } from '../utils/strings';

export type JsonObject = any;

export interface ExecuteInstruction {
  contractAddress: string;
  msg: JsonObject;
  funds?: readonly Coin[];
}

export type sendNftTokensParams = {
  toAddress: string;
  selectedToken: Token;
  amount: BigNumber;
  memo: string;
  getWallet: () => Promise<OfflineSigner | Wallet>;
  fees: StdFee;
  ibcChannelId?: string;
  txHandler?: SigningSscrt | InjectiveTx | EthermintTxHandler | Tx;
};

export type sendNFTTokensReturnType =
  | { success: false; errors: string[] }
  | {
      success: true;
      pendingTx: ActivityCardContent & {
        txHash?: string;
        promise: Promise<any>;
        txStatus: 'loading' | 'success' | 'failed';
        feeDenomination?: string;
        feeQuantity?: string;
      };
      data?: {
        txHash: string;
        txType: CosmosTxType;
        metadata: Dict;
        feeDenomination: string;
        feeQuantity: string;
      };
    };

export const useSendNft = (forceChain?: SupportedChain) => {
  const [showLedgerPopup] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const chainInfo = useChainInfo();
  const { setPendingTx } = usePendingTxState();
  const activeChain = useActiveChain();
  const selectedNetwork = useSelectedNetwork();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();

  const defaultGasEstimates = useDefaultGasEstimates();

  const [gasOption] = useState<GasOptions>(GasOptions.LOW);
  const [gasEstimate, setGasEstimate] = useState<number>(
    defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
  );

  const gasAdjustment = useGasAdjustmentForChain(activeChain);
  const gasPrices = useGasRateQuery(activeChain, selectedNetwork);

  // Change when using forceChain
  const nativeFeeDenom = useNativeFeeDenom(forceChain);
  const [feeDenom] = useState<NativeDenom & { ibcDenom?: string }>(nativeFeeDenom);
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom];

  const { lcdUrl, rpcUrl } = useChainApis();

  /**
   * Fee Calculation:
   * all gas options are used to display fees in big denom to the user.
   * These values should not be used for calculations
   */
  const allGasOptions = useMemo(() => {
    if (!gasPriceOptions) return;

    const getFeeValue = (gasPriceOption: GasPrice) => {
      const gasAdjustmentValue = gasAdjustment * 1;
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
    const _gasLimit = gasEstimate;
    const _gasPrice = gasPriceOptions?.[gasOption];
    if (!_gasPrice) return;

    const gasAdjustmentValue = gasAdjustment;
    return calculateFee(Math.ceil(_gasLimit * gasAdjustmentValue), _gasPrice);

    // keep feeDenom in the dependency array to update the fee when the denom changes
  }, [gasPriceOptions, gasOption, gasEstimate, activeChain]);

  const simulateTransferNFTContract = async ({
    wallet,
    fromAddress,
    toAddress,
    tokenId,
    collectionId,
    memo,
  }: {
    wallet: OfflineSigner;
    fromAddress: string;
    toAddress: string;
    tokenId: string;
    collectionId: string;
    memo: string;
  }) => {
    if (!rpcUrl || !lcdUrl || !toAddress || !fromAddress) return;
    const tx = {
      msg: {
        transfer_nft: {
          recipient: toAddress,
          token_id: tokenId,
        },
      },
      memo: memo,
      funds: [],
    };

    const instruction: ExecuteInstruction = {
      contractAddress: collectionId,
      msg: tx.msg,
      funds: tx.funds,
    };

    const msgs: MsgExecuteContractEncodeObject[] = [instruction].map((i) => ({
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: fromAddress,
        contract: i.contractAddress,
        msg: toUtf8(JSON.stringify(i.msg)),
        funds: [...(i.funds || [])],
      }),
    }));

    const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet);
    const gasUsed = await client.simulate(fromAddress, msgs, memo);

    setGasEstimate(gasUsed);
    return gasUsed;
  };

  const transferNFTContract = async ({
    wallet,
    fromAddress,
    toAddress,
    tokenId,
    collectionId,
    memo,
    fees,
  }: {
    wallet: OfflineSigner;
    fromAddress: string;
    toAddress: string;
    tokenId: string;
    collectionId: string;
    memo: string;
    fees: StdFee;
    txHandler?: InjectiveTx | EthermintTxHandler | Tx;
    ibcChannelId?: string;
  }) => {
    if (!rpcUrl || !lcdUrl) return;
    setIsSending(true);
    try {
      const pollForTx = new PollForTx(lcdUrl);
      const tx = {
        msg: {
          transfer_nft: {
            recipient: toAddress,
            token_id: tokenId,
          },
        },
        fee: fees,
        memo: memo,
        funds: [],
      };

      const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet);

      const res = client
        .execute(fromAddress, collectionId, tx.msg, tx.fee, tx.memo, tx.funds)
        .then((result: any) => {
          if (result && result.code !== undefined && result.code !== 0) {
            setIsSending(false);
            return {
              success: false,
              errors: ['Transaction declined'],
            };
          } else {
            const txHash = result.transactionHash;
            const pollPromise = pollForTx.pollForTx(txHash);

            const _result = {
              success: true,
              pendingTx: {
                txHash,
                img: chainInfo.chainSymbolImageUrl,
                sentUsdValue: '',
                subtitle1: `to ${sliceAddress(toAddress)}`,
                title1: `Sent NFT #${tokenId}`,
                txStatus: 'loading',
                txType: 'send',
                promise: pollPromise,
              } as PendingTx,
              data: {
                txHash,
                txType: CosmosTxType.NFTSend,
                metadata: getMetaDataForNFTSendTx(toAddress, {
                  tokenId,
                  collectionId,
                }),
                feeDenomination: fees.amount[0].denom,
                feeQuantity: fees.amount[0].amount,
              },
            };

            txPostToDB(_result.data);
            setPendingTx({ ..._result.pendingTx, toAddress: toAddress });
            return _result;
          }
        })
        .catch(() => {
          setIsSending(false);
          return {
            success: false,
            errors: ['Transaction declined'],
          };
        });

      setIsSending(false);
      return res;
    } catch (e) {
      setIsSending(false);
      return {
        success: false,
        errors: ['Transaction declined'],
      };
    }
  };

  return {
    showLedgerPopup,
    simulateTransferNFTContract,
    transferNFTContract,
    fee,
    allGasOptions,
    isSending,
  };
};
