/* eslint-disable no-console */
import { fromBase64 } from '@cosmjs/encoding'
import { OfflineDirectSigner } from '@cosmjs/proto-signing'
import { StdFee } from '@cosmjs/stargate'
import {
  CosmosTxType,
  GasOptions,
  getChainId,
  getMetaDataForBridgeSendTx,
  getMetaDataForBridgeSwapTx,
  getMetaDataForIbcSwapTx,
  getMetaDataForIbcTx,
  getMetaDataForSwapTx,
  getTxnLogAmountValue,
  LeapWalletApi,
  useActiveWallet,
  useChainApis,
  useGasRateQuery,
  useGetChains,
  useGetExplorerTxnUrl,
  useInvalidateTokenBalances,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  DenomsRecord,
  GasPrice,
  getErrorMessageFromCode,
  LeapLedgerSigner,
  LeapLedgerSignerEth,
  LedgerError,
  NativeDenom,
  SeiEvmTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  createSignDoc,
  fetchAccountDetails,
  getDecodedMessageMetadataForSigning,
  getMessageMetadataForSigning,
  TRANSFER_STATE,
  TxClient,
  TXN_STATUS,
} from '@leapwallet/elements-core'
import { EthWallet } from '@leapwallet/leap-keychain'
import { TransferAssetRelease } from '@skip-go/client'
import { BigNumber } from 'bignumber.js'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import { Wallet } from 'hooks/wallet/useWallet'
import { useInvalidateSwapAssetsQueries } from 'pages/swaps-v2/hooks/txExecution/useInvalidateSwapAssetsQueries'
import { useGetChainsToShow } from 'pages/swaps-v2/hooks/useGetChainsToShow'
import { SkipRouteResponse } from 'pages/swaps-v2/hooks/useRoute'
import { RoutingInfo, SkipMsgWithCustomTxHash, SWAP_NETWORK } from 'pages/swaps-v2/hooks/useSwapsTx'
import { handleCosmosTx } from 'pages/swaps-v2/tx/cosmosTxHandler'
import { handleEthermintTx } from 'pages/swaps-v2/tx/ethermintTxHandler'
import { handleInjectiveTx } from 'pages/swaps-v2/tx/injectiveTxHandler'
import {
  approveTokenAllowanceIfNeeded,
  capitalizeFirstLetter,
  getChainIdsFromRoute,
  sendTrackingRequest,
} from 'pages/swaps-v2/utils'
import { routeDoesSwap } from 'pages/swaps-v2/utils/priceImpact'
import { useCallback, useMemo } from 'react'
import { SourceChain, SourceToken, SwapTxnStatus, TransferSequence } from 'types/swap'
import { getLedgerEnabledEvmChainsIds } from 'utils/getLedgerEnabledEvmChains'

import { usePollTx } from './polling/usePollTx'

class TxnError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TxnError'
  }
}

export type ExecuteSkipTransactionParams = {
  fee: StdFee | undefined
  feeAmount: string | undefined
  sourceChain: SourceChain | undefined
  routingInfo: RoutingInfo
  inAmount: string
  sourceToken: SourceToken | null
  destinationToken: SourceToken | null
  destinationChain: SourceChain | undefined
  amountOut: string
  feeDenom: NativeDenom & {
    ibcDenom?: string | undefined
  }
  handleTxError: (
    messageIndex: number,
    errorMessage: string,
    chain?: SourceChain,
    transferSequence?: TransferSequence[] | undefined,
    transferAssetRelease?: TransferAssetRelease | undefined,
  ) => void
  setIsLoading: (isLoading: boolean) => void
  setTimeoutError: (timeoutError: boolean) => void
  setFirstTxnError: (firstTxnError: string | undefined) => void
  setUnableToTrackError: (unableToTrackError: boolean | null) => void
  updateTxStatus: (messageIndex: number, args: SwapTxnStatus) => void
  setLedgerError: ((ledgerError?: string) => void) | undefined
  setIsSigningComplete: (isSigningComplete: boolean) => void
  setTrackingInSync: (trackingInSync: boolean) => void
  refetchSourceBalances?: (() => void) | undefined
  refetchDestinationBalances?: (() => void) | undefined
  getSwapFeeInfo: () => Promise<{
    feeCharged: number
    feeCollectionAddress: string | undefined
    feeAmount: number | null
  } | null>
  callbackPostTx?: (() => void) | undefined
  setShowLedgerPopup: (showLedgerPopup: boolean) => void
  setShowLedgerPopupText: (showLedgerPopupText: string) => void
  userPreferredGasLimit: number | undefined
  userPreferredGasPrice: GasPrice | undefined
  gasEstimate: number
  gasOption: GasOptions
  denoms: DenomsRecord
}

export function useExecuteSkipTransaction({
  feeDenom,
  fee,
  feeAmount,
  sourceChain,
  routingInfo,
  inAmount,
  sourceToken,
  destinationToken,
  destinationChain,
  amountOut,
  handleTxError,
  setIsLoading,
  setTimeoutError,
  setFirstTxnError,
  setUnableToTrackError,
  setLedgerError,
  updateTxStatus,
  setIsSigningComplete,
  setTrackingInSync,
  refetchSourceBalances,
  refetchDestinationBalances,
  getSwapFeeInfo,
  callbackPostTx,
  setShowLedgerPopup,
  setShowLedgerPopupText,
  userPreferredGasLimit,
  userPreferredGasPrice,
  gasEstimate,
  gasOption,
  denoms,
}: ExecuteSkipTransactionParams) {
  const getWallet = Wallet.useGetWallet()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const activeWallet = useActiveWallet()
  const { chainsToShow } = useGetChainsToShow()
  const chainInfos = useGetChains()

  const { evmJsonRpc } = useChainApis((sourceChain?.key ?? '') as SupportedChain, SWAP_NETWORK)

  const gasPrices = useGasRateQuery(denoms, (sourceChain?.key ?? '') as SupportedChain)
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom]

  const invalidateBalances = useInvalidateTokenBalances()
  const invalidateSwapAssets = useInvalidateSwapAssetsQueries()
  const { getExplorerTxnUrl } = useGetExplorerTxnUrl({
    forceChain: sourceChain?.key as SupportedChain,
    forceNetwork: SWAP_NETWORK,
  })

  const ledgerEnabledEvmChainsIds = useMemo(() => {
    return getLedgerEnabledEvmChainsIds(Object.values(chainInfos))
  }, [chainInfos])

  const handleMessageTimeout = useCallback(
    (messageIndex: number, chain: SourceChain) => {
      setTimeoutError(true)
      setIsLoading(false)
      updateTxStatus(messageIndex, {
        status: TXN_STATUS.FAILED,
        responses: [
          {
            state: TRANSFER_STATE.TRANSFER_FAILURE,
            error: { message: 'Transaction timed out' },
            type: 'ibcTransfer',
            destChainID: '',
            srcChainID: chain?.chainId || '',
            packetTxs: { sendTx: null, receiveTx: null, acknowledgeTx: null, timeoutTx: null },
            originalState: TRANSFER_STATE.TRANSFER_FAILURE,
          },
        ],
        isComplete: false,
      })
    },
    [setIsLoading, setTimeoutError, updateTxStatus],
  )

  const logTxToDB = useCallback(
    async (txHash: string, msgType: string, isEvmOnly?: boolean) => {
      const operations = routingInfo?.route?.operations
      const hasIBC = !!operations?.some((operation) => 'transfer' in operation)
      const hasSwap = routeDoesSwap(routingInfo?.route) || false

      let bridgeName
      for (const operation of operations || []) {
        if ('cctp_transfer' in operation) {
          bridgeName = 'cctp'
          break
        }
        if ('axelar_transfer' in operation) {
          bridgeName = 'axelar'
          break
        }
        if ('go_fast_transfer' in operation) {
          bridgeName = 'go_fast'
          break
        }
        if ('hyperlane_transfer' in operation) {
          bridgeName = 'hyperlane'
          break
        }
      }
      const sourceDenomChainInfo = chainInfos[(sourceToken?.chain ?? '') as SupportedChain]
      const destinationDenomChainInfo =
        chainInfos[(destinationToken?.chain ?? '') as SupportedChain]

      const txnLogAmountValue = await getTxnLogAmountValue(
        inAmount,
        {
          coinGeckoId: sourceToken?.coinGeckoId ?? '',
          coinMinimalDenom: sourceToken?.coinMinimalDenom ?? '',
          chainId:
            getChainId(sourceDenomChainInfo, SWAP_NETWORK) ?? String(sourceChain?.chainId ?? ''),
          chain: (sourceToken?.chain ?? '') as SupportedChain,
        },
        amountOut,
        {
          coinGeckoId: destinationToken?.coinGeckoId ?? '',
          coinMinimalDenom: destinationToken?.coinMinimalDenom ?? '',
          chainId:
            getChainId(destinationDenomChainInfo, SWAP_NETWORK) ??
            String(destinationChain?.chainId ?? ''),
          chain: (destinationToken?.chain ?? '') as SupportedChain,
        },
      )

      let txType = CosmosTxType.IbcSend

      if (hasSwap) {
        txType = CosmosTxType.Swap
        if (bridgeName) {
          txType = CosmosTxType.BridgeSwap
        } else if (hasIBC) {
          txType = CosmosTxType.IBCSwap
        }
      } else {
        if (bridgeName) {
          txType = CosmosTxType.BridgeSend
        } else if (hasIBC) {
          txType = CosmosTxType.IbcSend
        }
      }

      let metadata
      switch (txType) {
        case CosmosTxType.IBCSwap: {
          metadata = getMetaDataForIbcSwapTx(
            msgType,
            'skip_api',
            getChainIdsFromRoute(routingInfo?.route)?.length ?? 1,
            String(sourceChain?.chainId ?? ''),
            {
              denom: sourceToken?.coinMinimalDenom ?? '',
              amount: Number(inAmount) * 10 ** Number(sourceToken?.coinDecimals ?? 0),
            },
            String(destinationChain?.chainId ?? ''),
            {
              denom: destinationToken?.coinMinimalDenom ?? '',
              amount: Number(amountOut) * 10 ** Number(destinationToken?.coinDecimals ?? 0),
            },
          )
          break
        }
        case CosmosTxType.Swap: {
          metadata = getMetaDataForSwapTx(
            'skip_api',
            {
              denom: sourceToken?.coinMinimalDenom ?? '',
              amount: Number(inAmount) * 10 ** Number(sourceToken?.coinDecimals ?? 0),
            },
            {
              denom: destinationToken?.coinMinimalDenom ?? '',
              amount: Number(amountOut) * 10 ** Number(destinationToken?.coinDecimals ?? 0),
            },
          )
          break
        }
        case CosmosTxType.BridgeSend: {
          metadata = getMetaDataForBridgeSendTx(
            'skip_api',
            getChainIdsFromRoute(routingInfo?.route)?.length ?? 1,
            String(sourceChain?.chainId ?? ''),
            {
              denom: sourceToken?.coinMinimalDenom ?? '',
              amount: Number(inAmount) * 10 ** Number(sourceToken?.coinDecimals ?? 0),
            },
            String(destinationChain?.chainId ?? ''),
            {
              denom: destinationToken?.coinMinimalDenom ?? '',
              amount: Number(amountOut) * 10 ** Number(destinationToken?.coinDecimals ?? 0),
            },
            bridgeName ?? '',
          )
          break
        }
        case CosmosTxType.BridgeSwap: {
          metadata = getMetaDataForBridgeSwapTx(
            'skip_api',
            getChainIdsFromRoute(routingInfo?.route)?.length ?? 1,
            String(sourceChain?.chainId ?? ''),
            {
              denom: sourceToken?.coinMinimalDenom ?? '',
              amount: Number(inAmount) * 10 ** Number(sourceToken?.coinDecimals ?? 0),
            },
            String(destinationChain?.chainId ?? ''),
            {
              denom: destinationToken?.coinMinimalDenom ?? '',
              amount: Number(amountOut) * 10 ** Number(destinationToken?.coinDecimals ?? 0),
            },
            bridgeName ?? '',
          )
          break
        }
        default: {
          metadata = await getMetaDataForIbcTx(
            routingInfo?.route?.operations?.[0]?.transfer?.channel,
            activeWallet?.addresses?.[destinationChain?.key as SupportedChain] ?? '',
            {
              denom: destinationToken?.coinMinimalDenom ?? '',
              amount: String(Number(amountOut) * 10 ** Number(destinationToken?.coinDecimals ?? 0)),
            },
            'skip_api',
            getChainIdsFromRoute(routingInfo?.route)?.length ?? 1,
          )
          break
        }
      }

      try {
        const swapFeeInfo = await getSwapFeeInfo()
        if (swapFeeInfo && isEvmOnly !== true) {
          metadata = {
            ...metadata,
            ...swapFeeInfo,
          }
        }
      } catch (_) {
        //
      }

      txPostToDB({
        txHash,
        txType: txType,
        isEvmOnly,
        amount: txnLogAmountValue,
        metadata,
        feeDenomination: feeDenom.coinMinimalDenom,
        feeQuantity: feeAmount ?? fee?.amount[0].amount,
        forceWalletAddress:
          activeWallet?.addresses?.[(sourceChain?.key as SupportedChain) ?? 'cosmos'],
        forceChain: String(sourceChain?.key ?? ''),
        forceNetwork: SWAP_NETWORK,
      })

      const timerId = setTimeout(() => {
        invalidateBalances((sourceChain?.key as SupportedChain) ?? 'cosmos')
        invalidateBalances(destinationChain?.key as SupportedChain)

        try {
          refetchSourceBalances && refetchSourceBalances()
          refetchDestinationBalances && refetchDestinationBalances()
        } catch (_) {
          //
        }

        try {
          callbackPostTx && callbackPostTx()
        } catch (_) {
          //
        }

        invalidateSwapAssets((sourceChain?.key as SupportedChain) ?? 'cosmos')
        invalidateSwapAssets(destinationChain?.key as SupportedChain)

        clearTimeout(timerId)
      }, 2000)
    },
    [
      routingInfo?.route,
      chainInfos,
      sourceToken?.chain,
      sourceToken?.coinGeckoId,
      sourceToken?.coinMinimalDenom,
      sourceToken?.coinDecimals,
      inAmount,
      sourceChain?.chainId,
      sourceChain?.key,
      activeWallet?.addresses,
      destinationChain?.key,
      destinationChain?.chainId,
      destinationToken?.coinMinimalDenom,
      destinationToken?.coinGeckoId,
      destinationToken?.chain,
      destinationToken?.coinDecimals,
      amountOut,
      txPostToDB,
      feeDenom.coinMinimalDenom,
      feeAmount,
      fee?.amount,
      getSwapFeeInfo,
      invalidateBalances,
      invalidateSwapAssets,
      refetchSourceBalances,
      refetchDestinationBalances,
      callbackPostTx,
    ],
  )

  const pollTx = usePollTx(
    setTrackingInSync,
    setUnableToTrackError,
    updateTxStatus,
    handleTxError,
    refetchSourceBalances,
    refetchDestinationBalances,
  )

  return useCallback(
    async (
      messages: SkipMsgWithCustomTxHash[] | undefined,
      route: SkipRouteResponse | undefined,
    ) => {
      if (!fee && !feeAmount) return
      if (!messages || !route) {
        handleTxError(0, 'Error fetching route info', sourceChain)
        setIsLoading(false)
        return
      }

      setTimeoutError(false)
      setFirstTxnError(undefined)
      setUnableToTrackError(null)
      setLedgerError && setLedgerError(undefined)

      const messageIndex = 0

      // TODO: find a better way to `type` this
      const messageObj = messages?.[messageIndex]
      if ('evm_tx' in messageObj) {
        const message = messageObj.evm_tx
        const messageChain = chainsToShow.find((chain) => chain.chainId === message?.chain_id)
        if (!messageChain) {
          handleTxError(messageIndex, 'Transaction failed as chain is not found', messageChain)
          throw new Error('Chain info is not found')
        }
        let txHash: string | undefined = messageObj.customTxHash
        try {
          if (!txHash && fee) {
            const wallet = (await getWallet(
              sourceChain?.key ?? ('' as SupportedChain),
              true,
            )) as unknown as EthWallet

            const seiEvmTx = SeiEvmTx.GetSeiEvmClient(
              wallet,
              evmJsonRpc ?? '',
              Number(message.chain_id),
            )

            if (!fee) {
              handleTxError(messageIndex, 'Error calculating fee', messageChain)
              setIsLoading(false)
              return
            }

            const isLedgerTypeWallet = activeWallet?.walletType === WALLETTYPE.LEDGER

            const gasLimit = userPreferredGasLimit ?? gasEstimate
            let gasPrice: number | undefined
            try {
              if (userPreferredGasPrice) {
                gasPrice = userPreferredGasPrice?.amount?.ceil()?.toFloatApproximation()
              } else if (gasPriceOptions?.[gasOption]) {
                gasPrice = gasPriceOptions?.[gasOption]?.amount?.ceil()?.toFloatApproximation()
              }
            } catch (e) {
              console.error('Error calculating gas price', e)
            }

            if (message.required_erc20_approvals.length > 0) {
              for await (const approval of message.required_erc20_approvals) {
                await approveTokenAllowanceIfNeeded(
                  Number(message.chain_id),
                  evmJsonRpc ?? '',
                  wallet,
                  (message as any).signer_address,
                  approval.token_contract,
                  approval.spender,
                  approval.amount,
                  gasPrice,
                  isLedgerTypeWallet,
                  setShowLedgerPopup,
                  setShowLedgerPopupText,
                )
              }
            }

            if (isLedgerTypeWallet) {
              setShowLedgerPopup(true)
              if (
                !message?.required_erc20_approvals ||
                message?.required_erc20_approvals.length === 0
              ) {
                await wallet.getAccounts()
              }
            }

            const res = await seiEvmTx.sendTransaction(
              '',
              message.to,
              new BigNumber(message.value.toString()).dividedBy(1e18).toString(),
              gasLimit,
              gasPrice,
              `0x${message.data}`,
            )

            setShowLedgerPopup(false)

            txHash = res?.hash

            if (txHash && messageIndex === 0) {
              logTxToDB(txHash, '', true)
            }

            const result = await sendTrackingRequest(String(messageChain.chainId), txHash)
            if (result?.success) {
              const { tx_hash } = result.response
              txHash = tx_hash
            } else {
              setUnableToTrackError(true)
              setIsLoading(false)
              return
            }

            messageObj.customTxHash = txHash
            messageObj.customMessageChainId = String(messageChain.chainId)
          }
          setIsSigningComplete(true)

          if (!txHash) {
            setUnableToTrackError(true)
            setIsLoading(false)

            return
          }

          await pollTx({
            txHash,
            messageChain,
            messageIndex,
            messageChainId: messageChain.chainId,
            routingInfo,
          })

          return
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          if (e instanceof LedgerError) {
            setLedgerError && setLedgerError(e.message)
          } else {
            let errorMessage = ''
            if (e?.code === 'INSUFFICIENT_FUNDS') {
              errorMessage = 'Insufficient funds for transaction'
            } else if (e?.reason) {
              errorMessage = capitalizeFirstLetter(e.reason)
            }
            if (!errorMessage) {
              errorMessage = (e as Error)?.message ?? 'Transaction failed'
            }
            if (e?.transactionHash) {
              // TODO: need to change this to the correct chain
              errorMessage += ` - ${getExplorerTxnUrl(e.transactionHash, messageChain.chainId)}`
            }
            handleTxError(messageIndex, errorMessage, messageChain)
          }
          setShowLedgerPopup(false)
          setIsSigningComplete(true)
          setIsLoading(false)
          return
        }
      }
      if ('svm_tx' in messageObj) {
        handleTxError(0, 'Error fetching route info', sourceChain)
        setIsLoading(false)
        return
      }
      if ('cosmos_tx' in messageObj) {
        handleTxError(0, 'Error fetching route info', sourceChain)
        setIsLoading(false)
        return
      }
      const message = messageObj.multi_chain_msg
      const messageChain = chainsToShow.find((chain) => chain.chainId === message?.chain_id)

      if (!messageChain) {
        handleTxError(messageIndex, 'Transaction failed as chain is not found', messageChain)
        throw new Error('Chain info is not found')
      }

      const messageJson = JSON.parse(message?.msg ?? '{}')

      updateTxStatus(messageIndex, {
        status: TXN_STATUS.PENDING,
        responses: [
          {
            state: TRANSFER_STATE.TRANSFER_PENDING,
            type: 'ibcTransfer',
            destChainID: '',
            srcChainID: messageChain.chainId,
            packetTxs: { sendTx: null, receiveTx: null, acknowledgeTx: null, timeoutTx: null },
            originalState: TRANSFER_STATE.TRANSFER_PENDING,
          },
        ],
        isComplete: false,
      })

      let txHash: string | undefined = messageObj?.customTxHash

      if (!txHash && fee) {
        if (new Date().getTime() > Number(messageJson.timeout_timestamp / 10 ** 6)) {
          if (messageIndex !== 0) {
            handleTxError(messageIndex, 'Transaction timed out', messageChain)
          } else {
            handleMessageTimeout(messageIndex, messageChain)
            return
          }
        }

        const { senderAddress, encodedMessage } = getMessageMetadataForSigning(
          message.msg_type_url,
          messageJson,
        )

        const wallet = await getWallet((sourceChain?.key ?? '') as SupportedChain)
        const isLedgerTypeWallet = activeWallet?.walletType === WALLETTYPE.LEDGER

        if (isLedgerTypeWallet) {
          setShowLedgerPopup(true)
        }

        const walletAccounts = await wallet.getAccounts()

        const txClient = new TxClient(
          String(messageChain.chainId),
          messageChain.restUrl ?? '',
          messageChain.coinType,
          // @ts-expect-error Type error since LeapLedgerSignerEth does not have signDirect method
          wallet,
          { ...walletAccounts[0], pubKey: walletAccounts[0].pubkey },
        )

        let txBytesString: string

        try {
          let txRaw

          if (isLedgerTypeWallet) {
            if (
              sourceChain &&
              ledgerEnabledEvmChainsIds.includes((sourceChain?.chainId as string) ?? '')
            ) {
              if (messageChain.key === 'injective') {
                ;({ txRaw, txBytesString } = await handleInjectiveTx(
                  wallet as unknown as LeapLedgerSignerEth,
                  messageChain,
                  encodedMessage as { typeUrl: string; value: MsgTransfer },
                  senderAddress,
                  fee,
                  { typeUrl: message.msg_type_url, message: messageJson },
                ))
              } else {
                txBytesString = await handleEthermintTx(
                  messageChain,
                  wallet as unknown as LeapLedgerSignerEth,
                  encodedMessage as { typeUrl: string; value: MsgTransfer },
                  fee,
                )
              }
            } else {
              ;({ txRaw, txBytesString } = await handleCosmosTx(
                encodedMessage as { typeUrl: string; value: MsgTransfer },
                fee,
                messageChain,
                wallet as unknown as LeapLedgerSigner,
                senderAddress,
              ))
            }
            if (isLedgerTypeWallet) {
              setShowLedgerPopup(false)
            }
          } else {
            const binaryMessage = getDecodedMessageMetadataForSigning(encodedMessage)
            const accountDetails = await fetchAccountDetails(
              messageChain.restUrl ?? '',
              senderAddress,
            )

            const signDoc = createSignDoc(
              String(messageChain.chainId),
              messageChain.coinType ?? '',
              { ...walletAccounts[0], ...accountDetails, pubKey: walletAccounts[0].pubkey },
              [{ typeUrl: binaryMessage.typeUrl, value: binaryMessage.value }],
              fee,
              '',
            )

            const formattedSignDoc = {
              bodyBytes: signDoc.bodyBytes,
              authInfoBytes: signDoc.authInfoBytes,
              chainId: signDoc.chainId,
              accountNumber: signDoc.accountNumber,
            }

            const signedDoc = await (wallet as OfflineDirectSigner).signDirect(
              senderAddress,
              formattedSignDoc,
            )

            txRaw = TxRaw.fromPartial({
              bodyBytes: signedDoc.signed.bodyBytes,
              authInfoBytes: signedDoc.signed.authInfoBytes,
              signatures: [fromBase64(signedDoc.signature.signature)],
            })
            const txBytes = TxRaw.encode(txRaw).finish()
            txBytesString = Buffer.from(txBytes).toString('base64')
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          if (err instanceof LedgerError) {
            setLedgerError && setLedgerError(err.message)
          } else {
            handleTxError(messageIndex, err.message, messageChain)
          }
          return
        }

        try {
          // We are getting timeout error when broadcasting evmos swap txs signed with ledger on skip api.
          // We throw an error here to trigger the fallback to broadcast the transaction using our nodes
          if (messageChain.key === 'evmos' && isLedgerTypeWallet) {
            throw new Error()
          } else {
            const { success, response } = await txClient.submitTx(
              String(messageChain.chainId),
              txBytesString as string,
            )

            if (!success) throw new Error('Submit txn failed')
            txHash = response.tx_hash
            if (messageIndex === 0) {
              logTxToDB(response.tx_hash, message.msg_type_url)
            }
          }
        } catch (_) {
          try {
            const {
              transactionHash,
              code: txCode,
              codespace,
            } = await txClient.broadcastTx(txBytesString as string)

            txHash = transactionHash

            if (messageIndex === 0) {
              logTxToDB(transactionHash, message.msg_type_url)
            }

            if (txCode !== 0) {
              throw new TxnError(`Transaction failed ${getErrorMessageFromCode(txCode, codespace)}`)
            }
          } catch (error) {
            const errorMessage =
              error instanceof TxnError
                ? error.message
                : `Transaction failed with message: ${(error as Error).message}`

            if (messageIndex <= 0) {
              setFirstTxnError(errorMessage)
              updateTxStatus(messageIndex, {
                status: TXN_STATUS.INIT,
                responses: [],
                isComplete: false,
              })
            } else {
              handleTxError(messageIndex, errorMessage, messageChain)
            }

            return
          }

          const result = await sendTrackingRequest(String(messageChain.chainId), txHash)

          if (result?.success) {
            const { tx_hash } = result.response
            txHash = tx_hash
          } else {
            if (messageIndex === 0) {
              // reset state to init

              updateTxStatus(0, {
                isComplete: false,
                status: TXN_STATUS.INIT,
                responses: [],
              })

              // we can't track transaction, show user explorer tx URL
            }

            setUnableToTrackError(true)
            setIsLoading(false)
            return
          }
        }

        messageObj.customTxHash = txHash
        messageObj.customMessageChainId = String(messageChain.chainId)
      }
      setIsSigningComplete(true)

      if (!txHash) {
        setUnableToTrackError(true)
        setIsLoading(false)

        return
      }

      await pollTx({
        txHash,
        messageChain,
        messageIndex,
        messageChainId: message?.chain_id,
        routingInfo,
      })
    },
    [
      fee,
      feeAmount,
      setTimeoutError,
      setFirstTxnError,
      setUnableToTrackError,
      setLedgerError,
      chainsToShow,
      updateTxStatus,
      setIsSigningComplete,
      pollTx,
      routingInfo,
      handleTxError,
      sourceChain,
      setIsLoading,
      getWallet,
      evmJsonRpc,
      userPreferredGasLimit,
      gasEstimate,
      userPreferredGasPrice,
      gasPriceOptions,
      gasOption,
      logTxToDB,
      getExplorerTxnUrl,
      activeWallet?.walletType,
      handleMessageTimeout,
      setShowLedgerPopup,
      setShowLedgerPopupText,
      ledgerEnabledEvmChainsIds,
    ],
  )
}
