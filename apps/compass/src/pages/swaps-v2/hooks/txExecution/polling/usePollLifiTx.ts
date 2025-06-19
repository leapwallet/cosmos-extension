import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { LifiAPI, TXN_STATUS } from '@leapwallet/elements-core'
import { TransferAssetRelease } from '@skip-go/client'
import { convertLifiStatusToTxnStatus, getLifiTransferSequence } from 'pages/swaps-v2/utils'
import { useCallback, useEffect, useRef } from 'react'
import { SourceChain, SwapTxnStatus, TransferSequence } from 'types/swap'

export function usePollLifiTx(
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
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return useCallback(
    async ({
      txHash,
      messageIndex,
      messageChain,
    }: {
      txHash: string
      messageIndex: number
      messageChain: SourceChain
    }) => {
      let transferAssetRelease
      let transferSequence: TransferSequence[] | undefined
      let retryCount = 0

      try {
        while (isMounted.current) {
          if (!isMounted.current) {
            break
          }
          const res = await LifiAPI.trackTransaction({
            tx_hash: txHash,
          })

          if (res.success === false) {
            throw new Error(res.error)
          }

          const _res = res.response

          const overallStatus = convertLifiStatusToTxnStatus(_res.status, _res.substatus)
          const txnStatus: SwapTxnStatus = {
            status: overallStatus,
            responses: [getLifiTransferSequence(_res)],
            isComplete: [TXN_STATUS.SUCCESS, TXN_STATUS.FAILED].includes(overallStatus),
          }
          const isInvalid = ['INVALID', 'NOT_FOUND'].includes(_res.status)
          if (overallStatus !== TXN_STATUS.FAILED || retryCount > 20) {
            updateTxStatus(messageIndex, txnStatus)
            setTrackingInSync(true)
            if ([TXN_STATUS.SUCCESS, TXN_STATUS.FAILED].includes(overallStatus)) {
              break
            }
          }
          if (overallStatus === TXN_STATUS.FAILED) {
            if (isInvalid) {
              retryCount += 1
              await sleep(3000)
            } else {
              retryCount += 10
            }
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
