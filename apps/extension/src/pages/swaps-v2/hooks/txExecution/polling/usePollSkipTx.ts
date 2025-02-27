import { SKIP_TXN_STATUS, SkipAPI, TRANSFER_STATE, TXN_STATUS } from '@leapwallet/elements-core'
import { TransferAssetRelease } from '@skip-go/client'
import { getChainIdsFromRoute } from 'pages/swaps-v2/utils'
import { useCallback, useEffect, useRef } from 'react'
import { SourceChain, SwapTxnStatus, TransferSequence } from 'types/swap'

import { RoutingInfo } from '../../useSwapsTx'
import { getAxelarTransactionSequence } from './transactionSequence/axelar'
import { getCCTPTransactionSequence } from './transactionSequence/cctp'
import { getGoFastTransactionSequence } from './transactionSequence/goFast'
import { getHyperlaneTransactionSequence } from './transactionSequence/hyperlane'
import { getIBCTransactionSequence } from './transactionSequence/ibc'
import { getOPInitTransactionSequence } from './transactionSequence/opInit'

export function usePollSkipTx(
  setTrackingInSync: (value: boolean) => void,
  setUnableToTrackError: (value: boolean) => void,
  updateTxStatus: (index: number, txnStatus: SwapTxnStatus) => void,
  handleTxError: (
    index: number,
    error: string,
    chain: SourceChain,
    transferSequence: TransferSequence[] | undefined,
    transferAssetRelease: TransferAssetRelease | undefined,
  ) => void,
  refetchSourceBalances: (() => void) | undefined,
  refetchDestinationBalances: (() => void) | undefined,
) {
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  return useCallback(
    async ({
      txHash,
      messageChain,
      messageIndex,
      messageChainId,
      routingInfo,
    }: {
      txHash: string
      messageChain: SourceChain
      messageIndex: number
      messageChainId: string
      routingInfo: RoutingInfo
    }) => {
      let transferAssetRelease: TransferAssetRelease | undefined
      let transferSequence: TransferSequence[] | undefined

      try {
        while (isMounted.current) {
          if (!isMounted.current) {
            break
          }
          const txnStatus = await SkipAPI.getTxnStatus({
            chain_id: String(messageChain.chainId),
            tx_hash: txHash,
          })

          if (txnStatus.success) {
            const { state, error, transfer_sequence, transfer_asset_release } = txnStatus.response
            transferSequence =
              transfer_sequence?.map((transfer) => {
                if ('ibc_transfer' in transfer) {
                  return getIBCTransactionSequence(transfer.ibc_transfer)
                }
                if ('cctp_transfer' in transfer) {
                  return getCCTPTransactionSequence(transfer.cctp_transfer)
                }
                if ('hyperlane_transfer' in transfer) {
                  return getHyperlaneTransactionSequence(transfer.hyperlane_transfer)
                }
                if ('op_init_transfer' in transfer) {
                  return getOPInitTransactionSequence(transfer.op_init_transfer)
                }
                if ('axelar_transfer' in transfer) {
                  return getAxelarTransactionSequence(transfer.axelar_transfer)
                }
                if ('go_fast_transfer' in transfer) {
                  return getGoFastTransactionSequence(transfer.go_fast_transfer)
                }
                throw new Error('Unknown transfer type')
              }) ?? []

            transferAssetRelease = transfer_asset_release
              ? {
                  chainID: transfer_asset_release.chain_id,
                  denom: transfer_asset_release.denom,
                  released: transfer_asset_release.released,
                }
              : undefined

            if (
              state === SKIP_TXN_STATUS.STATE_SUBMITTED ||
              state === SKIP_TXN_STATUS.STATE_PENDING ||
              state === SKIP_TXN_STATUS.STATE_RECEIVED
            ) {
              updateTxStatus(messageIndex, {
                status: TXN_STATUS.SIGNED,
                responses:
                  transferSequence && transferSequence?.length > 0
                    ? transferSequence
                    : [
                        {
                          state: TRANSFER_STATE.TRANSFER_PENDING,
                          type: 'ibcTransfer',
                          destChainID: messageChainId,
                          srcChainID: messageChainId,
                          packetTxs: {
                            sendTx: { chainID: messageChainId, txHash: '', explorerLink: '' },
                            receiveTx: null,
                            acknowledgeTx: null,
                            timeoutTx: null,
                          },
                          originalState: TRANSFER_STATE.TRANSFER_PENDING,
                        },
                      ],
                transferAssetRelease,
                isComplete: false,
              })

              setTrackingInSync(true)
            } else if (state === SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS) {
              const defaultResponses: TransferSequence[] = [
                {
                  srcChainID: messageChainId,
                  destChainID: messageChainId,
                  state: TRANSFER_STATE.TRANSFER_SUCCESS,
                  packetTxs: {
                    sendTx: {
                      chainID: messageChainId,
                      txHash: txHash,
                      explorerLink: '',
                    },
                    receiveTx: null,
                    acknowledgeTx: null,
                    timeoutTx: null,
                  },
                  originalState: TRANSFER_STATE.TRANSFER_SUCCESS,
                  type: 'ibcTransfer',
                },
              ]

              if (transferSequence?.length === 0) {
                updateTxStatus(messageIndex, {
                  status: TXN_STATUS.SUCCESS,
                  responses: defaultResponses,
                  transferAssetRelease,
                  isComplete: true,
                })
              } else {
                const responses =
                  getChainIdsFromRoute(routingInfo?.route)?.length === 1
                    ? defaultResponses
                    : transferSequence

                updateTxStatus(messageIndex, {
                  status: TXN_STATUS.SUCCESS,
                  responses: responses as TransferSequence[],
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
              if ((transferSequence ?? []).length > 0) {
                const errorResponse = transferSequence?.find(
                  (transfer) => transfer.state === TRANSFER_STATE.TRANSFER_FAILURE,
                )

                if (
                  errorResponse &&
                  'error' in errorResponse.packetTxs &&
                  errorResponse.packetTxs.error &&
                  'message' in errorResponse.packetTxs.error
                ) {
                  errorMessage = errorResponse?.packetTxs?.error?.message
                }
              }
              throw new Error(errorMessage)
            }
          } else {
            throw new Error(txnStatus.error)
          }
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
    },
    [
      handleTxError,
      refetchDestinationBalances,
      refetchSourceBalances,
      setTrackingInSync,
      setUnableToTrackError,
      updateTxStatus,
    ],
  )
}
