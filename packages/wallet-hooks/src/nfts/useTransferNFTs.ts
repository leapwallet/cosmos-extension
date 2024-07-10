import { MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { toUtf8 } from '@cosmjs/encoding';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, GasPrice, StdFee } from '@cosmjs/stargate';
import {
  DefaultGasEstimates,
  encodeErc72TransferData,
  EthermintTxHandler,
  fromSmall,
  InjectiveTx,
  NativeDenom,
  SeiEvmTx,
  SupportedChain,
  Tx,
} from '@leapwallet/cosmos-wallet-sdk';
import PollForTx from '@leapwallet/cosmos-wallet-sdk/dist/browser/tx/nft-transfer/contract';
import { EthWallet } from '@leapwallet/leap-keychain';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { ReactNode, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import {
  getCompassSeiEvmConfigStoreSnapshot,
  PendingTx,
  useActiveChain,
  useChainApis,
  useDefaultGasEstimates,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import {
  GasOptions,
  getMetaDataForNFTSendTx,
  getSeiEvmInfo,
  SeiEvmInfoEnum,
  sliceAddress,
  useGasRateQuery,
  useNativeFeeDenom,
} from '../utils';
import { useChainId, useChainInfo, useFetchAccountDetails } from '../utils-hooks';
import { ExecuteInstruction, UseSendNftReturnType } from './types';

export const useSendNft = (collectionId: string, forceChain?: SupportedChain): UseSendNftReturnType => {
  const [showLedgerPopup] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const chainInfo = useChainInfo();
  const { setPendingTx } = usePendingTxState();
  const activeChain = useActiveChain();
  const selectedNetwork = useSelectedNetwork();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();

  const activeChainId = useChainId(activeChain, selectedNetwork);
  const defaultGasEstimates = useDefaultGasEstimates();
  const {
    status: fetchAccountDetailsStatus,
    data: fetchAccountDetailsData,
    fetchDetails: fetchAccountDetails,
  } = useFetchAccountDetails();

  const [gasOption] = useState<GasOptions>(GasOptions.LOW);
  const [gasEstimate, setGasEstimate] = useState<number>(
    defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
  );

  const gasAdjustment = useGasAdjustmentForChain(activeChain);
  const gasPrices = useGasRateQuery(activeChain, selectedNetwork, collectionId.toLowerCase().startsWith('0x'));

  // Change when using forceChain
  const nativeFeeDenom = useNativeFeeDenom(forceChain);
  const [feeDenom] = useState<NativeDenom & { ibcDenom?: string }>(nativeFeeDenom);
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom];

  const [addressWarning, setAddressWarning] = useState<ReactNode>('');
  const { lcdUrl, rpcUrl, evmJsonRpc } = useChainApis();

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
    if (!rpcUrl || !lcdUrl || !evmJsonRpc || !toAddress || !fromAddress) return;
    const { ARCTIC_EVM_GAS_LIMIT } = await getCompassSeiEvmConfigStoreSnapshot();

    if (collectionId.toLowerCase().startsWith('0x')) {
      try {
        const rpc = (await getSeiEvmInfo({
          activeChain: activeChain as 'seiDevnet' | 'seiTestnet2',
          activeNetwork: selectedNetwork,
          infoType: SeiEvmInfoEnum.EVM_RPC_URL,
        })) as string;

        const data = encodeErc72TransferData([fromAddress, toAddress, tokenId]);
        const gasUsed = await SeiEvmTx.SimulateTransaction(collectionId ?? '', '', rpc, data, undefined, fromAddress);

        setGasEstimate(gasUsed);
        return gasUsed;
      } catch (_) {
        setGasEstimate(ARCTIC_EVM_GAS_LIMIT * 10);
        return ARCTIC_EVM_GAS_LIMIT * 10;
      }
    }

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
    if (!rpcUrl || !lcdUrl || !evmJsonRpc) return;

    try {
      setIsSending(true);
      let txHash = '';
      let isEvmTx = false;
      let promise = new Promise((resolve) => {
        resolve({ code: 0 } as any);
      });

      if (collectionId.toLowerCase().startsWith('0x')) {
        const chainId = (await getSeiEvmInfo({
          activeChain: activeChain,
          activeNetwork: selectedNetwork,
          infoType: SeiEvmInfoEnum.EVM_CHAIN_ID,
        })) as number;

        const seiEvmTx = SeiEvmTx.GetSeiEvmClient(wallet as unknown as EthWallet, evmJsonRpc ?? '', chainId);
        const result = await seiEvmTx.transferErc721Token({
          erc721ContractAddress: collectionId,
          tokenId,
          from: fromAddress,
          to: toAddress,
          gas: gasEstimate,
        });

        txHash = result.hash;
        isEvmTx = true;
      } else {
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
        const result: any = await client.execute(fromAddress, collectionId, tx.msg, tx.fee, tx.memo, tx.funds);

        if (result && result.code !== undefined && result.code !== 0) {
          setIsSending(false);
          return {
            success: false,
            errors: ['Transaction declined'],
          };
        }

        txHash = result.transactionHash;
        promise = pollForTx.pollForTx(txHash);
      }

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
          promise,
          isEvmTx,
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

      if (collectionId.toLowerCase().startsWith('0x')) {
        const evmTxHash = _result.data.txHash;
        const evmRpcUrl = await getSeiEvmInfo({
          activeChain,
          activeNetwork: selectedNetwork,
          infoType: SeiEvmInfoEnum.EVM_RPC_URL,
        });

        try {
          const cosmosTxHash = await SeiEvmTx.GetCosmosTxHash(evmTxHash, evmRpcUrl as string);
          txPostToDB({
            txHash: cosmosTxHash,
            txType: _result.data.txType,
            metadata: _result.data.metadata,
            chainId: activeChainId,
          });
        } catch {
          // GetCosmosTxHash is currently failing
        }
      } else {
        txPostToDB({ ..._result.data, chainId: activeChainId });
      }

      setIsSending(false);
      setPendingTx({ ..._result.pendingTx, toAddress: toAddress });
      return _result;
    } catch (e) {
      setIsSending(false);

      if ((e as Error).message.toLowerCase().includes('out of gas')) {
        return {
          success: false,
          errors: [(e as Error).message],
        };
      }

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
    fetchAccountDetails,
    fetchAccountDetailsData,
    fetchAccountDetailsStatus,
    setAddressWarning,
    addressWarning,
  };
};
