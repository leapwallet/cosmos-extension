import { GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, NativeDenom, sleep } from '@leapwallet/cosmos-wallet-sdk'
import { useCallback, useEffect, useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'
import {
  addTxToCurrentTxList,
  addTxToPendingTxList,
  generateObjectKey,
  removeCurrentSwapTxs,
} from 'utils/pendingSwapsTxsStore'
import Browser from 'webextension-polyfill'

import { RoutingInfo } from './useSwapsTx'

export function useHandleTxProgressPageBlurEvent(
  isLoading: boolean,
  isOnline: boolean,
  initialRoutingInfo: RoutingInfo,
  initialInAmount: string,
  initialAmountOut: string,
  initialFeeAmount: string,
  initialSourceChain: SourceChain | undefined,
  initialSourceToken: SourceToken | null,
  initialDestinationChain: SourceChain | undefined,
  initialDestinationToken: SourceToken | null,
  initialFeeDenom: NativeDenom & {
    ibcDenom?: string | undefined
  },
  initialGasEstimate: number,
  initialGasOption: GasOptions,
  initialUserPreferredGasLimit: number | undefined,
  initialUserPreferredGasPrice: GasPrice | undefined,
  feeAmount: string | undefined,
) {
  const routeHasTxHash =
    initialRoutingInfo?.messages && initialRoutingInfo.messages.every((msg) => !!msg.customTxHash)

  const isTrackingStatusUnresolved = useMemo(() => {
    return !isOnline || isLoading
  }, [isOnline, isLoading])

  const txStoreObject = useMemo(() => {
    return {
      routingInfo: initialRoutingInfo,
      sourceChain: initialSourceChain,
      sourceToken: initialSourceToken,
      destinationChain: initialDestinationChain,
      destinationToken: initialDestinationToken,
      feeDenom: initialFeeDenom,
      gasEstimate: initialGasEstimate,
      gasOption: initialGasOption,
      userPreferredGasLimit: initialUserPreferredGasLimit,
      userPreferredGasPrice: initialUserPreferredGasPrice,
      inAmount: initialInAmount,
      amountOut: initialAmountOut,
      feeAmount: feeAmount ?? initialFeeAmount,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    feeAmount,
    initialAmountOut,
    initialDestinationChain,
    initialDestinationToken,
    initialFeeAmount,
    initialFeeDenom,
    initialGasEstimate,
    initialGasOption,
    initialInAmount,
    initialRoutingInfo,
    initialSourceChain,
    initialSourceToken,
    initialUserPreferredGasLimit,
    initialUserPreferredGasPrice,
    routeHasTxHash,
  ])

  const handleCloseCleanUp = useCallback(async () => {
    if (isTrackingStatusUnresolved && routeHasTxHash) {
      await addTxToPendingTxList(txStoreObject, isOnline)
    }
  }, [isTrackingStatusUnresolved, routeHasTxHash, txStoreObject, isOnline])

  useEffect(() => {
    async function fn() {
      if (isTrackingStatusUnresolved && routeHasTxHash) {
        await addTxToCurrentTxList(txStoreObject, isOnline)
        return
      }
      if (
        initialRoutingInfo?.messages &&
        initialRoutingInfo.messages.every((msg) => !!msg.customTxHash)
      ) {
        const messageKey = generateObjectKey(initialRoutingInfo)
        if (messageKey) {
          await removeCurrentSwapTxs(messageKey)
        }
      }
    }
    fn()
  }, [initialRoutingInfo, isOnline, routeHasTxHash, isTrackingStatusUnresolved, txStoreObject])

  const handleExtensionClose = useCallback(async () => {
    window.removeEventListener('beforeunload', handleExtensionClose)
    if (isTrackingStatusUnresolved && routeHasTxHash) {
      Browser.runtime.sendMessage({
        type: 'pending-swaps',
        payload: txStoreObject,
        override: isOnline,
      })
      await sleep(100)
    }
  }, [isTrackingStatusUnresolved, routeHasTxHash, txStoreObject, isOnline])

  useEffect(() => {
    window.addEventListener('beforeunload', handleExtensionClose)
    return () => {
      window.removeEventListener('beforeunload', handleExtensionClose)
    }
  }, [handleExtensionClose])

  return { handleClose: handleCloseCleanUp, handleExtensionClose }
}
