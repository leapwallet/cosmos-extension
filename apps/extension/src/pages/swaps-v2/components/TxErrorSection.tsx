import { useChains } from '@leapwallet/elements-hooks'
import { WarningCircle } from '@phosphor-icons/react'
import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import React, { useMemo } from 'react'

import { RoutingInfo, useOnline } from '../hooks'
import { getChainIdsFromRoute } from '../utils'

export function TxErrorSection({
  ledgerError,
  firstTxnError,
  timeoutError,
  unableToTrackError,
  routingInfo,
}: {
  firstTxnError?: string
  ledgerError?: string
  timeoutError?: boolean
  unableToTrackError?: boolean | null
  routingInfo: RoutingInfo
}) {
  const isOnline = useOnline()
  const chains = useChains()

  const intermediateChainsInvolved = useMemo(
    () =>
      getChainIdsFromRoute(routingInfo?.route)
        ?.slice(1, -1)
        ?.reduce((acc: string[], chainID: string) => {
          const chainName =
            chains.data?.find((chain) => chain.chainId === chainID)?.chainName ?? chainID
          if (chainName) {
            return [...acc, chainName]
          }
          return acc
        }, [] as string[]),
    [chains.data, routingInfo?.route],
  )

  const errorMessage = useMemo(() => {
    if (!isOnline) {
      return 'Please check your internet connection'
    }

    if (ledgerError) {
      return ledgerError
    }

    if (unableToTrackError) {
      return "We couldn't track the status of your transaction due to a technical error."
    }

    if (firstTxnError) {
      return firstTxnError
    }

    if (timeoutError) {
      return 'Request timed out'
    }

    return undefined
  }, [isOnline, ledgerError, unableToTrackError, firstTxnError, timeoutError])

  useCaptureUIException(errorMessage)

  return (
    <div className='w-full p-4 flex flex-col dark:bg-gray-950 bg-white-100 justify-start items-start gap-3 rounded-xl overflow-x-auto hide-scrollbar'>
      <div className='flex flex-row justify-start items-start gap-3 dark:text-white-100 text-black-100 overflow-x-auto hide-scrollbar'>
        <WarningCircle
          size={12}
          className='mt-1 text-red-300 rounded-full w-[12px] h-[12px] flex items-center justify-center leading-4 bg-white-100 shrink-0'
        />
        <div className='text-sm !leading-[22.4px] font-medium'>{errorMessage}</div>
      </div>
      {unableToTrackError && !!routingInfo?.route && intermediateChainsInvolved && (
        <>
          <div className='dark:bg-gray-900 bg-gray-50 rounded-xl p-3'>
            <div className='text-sm dark:text-white-100 text-black-100 !leading-[22.4px] font-medium'>
              <p>You can check your funds in the following places</p>
              <ol className='list-decimal list-inside text-sm dark:text-gray-200 text-gray-800 !leading-[22.4px] font-medium mt-2 [&>li::marker]:opacity-80 [&>li::marker]:text-sm [&>li::marker]:normal-nums space-y-1'>
                <li>
                  {routingInfo.route.sourceAsset.symbol} on{' '}
                  {routingInfo.route.sourceAssetChain.chainName}.
                </li>
                <li>
                  {routingInfo.route.destinationAsset.symbol} on{' '}
                  {routingInfo.route.destinationAssetChain.chainName}.
                </li>
                {intermediateChainsInvolved.length > 0 ? (
                  <li>
                    Your funds may be on these intermediate chains -{' '}
                    {intermediateChainsInvolved.join(', ')}.
                  </li>
                ) : null}
              </ol>
            </div>
          </div>
          <div className='dark:bg-gray-900 bg-gray-50 rounded-xl p-3'>
            <p className='text-sm dark:text-white-100 text-black-100 !leading-[22.4px] font-medium'>
              In case you aren&apos;t able to track your funds, kindly get in touch with us at{' '}
              <a
                href='https://leapwallet.io/support'
                target='_blank'
                rel='noreferrer'
                className='underline'
              >
                leapwallet.io
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  )
}
