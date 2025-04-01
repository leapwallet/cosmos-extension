import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { MosaicAPI, TRANSFER_STATE, TXN_STATUS } from '@leapwallet/elements-core'
import { RouteAggregator } from '@leapwallet/elements-hooks'
import { TransferAssetRelease } from '@skip-go/client'
import { useCallback, useEffect, useRef } from 'react'
import { SourceChain, SwapTxnStatus, TransferSequence } from 'types/swap'

import { RoutingInfo } from '../../useSwapsTx'

export function usePollMosaicTx(
  setTrackingInSync: (value: boolean) => void,
  setUnableToTrackError: (value: boolean) => void,
  updateTxStatus: (index: number, txnStatus: SwapTxnStatus) => void,
  handleTxError: (
    index: number,
    error: string,
    chain: SourceChain,
    transferSequence?: TransferSequence[],
    transferAssetRelease?: TransferAssetRelease,
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
      messageIndex,
      messageChain,
      routingInfo,
    }: {
      txHash: string
      messageIndex: number
      messageChain: SourceChain
      routingInfo: Extract<RoutingInfo, { aggregator: RouteAggregator.MOSAIC }>
    }) => {
      let retryCount = 0

      try {
        while (isMounted.current) {
          if (!isMounted.current) {
            break
          }
          const res = await MosaicAPI.trackTransaction(txHash)

          const overallStatus = res.success ? TXN_STATUS.SUCCESS : TXN_STATUS.FAILED
          if (overallStatus === TXN_STATUS.SUCCESS || retryCount > 20) {
            const transferSequence: TransferSequence[] | undefined =
              routingInfo.route?.paths[0].map((item) => ({
                srcChainID: item.srcAssetChainId,
                destChainID: item.dstAssetChainId,
                state:
                  overallStatus === TXN_STATUS.SUCCESS
                    ? TRANSFER_STATE.TRANSFER_SUCCESS
                    : TRANSFER_STATE.TRANSFER_FAILURE,
                originalState: overallStatus,
                packetTxs: {
                  sendTx: null,
                  receiveTx: null,
                },
              }))
            if (transferSequence && overallStatus === TXN_STATUS.SUCCESS) {
              transferSequence.forEach((item) => {
                item.packetTxs.sendTx = {
                  chainID: item.srcChainID,
                  explorerLink: res.explorerUrl ?? '',
                  txHash,
                }
                item.packetTxs.receiveTx = {
                  chainID: item.destChainID,
                  explorerLink: res.explorerUrl ?? '',
                  txHash,
                }
              })
            }
            const txnStatus: SwapTxnStatus = {
              status: overallStatus,
              responses: transferSequence ?? [],
              isComplete: true,
            }
            updateTxStatus(messageIndex, txnStatus)
            setTrackingInSync(true)
            break
          }
          if (overallStatus === TXN_STATUS.FAILED) {
            retryCount += 1
            await sleep(3000)
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
        handleTxError(messageIndex, error.message, messageChain)
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
