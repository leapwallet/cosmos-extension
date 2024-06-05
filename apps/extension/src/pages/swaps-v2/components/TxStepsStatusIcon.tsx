import { DenomData, TRANSFER_STATE } from '@leapwallet/elements-core'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useMemo } from 'react'
import { imgOnError } from 'utils/imgOnError'

type TransferState = TRANSFER_STATE | undefined

export function TxStepsStatusIcon({
  state,
  denomData,
}: {
  state: TransferState
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
    ).includes(state)

    const _isCompleted = (
      [TRANSFER_STATE.TRANSFER_SUCCESS, TRANSFER_STATE.TRANSFER_FAILURE] as TransferState[]
    ).includes(state)

    const _isPending = (
      [TRANSFER_STATE.TRANSFER_PENDING, TRANSFER_STATE.TRANSFER_RECEIVED] as TransferState[]
    ).includes(state)

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
            'rounded-full w-5 h-5 text-white-100 material-icons-round !text-[10px] flex flex-row justify-center items-center !leading-[12px]',
            {
              'bg-green-600': state === TRANSFER_STATE.TRANSFER_SUCCESS,
              'bg-red-300': state === TRANSFER_STATE.TRANSFER_FAILURE,
            },
          )}
        >
          {state === TRANSFER_STATE.TRANSFER_FAILURE ? 'priority_high' : 'done'}
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
