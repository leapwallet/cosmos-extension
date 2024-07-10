/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fromBase64 } from '@cosmjs/encoding'
import { OfflineDirectSigner } from '@cosmjs/proto-signing'
import { calculateFee } from '@cosmjs/stargate'
import {
  CosmosTxType,
  getChainId,
  getMetaDataForIbcSwapTx,
  getMetaDataForIbcTx,
  getMetaDataForSwapTx,
  getTxnLogAmountValue,
  LeapWalletApi,
  useActiveWallet,
  useGasAdjustmentForChain,
  useGasRateQuery,
  useGetChains,
  useInvalidateTokenBalances,
  useIsCW20Token,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getErrorMessageFromCode,
  LeapLedgerSigner,
  LeapLedgerSignerEth,
  LedgerError,
  sleep,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  createSignDoc,
  fetchAccountDetails,
  getDecodedMessageMetadataForSigning,
  getMessageMetadataForSigning,
  SKIP_TXN_STATUS,
  SkipAPI,
  TransactionStatusResponse,
  TRANSFER_STATE,
  TxClient,
  TXN_STATUS,
} from '@leapwallet/elements-core'
import { LEDGER_ENABLED_EVM_CHAIN_IDS } from 'config/config'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import { Wallet } from 'hooks/wallet/useWallet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SourceChain, SwapTxnStatus, TransferInfo } from 'types/swap'

import { TxPageProps } from '../components'
import { handleCosmosTx } from '../tx/cosmosTxHandler'
import { handleEthermintTx } from '../tx/ethermintTxHandler'
import { handleInjectiveTx } from '../tx/injectiveTxHandler'
import { sendTrackingRequest } from '../utils'
import { useGetChainsToShow } from './useGetChainsToShow'
import { useInvalidateSwapAssetsQueries } from './useInvalidateSwapAssetsQueries'
import { SWAP_NETWORK } from './useSwapsTx'

class TxnError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TxnError'
  }
}

type ExecuteTxParams = Omit<TxPageProps, 'onClose'> & {
  setShowLedgerPopup: React.Dispatch<React.SetStateAction<boolean>>
  setLedgerError?: (ledgerError?: string) => void
  setFeeAmount: React.Dispatch<React.SetStateAction<string>>
  setTrackingInSync: React.Dispatch<React.SetStateAction<boolean>>
}

export function useExecuteTx({
  setShowLedgerPopup,
  setLedgerError,
  route,
  sourceChain,
  sourceToken,
  destinationChain,
  destinationToken,
  feeDenom,
  gasEstimate,
  gasOption,
  userPreferredGasLimit,
  userPreferredGasPrice,
  inAmount,
  amountOut,
  setFeeAmount,
  callbackPostTx,
  feeAmount,
  refetchDestinationBalances,
  refetchSourceBalances,
  setTrackingInSync,
}: ExecuteTxParams) {
  const isCW20Token = useIsCW20Token()
  const getWallet = Wallet.useGetWallet()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const activeWallet = useActiveWallet()
  const { chainsToShow } = useGetChainsToShow()
  const chainInfos = useGetChains()

  const [isLoading, setIsLoading] = useState(true)
  const [timeoutError, setTimeoutError] = useState(false)
  const [firstTxnError, setFirstTxnError] = useState<string>()
  const [unableToTrackError, setUnableToTrackError] = useState<boolean | null>(null)
  const invalidateBalances = useInvalidateTokenBalances()
  const invalidateSwapAssets = useInvalidateSwapAssetsQueries()

  const [txStatus, setTxStatus] = useState<SwapTxnStatus[]>(() =>
    Array.from({ length: route?.transactionCount || 1 }, () => ({
      status: TXN_STATUS.INIT,
      responses: [],
      isComplete: false,
    })),
  )

  const gasAdjustment = useGasAdjustmentForChain(sourceChain?.key ?? '')
  const gasPrices = useGasRateQuery((sourceChain?.key ?? '') as SupportedChain)
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom]

  const fee = useMemo(() => {
    if (feeAmount) {
      return
    }

    const _gasLimit = userPreferredGasLimit ?? gasEstimate
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption]
    if (!_gasPrice) return

    const gasAdjustmentValue = gasAdjustment * (sourceToken && isCW20Token(sourceToken) ? 2 : 1)

    // @ts-ignore
    return calculateFee(Math.ceil(_gasLimit * gasAdjustmentValue), _gasPrice)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gasPriceOptions,
    gasOption,
    gasEstimate,
    userPreferredGasLimit,
    userPreferredGasPrice,
    sourceChain,
    feeDenom,
  ])

  useEffect(() => {
    if (fee) {
      setFeeAmount(fee.amount[0].amount)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee])

  const updateTxStatus = (messageIndex: number, args: SwapTxnStatus) => {
    setTxStatus((prevTxStatus) => {
      const newTxStatus = [...prevTxStatus]
      newTxStatus.splice(messageIndex, 1, args)
      return newTxStatus
    })
  }

  const handleTxError = useCallback(
    (
      messageIndex: number,
      errorMessage: string,
      chain?: SourceChain,
      transferSequence?: TransferInfo[] | undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transferAssetRelease?: any,
    ) => {
      setFirstTxnError(errorMessage)
      updateTxStatus(messageIndex, {
        status: TXN_STATUS.FAILED,
        responses: transferSequence ?? [
          {
            state: TRANSFER_STATE.TRANSFER_FAILURE,
            // @ts-ignore
            data: { error: { message: errorMessage }, chain },
          },
        ],
        transferAssetRelease,
        isComplete: true,
      })
    },
    [],
  )

  const handleMessageTimeout = useCallback((messageIndex: number, chain: SourceChain) => {
    setTimeoutError(true)
    setIsLoading(false)
    updateTxStatus(messageIndex, {
      status: TXN_STATUS.FAILED,
      responses: [
        {
          state: TRANSFER_STATE.TRANSFER_FAILURE,
          // @ts-ignore
          data: { error: 'Transaction timed out', chain },
        },
      ],
      isComplete: false,
    })
  }, [])

  const logTxToDB = useCallback(
    async (txHash: string, msgType: string) => {
      const isIBCSendTx = !route?.response?.does_swap ?? false
      const hasIBC = route?.operations?.some((operation: any) => 'transfer' in operation)
      const denomChainInfo = chainInfos[(sourceToken?.chain ?? '') as SupportedChain]
      const txnLogAmountValue = await getTxnLogAmountValue(inAmount, {
        coinGeckoId: sourceToken?.coinGeckoId ?? '',
        coinMinimalDenom: sourceToken?.coinMinimalDenom ?? '',
        chainId: getChainId(denomChainInfo, SWAP_NETWORK) ?? String(sourceChain?.chainId ?? ''),
        chain: (sourceToken?.chain ?? '') as SupportedChain,
      })

      const txType = isIBCSendTx
        ? CosmosTxType.IbcSend
        : hasIBC
        ? CosmosTxType.IBCSwap
        : CosmosTxType.Swap

      const metadata = isIBCSendTx
        ? await getMetaDataForIbcTx(
            route?.operations?.[0]?.transfer?.channel,
            activeWallet?.addresses?.[destinationChain?.key as SupportedChain] ?? '',
            {
              denom: destinationToken?.coinMinimalDenom ?? '',
              amount: String(Number(amountOut) * 10 ** Number(destinationToken?.coinDecimals ?? 0)),
            },
            'skip_api',
            (route?.response?.chain_ids?.length ?? 1) - 1,
          )
        : hasIBC
        ? getMetaDataForIbcSwapTx(
            msgType,
            'skip_api',
            (route?.response?.chain_ids?.length ?? 1) - 1,
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
        : getMetaDataForSwapTx(
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

      txPostToDB({
        txHash,
        txType: txType,
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
      route?.response?.does_swap,
      route?.response?.chain_ids?.length,
      route?.operations,
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
      destinationToken?.coinDecimals,
      amountOut,
      txPostToDB,
      feeDenom.coinMinimalDenom,
      feeAmount,
      fee?.amount,
      invalidateBalances,
      invalidateSwapAssets,
      refetchSourceBalances,
      refetchDestinationBalances,
      callbackPostTx,
    ],
  )

  const executeTx = useCallback(async () => {
    if (!fee && !feeAmount) return

    setTimeoutError(false)
    setFirstTxnError(undefined)
    setUnableToTrackError(null)
    setLedgerError && setLedgerError(undefined)

    for (let messageIndex = 0; messageIndex < (route?.messages?.length ?? 0); messageIndex++) {
      const messageObj = route.messages[messageIndex]
      const message = messageObj?.multi_chain_msg
      const messageChain = chainsToShow.find((chain) => chain.chainId === message.chain_id)

      if (!messageChain) {
        handleTxError(messageIndex, 'Transaction failed as chain is not found', messageChain)
        throw new Error('Chain info is not found')
      }

      const messageJson = JSON.parse(message.msg)

      updateTxStatus(messageIndex, {
        status: TXN_STATUS.PENDING,
        // @ts-ignore
        responses: [{ state: TRANSFER_STATE.TRANSFER_PENDING }],
        isComplete: false,
      })

      let txHash: string = messageObj?.customTxHash

      if (!txHash && fee) {
        if (new Date().getTime() > Number(messageJson.timeout_timestamp / 10 ** 6)) {
          if (messageIndex !== 0) {
            handleTxError(messageIndex, 'Transaction timed out', messageChain)
          } else {
            handleMessageTimeout(messageIndex, messageChain)
            break
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
          // @ts-ignore
          messageChain.restUrl,
          // @ts-ignore
          messageChain.coinType,
          // @ts-ignore
          wallet,
          { ...walletAccounts[0], pubKey: walletAccounts[0].pubkey },
        )

        let txBytesString: string

        try {
          let txRaw

          if (isLedgerTypeWallet) {
            if (
              sourceChain &&
              LEDGER_ENABLED_EVM_CHAIN_IDS.includes((sourceChain?.chainId as string) ?? '')
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
            const accountDetails = await fetchAccountDetails(messageChain.restUrl, senderAddress)

            const signDoc = createSignDoc(
              String(messageChain.chainId),
              // @ts-ignore
              messageChain.coinType,
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
            if (message === 0) {
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

      let transferAssetRelease
      let transferSequence: TransferInfo[] | undefined
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const txnStatus = await SkipAPI.getTxnStatus({
            chain_id: String(messageChain.chainId),
            tx_hash: txHash,
          })

          if (txnStatus.success) {
            const { state, error, transfer_sequence, transfer_asset_release } = txnStatus.response
            transferSequence =
              transfer_sequence?.map(
                (transfer) =>
                  (
                    transfer as Extract<
                      TransactionStatusResponse['transfer_sequence'][number],
                      { ibc_transfer: unknown }
                    >
                  ).ibc_transfer,
              ) ?? []
            transferAssetRelease = transfer_asset_release
              ? {
                  chainId: transfer_asset_release?.chain_id,
                  denom: transfer_asset_release?.denom,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  released: (transfer_asset_release as any)?.released,
                }
              : undefined

            if (
              state === SKIP_TXN_STATUS.STATE_SUBMITTED ||
              state === SKIP_TXN_STATUS.STATE_PENDING ||
              state === SKIP_TXN_STATUS.STATE_RECEIVED
            ) {
              updateTxStatus(messageIndex, {
                status: TXN_STATUS.SIGNED,
                // @ts-ignore
                responses:
                  transferSequence && transferSequence?.length > 0
                    ? transferSequence
                    : [{ state: TRANSFER_STATE.TRANSFER_PENDING }],
                transferAssetRelease,
                isComplete: false,
              })

              setTrackingInSync(true)
            } else if (state === SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS) {
              const defaultResponses = [
                {
                  src_chain_id: message.chain_id,
                  dst_chain_id: message.chain_id,
                  state: TRANSFER_STATE.TRANSFER_SUCCESS,
                  packet_txs: {
                    send_tx: {
                      chain_id: message.chain_id,
                      tx_hash: txHash,
                    },
                    receive_tx: null,
                    acknowledge_tx: null,
                    timeout_tx: null,
                    error: null,
                  },
                },
              ]

              if (transferSequence.length === 0) {
                updateTxStatus(messageIndex, {
                  status: TXN_STATUS.SUCCESS,
                  responses: defaultResponses,
                  transferAssetRelease,
                  isComplete: true,
                })
              } else {
                const responses =
                  route?.response?.chain_ids?.length === 1 ? defaultResponses : transferSequence

                updateTxStatus(messageIndex, {
                  status: TXN_STATUS.SUCCESS,
                  responses: responses,
                  transferAssetRelease,
                  isComplete: true,
                })
              }

              setTrackingInSync(true)
              break
            } else if (state === SKIP_TXN_STATUS.STATE_ABANDONED) {
              setUnableToTrackError(true)
              throw new Error('Transaction abandoned')
            }

            if (error?.code) {
              // find error message from packet_txs in transfer_sequence array
              let errorMessage = error?.message
              if (transferSequence?.length > 0) {
                const errorResponse = transferSequence?.find(
                  (transfer) => transfer.state === TRANSFER_STATE.TRANSFER_FAILURE,
                )

                if (errorResponse) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  errorMessage = (errorResponse?.packet_txs?.error as any)?.message
                }
              }
              throw new Error(errorMessage)
            }
          } else {
            throw new Error(txnStatus.error)
          }

          await sleep(2000)
        }
      } catch (err) {
        const error = err as Error
        if (
          ['Failed to fetch', 'tx not found', 'Unable to get txn status']?.includes(error.message)
        ) {
          setUnableToTrackError(true)
        }
        handleTxError(
          messageIndex,
          error.message,
          messageChain,
          transferSequence,
          transferAssetRelease,
        )
        setTrackingInSync(true)
        return
      }

      try {
        refetchSourceBalances && refetchSourceBalances()
        refetchDestinationBalances && refetchDestinationBalances()
      } catch (_) {
        //
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeWallet?.walletType,
    chainsToShow,
    fee,
    getWallet,
    handleMessageTimeout,
    refetchDestinationBalances,
    refetchSourceBalances,
    handleTxError,
    logTxToDB,
    route.messages,
    route?.response?.chain_ids?.length,
    sourceChain?.key,
  ])

  const callExecuteTx = useCallback(async () => {
    try {
      setIsLoading(true)
      await executeTx()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err instanceof LedgerError) {
        setLedgerError && setLedgerError(err.message)
      } else {
        setTxStatus(
          Array.from({ length: route?.transactionCount ?? 1 }, () => ({
            status: TXN_STATUS.INIT,
            responses: [],
            isComplete: false,
          })),
        )
      }
    } finally {
      setShowLedgerPopup(false)
      setIsLoading(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeTx, route?.transactionCount])

  return {
    callExecuteTx,
    txStatus,
    timeoutError,
    firstTxnError,
    unableToTrackError,
    isLoading,
  }
}
