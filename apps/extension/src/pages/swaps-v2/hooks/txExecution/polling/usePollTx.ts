import { RouteAggregator } from '@leapwallet/elements-hooks'
import { TransferAssetRelease } from '@skip-go/client'
import { useCallback } from 'react'
import { SourceChain, SwapTxnStatus, TransferSequence } from 'types/swap'

import { RoutingInfo } from '../../useSwapsTx'
import { usePollMosaicTx } from './usePollMosaicTx'
import { usePollSkipTx } from './usePollSkipTx'

export function usePollTx(
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
  const pollSkipTx = usePollSkipTx(
    setTrackingInSync,
    setUnableToTrackError,
    updateTxStatus,
    handleTxError,
    refetchSourceBalances,
    refetchDestinationBalances,
  )

  const pollMosaicTx = usePollMosaicTx(
    setTrackingInSync,
    setUnableToTrackError,
    updateTxStatus,
    handleTxError,
    refetchSourceBalances,
    refetchDestinationBalances,
  )

  const pollTx = useCallback(
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
      if (routingInfo.aggregator === RouteAggregator.MOSAIC) {
        await pollMosaicTx({ txHash, messageIndex, messageChain, routingInfo })
        return
      }
      await pollSkipTx({ txHash, messageIndex, messageChain, messageChainId, routingInfo })
    },
    [pollMosaicTx, pollSkipTx],
  )

  return pollTx
}
