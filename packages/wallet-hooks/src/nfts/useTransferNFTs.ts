import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { toHex, toUtf8 } from '@cosmjs/encoding';
import { GeneratedType, OfflineSigner, Registry } from '@cosmjs/proto-signing';
import { calculateFee, defaultRegistryTypes, GasPrice, StdFee } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import {
  coreumRegistryTypes,
  DefaultGasEstimates,
  DenomsRecord,
  encodeErc72TransferData,
  EthermintTxHandler,
  fromSmall,
  InjectiveTx,
  NativeDenom,
  pubKeyToEvmAddressToShow,
  SeiEvmTx,
  SupportedChain,
  Tx,
} from '@leapwallet/cosmos-wallet-sdk';
import PollForTx from '@leapwallet/cosmos-wallet-sdk/dist/browser/tx/nft-transfer/contract';
import { EthWallet } from '@leapwallet/leap-keychain';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import {
  getCompassSeiEvmConfigStoreSnapshot,
  PendingTx,
  useActiveChain,
  useActiveWalletStore,
  useChainApis,
  useDefaultGasEstimates,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import { WALLETTYPE } from '../types';
import {
  GasOptions,
  getMetaDataForNFTSendTx,
  SelectedNetworkType,
  sliceAddress,
  useGasRateQuery,
  useNativeFeeDenom,
} from '../utils';
import { useChainId, useChainInfo, useFetchAccountDetails } from '../utils-hooks';
import { ExecuteInstruction, UseSendNftReturnType } from './types';

export const useSendNft = (
  denoms: DenomsRecord,
  collectionId: string,
  forceChain?: SupportedChain,
  forceNetwork?: SelectedNetworkType,
): UseSendNftReturnType => {
  const [showLedgerPopup, setShowLedgerPopup] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const chainInfo = useChainInfo();
  const { setPendingTx } = usePendingTxState();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [_selectedNetwork, forceNetwork]);

  const { activeWallet } = useActiveWalletStore();
  const activeChainId = useChainId(activeChain, selectedNetwork);
  const defaultGasEstimates = useDefaultGasEstimates();
  const {
    status: fetchAccountDetailsStatus,
    data: fetchAccountDetailsData,
    fetchDetails: fetchAccountDetails,
  } = useFetchAccountDetails(activeChain, selectedNetwork);

  const [gasOption] = useState<GasOptions>(GasOptions.LOW);
  const [gasEstimate, setGasEstimate] = useState<number>(
    defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
  );

  const gasAdjustment = useGasAdjustmentForChain(activeChain);
  const gasPrices = useGasRateQuery(denoms, activeChain, selectedNetwork, collectionId.toLowerCase().startsWith('0x'));

  const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork);
  const [feeDenom] = useState<NativeDenom & { ibcDenom?: string }>(nativeFeeDenom);
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom];

  const [addressWarning, setAddressWarning] = useState<ReactNode>('');
  const { lcdUrl, rpcUrl, evmJsonRpc } = useChainApis(activeChain, selectedNetwork);
  const evmChainId = useChainId(activeChain, selectedNetwork, true);
  const chains = useGetChains();

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

  const registry = useMemo(() => {
    const registryTypes: ReadonlyArray<[string, GeneratedType]> = [...defaultRegistryTypes, ...coreumRegistryTypes];
    return new Registry(registryTypes);
  }, []);

  const getMsgs = useCallback(
    (toAddress: string, tokenId: string, memo: string, fromAddress: string) => {
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

      return [instruction].map((i) => {
        if (['mainCoreum', 'coreum'].includes(activeChain)) {
          return {
            typeUrl: '/coreum.nft.v1beta1.MsgSend',
            value: {
              sender: fromAddress,
              receiver: toAddress,
              id: tokenId,
              classId: i.contractAddress,
            },
          };
        }

        return {
          typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
          value: MsgExecuteContract.fromPartial({
            sender: fromAddress,
            contract: i.contractAddress,
            msg: toUtf8(JSON.stringify(i.msg)),
            funds: [...(i.funds || [])],
          }),
        };
      });
    },
    [collectionId],
  );

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
    try {
      if (collectionId.toLowerCase().startsWith('0x') && !evmJsonRpc) {
        return;
      } else if (!rpcUrl || !toAddress || !fromAddress) {
        return;
      }

      if (collectionId.toLowerCase().startsWith('0x')) {
        const { ARCTIC_EVM_GAS_LIMIT } = await getCompassSeiEvmConfigStoreSnapshot();

        try {
          const data = encodeErc72TransferData([fromAddress, toAddress, tokenId]);
          const gasUsed = await SeiEvmTx.SimulateTransaction(
            collectionId ?? '',
            '',
            evmJsonRpc,
            data,
            undefined,
            fromAddress,
          );

          setGasEstimate(gasUsed);
          return gasUsed;
        } catch (_) {
          setGasEstimate(ARCTIC_EVM_GAS_LIMIT * 10);
          return ARCTIC_EVM_GAS_LIMIT * 10;
        }
      }

      const msgs = getMsgs(toAddress, tokenId, memo, fromAddress);
      let options = {};
      if (['mainCoreum', 'coreum'].includes(activeChain)) {
        options = {
          registry,
        };
      }

      const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, options);
      const gasUsed = await client.simulate(fromAddress, msgs, memo);

      setGasEstimate(gasUsed);
      return gasUsed;
    } catch (error) {
      console.log('simulateTransferNFTContract error', error);
    }
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
    if (collectionId.toLowerCase().startsWith('0x') && !evmJsonRpc) {
      return;
    } else if (!rpcUrl || !lcdUrl) {
      return;
    }

    try {
      setIsSending(true);
      let txHash = '';
      let isEvmTx = false;
      let promise = new Promise((resolve) => {
        resolve({ code: 0 } as any);
      });

      if (collectionId.toLowerCase().startsWith('0x')) {
        const seiEvmTx = SeiEvmTx.GetSeiEvmClient(wallet as unknown as EthWallet, evmJsonRpc ?? '', Number(evmChainId));
        const result = await seiEvmTx.transferErc721Token({
          erc721ContractAddress: collectionId,
          tokenId,
          from: fromAddress,
          to: toAddress,
          gas: gasEstimate,
          gasPrice: parseInt(gasPriceOptions?.[gasOption]?.amount?.toString() ?? ''),
        });

        txHash = result.hash;
        isEvmTx = true;
      } else {
        if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
          setShowLedgerPopup(true);
        }

        const pollForTx = new PollForTx(lcdUrl);
        const msgs = getMsgs(toAddress, tokenId, memo, fromAddress);
        let options = {};
        if (activeChain === 'mainCoreum') {
          options = {
            registry,
          };
        }

        const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, options);
        const txRaw = await client.sign(fromAddress, msgs, fees, memo);
        const txBytes = TxRaw.encode(txRaw).finish();

        const tendermintClient = await Tendermint34Client.connect(rpcUrl);
        const broadcasted = await tendermintClient.broadcastTxSync({ tx: txBytes });

        txHash = toHex(broadcasted.hash).toUpperCase();
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

        try {
          if (chains[activeChain]?.evmOnlyChain) {
            txPostToDB({
              txHash: evmTxHash,
              txType: _result.data.txType,
              metadata: _result.data.metadata,
              chainId: activeChainId,
              isEvmOnly: true,
              forceWalletAddress: pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain]),
            });
          } else {
            const cosmosTxHash = await SeiEvmTx.GetCosmosTxHash(evmTxHash, evmJsonRpc);
            txPostToDB({
              txHash: cosmosTxHash,
              txType: _result.data.txType,
              metadata: _result.data.metadata,
              chainId: activeChainId,
            });
          }
        } catch {
          // GetCosmosTxHash is currently failing
        }
      } else {
        txPostToDB({ ..._result.data, chainId: activeChainId });
      }

      setShowLedgerPopup(false);
      setIsSending(false);
      setPendingTx({ ..._result.pendingTx, toAddress: toAddress });
      return _result;
    } catch (e) {
      setShowLedgerPopup(false);
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
    nftSendChain: activeChain,
    nftSendNetwork: selectedNetwork,
  };
};
