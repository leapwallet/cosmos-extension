/* eslint-disable @typescript-eslint/no-explicit-any */
import { SKIP_TXN_STATUS } from '@leapwallet/elements-core'
import classNames from 'classnames'
import { PENDING_SWAP_TXS } from 'config/storage-keys'
import { Images } from 'images'
import { useGetChainsToShow } from 'pages/swaps-v2/hooks'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo } from 'react'
import { moveTxsFromCurrentToPending } from 'utils/pendingSwapsTxsStore'
import Browser from 'webextension-polyfill'

function ViewButton({
  handleViewClick,
  swapsState,
}: {
  handleViewClick: () => void
  swapsState: string
}) {
  const { chainsToShowLoading } = useGetChainsToShow()

  const handleOnClick = useCallback(() => {
    if (chainsToShowLoading) {
      return
    }
    handleViewClick()
  }, [chainsToShowLoading, handleViewClick])

  return (
    <button
      onClick={handleOnClick}
      className={classNames(
        'rounded-full py-[6px] px-3 text-white-100 text-sm !leading-[19.6px] font-bold',
        {
          'bg-green-700': swapsState === 'loading' || swapsState === 'success',
          'bg-red-700': swapsState === 'error',
          'opacity-40': chainsToShowLoading,
        },
      )}
      disabled={chainsToShowLoading}
    >
      View{' '}
      <span className='material-icons-round !text-xs text-white-100 !leading-[12px]'>
        arrow_forward_ios
      </span>
    </button>
  )
}

type Props = {
  setShowSwapTxPageFor: Dispatch<SetStateAction<any>>
  setPendingSwapTxs: Dispatch<SetStateAction<any[]>>
  pendingSwapTxs: any[]
  setShowPendingSwapsSheet: Dispatch<SetStateAction<boolean>>
}

const PendingSwapsAlertStrip = ({
  setShowSwapTxPageFor,
  setPendingSwapTxs,
  pendingSwapTxs,
  setShowPendingSwapsSheet,
}: Props) => {
  useEffect(() => {
    async function updatePendingSwapTxs() {
      const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])

      if (storage[PENDING_SWAP_TXS]) {
        const pendingTxs = Object.values(JSON.parse(storage[PENDING_SWAP_TXS]) ?? {})

        setPendingSwapTxs(pendingTxs)
      } else {
        setPendingSwapTxs([])
      }
    }
    moveTxsFromCurrentToPending()
    updatePendingSwapTxs()

    Browser.storage.onChanged.addListener((storage) => {
      if (storage[PENDING_SWAP_TXS]) {
        updatePendingSwapTxs()
      }
    })

    return Browser.storage.onChanged.removeListener((storage) => {
      if (storage[PENDING_SWAP_TXS]) {
        updatePendingSwapTxs()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalSwaps = useMemo(() => {
    return pendingSwapTxs?.length ?? 0
  }, [pendingSwapTxs?.length])

  const noOfFailedSwaps = useMemo(() => {
    return (
      pendingSwapTxs?.filter(
        (tx) =>
          tx.state === SKIP_TXN_STATUS.STATE_COMPLETED_ERROR ||
          tx.state === SKIP_TXN_STATUS.STATE_ABANDONED,
      ).length ?? 0
    )
  }, [pendingSwapTxs])

  const noOfSuccessfulSwaps = useMemo(() => {
    return (
      pendingSwapTxs?.filter((tx) => tx.state === SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS)
        ?.length ?? 0
    )
  }, [pendingSwapTxs])

  const handleViewClick = useCallback(() => {
    if (totalSwaps > 1) {
      setShowPendingSwapsSheet(true)
    } else {
      setShowSwapTxPageFor(pendingSwapTxs[0])
    }
  }, [pendingSwapTxs, setShowPendingSwapsSheet, setShowSwapTxPageFor, totalSwaps])

  const swapsState: 'idle' | 'loading' | 'error' | 'success' = useMemo(() => {
    if (noOfFailedSwaps > 0) {
      return 'error'
    }
    if (noOfSuccessfulSwaps > 0) {
      return 'success'
    }
    if (totalSwaps > 0) {
      return 'loading'
    }
    return 'idle'
  }, [noOfFailedSwaps, noOfSuccessfulSwaps, totalSwaps])

  const title = useMemo(() => {
    if (swapsState === 'success') {
      return `Swap${noOfSuccessfulSwaps > 1 ? 's' : ''} successful`
    }
    if (swapsState === 'error') {
      return `Swap${noOfFailedSwaps > 1 ? 's' : ''} failed`
    }
    if (swapsState === 'loading') {
      return totalSwaps > 1 ? 'Multiple swaps in progress' : 'Swap in progress'
    }
  }, [noOfFailedSwaps, noOfSuccessfulSwaps, swapsState, totalSwaps])

  const alertIcon = useMemo(() => {
    if (swapsState === 'loading') {
      return Images.Loaders.SwapsAlertStripLoader
    }
    if (swapsState === 'error') {
      return Images.Swap.AlertTriangle
    }

    if (swapsState === 'success') {
      return Images.Swap.CheckCircle
    }
  }, [swapsState])

  if (totalSwaps === 0) {
    return null
  }

  return (
    <div
      className={classNames(
        'absolute bottom-[60px] px-4 py-3 w-full flex flex-row justify-between gap-3 items-center rounded-t-2xl shadow-[inset_0px_-4px_11.199999809265137px_0px_#00000040]',
        {
          'bg-green-600': swapsState === 'loading' || swapsState === 'success',
          'bg-red-300': swapsState === 'error',
        },
      )}
    >
      <div className='flex flex-row justify-start items-center gap-2'>
        <img
          src={alertIcon}
          className={classNames('w-5 h-5', { 'animate-spin': swapsState === 'loading' })}
          alt='loading-img'
        />
        <div className='font-bold text-sm text-white-100 !leading-[19.6px]'>{title}</div>
      </div>
      <ViewButton handleViewClick={handleViewClick} swapsState={swapsState} />
    </div>
  )
}

export default PendingSwapsAlertStrip
