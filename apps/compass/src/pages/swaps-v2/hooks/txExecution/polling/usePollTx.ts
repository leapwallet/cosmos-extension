import { RouteAggregator } from '@leapwallet/elements-hooks'
import { TransferAssetRelease } from '@skip-go/client'
import { useCallback } from 'react'
import { SourceChain, SwapTxnStatus, TransferSequence } from 'types/swap'

import { RoutingInfo } from '../../useSwapsTx'
import { usePollLifiTx } from './usePollLifiTx'
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
  const pollLifiTx = usePollLifiTx(
    setTrackingInSync,
    setUnableToTrackError,
    updateTxStatus,
    handleTxError,
    refetchSourceBalances,
    refetchDestinationBalances,
  )

  const pollSkipTx = usePollSkipTx(
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
      if (routingInfo?.aggregator === RouteAggregator.LIFI) {
        await pollLifiTx({ txHash, messageIndex, messageChain })
        return
      }

      await pollSkipTx({ txHash, messageIndex, messageChain, messageChainId, routingInfo })
    },
    [pollLifiTx, pollSkipTx],
  )

  return pollTx
}
