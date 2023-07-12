import { BigNumber } from 'bignumber.js'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import React, { useMemo } from 'react'

import { useFormatCurrency } from '../../hooks/settings/useCurrency'
import { Colors } from '../../theme/colors'
import TokenCardSkeleton from '../Skeletons/TokenCardSkeleton'
import Text from '../text'

export function _PortfolioDistribution({
  stakeBalance,
  walletBalance,
  loading,
}: {
  stakeBalance: BigNumber | null
  walletBalance: BigNumber | null
  loading: boolean
}) {
  const totalBalance = useMemo(
    () => walletBalance?.plus(stakeBalance as BigNumber),
    [stakeBalance, walletBalance],
  )
  const { formatHideBalance } = useHideAssets()

  const threshold = useMemo(() => 3, [])
  const [formatCurrency] = useFormatCurrency()

  const walletBalancePct = walletBalance?.times(100).div(totalBalance as BigNumber)
  const showLoader = walletBalance === null || loading === true

  if (stakeBalance?.lte(0) && walletBalance?.lte(0) && !showLoader) {
    return null
  }

  return (
    <div className='rounded-2xl dark:bg-gray-900 bg-white-100 mb-2'>
      <div className='flex justify-between'>
        <Text size='sm' color='dark:text-gray-200 text-gray-600 font-medium px-5 pt-4'>
          Portfolio Distribution
        </Text>
      </div>
      {showLoader ? (
        <TokenCardSkeleton />
      ) : (
        <div className='w-[344px] pb-2 px-5'>
          <div className='pt-4'>
            <div
              className='w-full bg-gray-200 h-[8px] mb-3 rounded-2xl overflow-hidden'
              style={{ background: Colors.Indigo300 }}
            >
              {walletBalancePct?.gte(threshold) && (
                <div
                  className='h-[8px] rounded-l-2xl'
                  style={{
                    width: `${(walletBalancePct.plus(threshold).gte(100)
                      ? 100
                      : walletBalancePct
                    ).toString()}%`,
                    background: `${Colors.juno}`,
                  }}
                ></div>
              )}
            </div>
          </div>
          <div className='flex justify-between'>
            <div>
              <div
                className='w-[8px] h-[8px] rounded-full inline-block'
                style={{ background: Colors.juno }}
              ></div>
              <div className='inline-block align-text-top ml-2'>
                <Text size='sm' color='text-gray-400'>
                  Wallet Balance
                </Text>
                <Text size='sm' className='font-bold'>
                  {formatHideBalance(formatCurrency(walletBalance))}
                </Text>
              </div>
            </div>
            {stakeBalance ? (
              <div>
                <div
                  className='w-[8px] h-[8px] rounded-full inline-block'
                  style={{ background: Colors.Indigo300 }}
                ></div>
                <div className='inline-block align-text-top ml-2'>
                  <Text size='sm' color='text-gray-400'>
                    Stake Balance
                  </Text>
                  <Text size='sm' className='font-bold'>
                    {formatHideBalance(formatCurrency(stakeBalance))}
                  </Text>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export const PortfolioDistribution = React.memo(_PortfolioDistribution)
