/* eslint-disable @typescript-eslint/ban-ts-comment */
import { makeSignDoc as createSignAminoDoc, OfflineAminoSigner } from '@cosmjs/amino'
import { createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate'
import { fromBase64 } from '@cosmjs/encoding'
import { Int53 } from '@cosmjs/math'
import {
  makeAuthInfoBytes,
  OfflineDirectSigner,
  Registry,
  type TxBodyEncodeObject,
} from '@cosmjs/proto-signing'
import {
  AminoTypes,
  calculateFee,
  createDefaultAminoConverters,
  defaultRegistryTypes,
} from '@cosmjs/stargate'
import {
  CosmosTxType,
  LeapWalletApi,
  useActiveWallet,
  useGasAdjustmentForChain,
  useGasRateQuery,
  useIsCW20Tx,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getErrorMessageFromCode,
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
  TRANSFER_STATE,
  TxClient,
  TXN_STATUS,
} from '@leapwallet/elements-core'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SourceChain, SwapTxnStatus } from 'types/swap'

import { TxPageProps } from '../components'
import { getPublicKey, sendTrackingRequest } from '../utils'
import { useGetChainsToShow } from './useGetChainsToShow'

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
  feeAmount,
}: ExecuteTxParams) {
  const isCW20Tx = useIsCW20Tx()
  const getWallet = Wallet.useGetWallet()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const activeWallet = useActiveWallet()
  const chainsToShow = useGetChainsToShow()

  const [isLoading, setIsLoading] = useState(false)
  const [timeoutError, setTimeoutError] = useState(false)
  const [firstTxnError, setFirstTxnError] = useState<string>()
  const [unableToTrackError, setUnableToTrackError] = useState<string | null>(null)
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

    const gasAdjustmentValue = gasAdjustment * (sourceToken && isCW20Tx(sourceToken) ? 2 : 1)

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
    (messageIndex: number, errorMessage: string, chain?: SourceChain) => {
      updateTxStatus(messageIndex, {
        status: TXN_STATUS.FAILED,
        responses: [
          {
            state: TRANSFER_STATE.TRANSFER_FAILURE,
            // @ts-ignore
            data: { error: { message: errorMessage }, chain },
          },
        ],
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
    (txHash: string, msgType: string) => {
      txPostToDB({
        txHash,
        txType: CosmosTxType.Swap,
        metadata: {
          msgType,
          provider: 'skip_api',
          hops: route?.response?.chain_ids?.length ?? 1 - 1,
          fromChain: String(sourceChain?.chainId ?? ''),
          fromToken: {
            denom: sourceToken?.coinMinimalDenom ?? '',
            amount: Number(inAmount) * 10 ** Number(sourceToken?.coinDecimals ?? 0),
          },
          toChain: String(destinationChain?.chainId ?? ''),
          toToken: {
            denom: destinationToken?.coinMinimalDenom ?? '',
            amount: Number(amountOut) * 10 ** Number(destinationToken?.coinDecimals ?? 0),
          },
        },
        feeDenomination: feeDenom.coinMinimalDenom,
        feeQuantity: feeAmount ?? fee?.amount[0].amount,
      })
    },
    [
      amountOut,
      destinationChain?.chainId,
      destinationToken?.coinDecimals,
      destinationToken?.coinMinimalDenom,
      fee?.amount,
      feeAmount,
      feeDenom.coinMinimalDenom,
      inAmount,
      route?.response?.chain_ids?.length,
      sourceChain?.chainId,
      sourceToken?.coinDecimals,
      sourceToken?.coinMinimalDenom,
      txPostToDB,
    ],
  )

  const executeTx = useCallback(async () => {
    if (!fee && !feeAmount) return

    setTimeoutError(false)
    setFirstTxnError(undefined)
    setUnableToTrackError(null)
    setLedgerError && setLedgerError(undefined)

    for (let messageIndex = 0; messageIndex < (route?.messages?.length ?? 0); messageIndex++) {
      const message = route.messages[messageIndex]
      const messageChain = chainsToShow.find((chain) => chain.chainId === message.chain_id)

      if (!messageChain) {
        handleTxError(messageIndex, 'Transaction failed as chain is not found', messageChain)
        throw new Error('Chain info is not found')
      }

      const messageJson = JSON.parse(message.msg)

      if (new Date().getTime() > Number(messageJson.timeout_timestamp / 10 ** 6)) {
        if (messageIndex !== 0) {
          handleTxError(messageIndex, 'Transaction timed out', messageChain)
        } else {
          handleMessageTimeout(messageIndex, messageChain)
          break
        }
      }

      updateTxStatus(messageIndex, {
        status: TXN_STATUS.PENDING,
        // @ts-ignore
        responses: [{ state: TRANSFER_STATE.TRANSFER_PENDING }],
        isComplete: false,
      })

      let txHash: string = message.customTxHash

      if (!txHash && fee) {
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
          // @ts-ignore
          const accountDetails = await fetchAccountDetails(messageChain.restUrl, senderAddress)

          let txRaw

          if (isLedgerTypeWallet) {
            const aminoTypes = new AminoTypes({
              ...createDefaultAminoConverters(),
              ...createWasmAminoConverters(),
            })

            const msgs = [aminoTypes.toAmino(encodedMessage)]

            //@ts-ignore
            if (encodedMessage.value.memo) {
              //@ts-ignore
              msgs[0].value.memo = encodedMessage.value.memo
            }

            const signAminoDoc = createSignAminoDoc(
              msgs,
              fee,
              String(messageChain.chainId),
              '',
              accountDetails.accountNumber,
              accountDetails.sequence,
            )

            const signedAminoDoc = await (wallet as OfflineAminoSigner).signAmino(
              senderAddress,
              signAminoDoc,
            )
            if (isLedgerTypeWallet) {
              setShowLedgerPopup(false)
            }

            if ('signed' in signedAminoDoc && 'signature' in signedAminoDoc) {
              const signedTxBody = {
                messages: signedAminoDoc.signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
                memo: signedAminoDoc.signed.memo,
              }

              if (msgs[0].value.memo) {
                signedTxBody.messages[0].value.memo = msgs[0].value.memo
              }

              const signedTxBodyEncodeObject: TxBodyEncodeObject = {
                typeUrl: '/cosmos.tx.v1beta1.TxBody',
                value: signedTxBody,
              }
              const registry = new Registry(defaultRegistryTypes)
              registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract)
              const signedTxBodyBytes = registry.encode(signedTxBodyEncodeObject)

              const signedGasLimit = Int53.fromString(signedAminoDoc.signed.fee.gas).toNumber()
              const signedSequence = Int53.fromString(signedAminoDoc.signed.sequence).toNumber()

              const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON

              const pubkey = getPublicKey({
                chainId: String(messageChain.chainId),
                // @ts-ignore
                coinType: messageChain.coinType,
                key: walletAccounts[0].pubkey,
              })

              const signedAuthInfoBytes = makeAuthInfoBytes(
                [{ pubkey, sequence: signedSequence }],
                signedAminoDoc.signed.fee.amount,
                signedGasLimit,
                signedAminoDoc.signed.fee.granter,
                signedAminoDoc.signed.fee.payer,
                signMode,
              )
              txRaw = TxRaw.fromPartial({
                bodyBytes: signedTxBodyBytes,
                authInfoBytes: signedAuthInfoBytes,
                signatures: [fromBase64(signedAminoDoc.signature.signature)],
              })
            } else {
              txRaw = signedAminoDoc
            }
          } else {
            const binaryMessage = getDecodedMessageMetadataForSigning(encodedMessage)

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
          }

          const txBytes = TxRaw.encode(txRaw).finish()
          txBytesString = Buffer.from(txBytes).toString('base64')

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
          const { success, response } = await txClient.submitTx(
            String(messageChain.chainId),
            txBytesString,
          )

          if (!success) throw new Error('Submit txn failed')
          txHash = response.tx_hash

          if (messageIndex === 0) {
            logTxToDB(response.tx_hash, message.msg_type_url)
          }
        } catch (_) {
          try {
            const {
              transactionHash,
              code: txCode,
              codespace,
            } = await txClient.broadcastTx(txBytesString)

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

            setUnableToTrackError(
              `We are unable to track transaction ${
                messageIndex > 0 ? messageIndex + 1 : ''
              }. Please check it's status on <a href = "${
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                messageChain.txExplorer.mainnet.txUrl
              }/${txHash}" target = "_blank" rel = "noreferrer"><span>${
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                messageChain.txExplorer.mainnet.name
              }</span><img src = "${Images.Misc.OpenLink}" /></a>`,
            )
            setIsLoading(false)
          }
        }

        message.customTxHash = txHash
        message.customMessageChainId = String(messageChain.chainId)
      }

      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const txnStatus = await SkipAPI.getTxnStatus({
            chain_id: String(messageChain.chainId),
            tx_hash: txHash,
          })

          if (txnStatus.success) {
            const { state, error, transfer_sequence } = txnStatus.response

            if (
              state === SKIP_TXN_STATUS.STATE_PENDING ||
              state === SKIP_TXN_STATUS.STATE_RECEIVED
            ) {
              updateTxStatus(messageIndex, {
                status: TXN_STATUS.SIGNED,
                responses: transfer_sequence,
                isComplete: false,
              })
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

              if (transfer_sequence.length === 0) {
                updateTxStatus(messageIndex, {
                  status: TXN_STATUS.SUCCESS,
                  responses: defaultResponses,
                  isComplete: true,
                })
              } else {
                const responses =
                  route?.response?.chain_ids?.length === 1 ? defaultResponses : transfer_sequence

                updateTxStatus(messageIndex, {
                  status: TXN_STATUS.SUCCESS,
                  responses: responses,
                  isComplete: true,
                })
              }

              break
            } else if (state === SKIP_TXN_STATUS.STATE_ABANDONED) {
              throw new Error('Transaction abandoned')
            }

            if (error?.code) {
              throw new Error(error.message)
            }
          }

          await sleep(2000)
        }
      } catch (err) {
        const error = err as Error
        handleTxError(messageIndex, error.message, messageChain)
        return
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeWallet?.walletType,
    chainsToShow,
    fee,
    getWallet,
    handleMessageTimeout,
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
