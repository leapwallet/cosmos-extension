import { TransferState } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/skip-core'
import { DenomData, TRANSFER_STATE } from '@leapwallet/elements-core'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import classNames from 'classnames'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useMemo } from 'react'
import { imgOnError } from 'utils/imgOnError'

export function TxStepsStatusIcon({
  state,
  denomData,
}: {
  state: TransferState | undefined
  denomData: DenomData | undefined
}) {
  const { theme } = useTheme()
  const defaultTokenLogo = useDefaultTokenLogo()

  const { isCompleted, isPending, isNotYetStarted } = useMemo(() => {
    const _isNotYetStarted = !(
      [
        TRANSFER_STATE.TRANSFER_SUCCESS,
        TRANSFER_STATE.TRANSFER_FAILURE,
        TRANSFER_STATE.TRANSFER_RECEIVED,
        TRANSFER_STATE.TRANSFER_PENDING,
      ] as TransferState[]
    ).includes(state ?? TRANSFER_STATE.TRANSFER_UNKNOWN)

    const _isCompleted = (
      [TRANSFER_STATE.TRANSFER_SUCCESS, TRANSFER_STATE.TRANSFER_FAILURE] as TransferState[]
    ).includes(state ?? TRANSFER_STATE.TRANSFER_UNKNOWN)

    const _isPending = (
      [TRANSFER_STATE.TRANSFER_PENDING, TRANSFER_STATE.TRANSFER_RECEIVED] as TransferState[]
    ).includes(state ?? TRANSFER_STATE.TRANSFER_UNKNOWN)

    return {
      isNotYetStarted: _isNotYetStarted,
      isCompleted: _isCompleted,
      isPending: _isPending,
    }
  }, [state])

  return (
    <div className='relative rounded-full w-9 h-9 bg-gray-100 dark:bg-gray-850 flex flex-row justify-center items-center gap-2'>
      {isNotYetStarted && <div className='rounded-full w-2 h-2 dark:bg-gray-800 bg-gray-200'></div>}
      {isCompleted && (
        <div
          className={classNames(
            'rounded-full w-5 h-5 text-white-100 flex flex-row justify-center items-center',
            {
              'bg-green-600': state === TRANSFER_STATE.TRANSFER_SUCCESS,
              'bg-red-300': state === TRANSFER_STATE.TRANSFER_FAILURE,
            },
          )}
        >
          {state === TRANSFER_STATE.TRANSFER_FAILURE ? (
            <WarningCircle size={16} className='text-white-100' />
          ) : (
            <CheckCircle weight='fill' size={16} className='text-white-100' />
          )}
        </div>
      )}
      {isPending && (
        <>
          <img
            src={denomData?.icon ?? defaultTokenLogo}
            onError={imgOnError(defaultTokenLogo)}
            alt={denomData?.coinMinimalDenom}
            className='rounded-full w-6 h-6'
          />
          <img
            src={
              theme === ThemeName.DARK
                ? Images.Loaders.SwapsStepsLoaderDark
                : Images.Loaders.SwapsStepsLoader
            }
            className='absolute inset-0 animate-spin'
          />
        </>
      )}
    </div>
  )
}
