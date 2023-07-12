import { BigNumber } from 'bignumber.js'
import React, { memo, useMemo } from 'react'

import Text from '~/components/text'
import { useFormatCurrency } from '~/hooks/settings/use-currency'
import { Colors } from '~/theme/colors'

function _PortfolioDistribution({
  walletBalance,
  stakeBalance,
  rewardsBalance,
}: {
  walletBalance: BigNumber | null
  stakeBalance: BigNumber | null
  rewardsBalance: BigNumber | null
}) {
  const totalBalance = useMemo(
    () => walletBalance?.plus(stakeBalance)?.plus(rewardsBalance),
    [stakeBalance, walletBalance, rewardsBalance],
  )
  const formatCurrency = useFormatCurrency()

  if (stakeBalance.lte(0) && walletBalance.lte(0)) {
    return null
  }

  const walletBalanceBarWidth = walletBalance.times(100).div(totalBalance).toString()
  const stakeBalanceBarWidth = stakeBalance.times(100).div(totalBalance).toString()
  const rewardsBalanceBarWidth = rewardsBalance.times(100).div(totalBalance).toString()

  return (
    <div className='rounded-2xl dark:bg-gray-900 bg-white-100 portfolio-distribution'>
      <div className='flex justify-between'>
        <Text size='sm' color='dark:text-gray-200 text-gray-600 font-medium px-5 pt-4'>
          Portfolio Distribution
        </Text>
      </div>
      <div className='w-full pb-2 px-5'>
        <div className='pt-4'>
          <div
            className='w-full bg-gray-200 h-[8px] mb-3 rounded-2xl overflow-hidden flex'
            style={{ background: Colors.gray800 }}
          >
            <div
              className='h-[8px]'
              style={{
                width: `${walletBalanceBarWidth}%`,
                background: `${Colors.juno}`,
              }}
            ></div>
            <div
              className='h-[8px]'
              style={{
                width: `${stakeBalanceBarWidth}%`,
                background: `${Colors.Indigo300}`,
              }}
            ></div>
            <div
              className='h-[8px]'
              style={{
                width: `${rewardsBalanceBarWidth}%`,
                background: `${Colors.yellow500}`,
              }}
            ></div>
          </div>
        </div>
        <div className='flex justify-between space-x-1'>
          <div>
            <div
              className='w-[8px] h-[8px] rounded-full inline-block mr-2'
              style={{ background: Colors.juno }}
            ></div>
            <div className='inline-block align-text-top'>
              <Text size='sm' color='text-gray-400'>
                Wallet Balance
              </Text>
              <Text size='sm' className='font-bold'>
                {formatCurrency(new BigNumber(walletBalance))}
              </Text>
            </div>
          </div>
          <div>
            <div
              className='w-[8px] h-[8px] rounded-full inline-block mr-2'
              style={{ background: Colors.Indigo300 }}
            ></div>
            <div className='inline-block align-text-top'>
              <Text size='sm' color='text-gray-400'>
                Stake Balance
              </Text>
              <Text size='sm' className='font-bold'>
                {formatCurrency(new BigNumber(stakeBalance))}
              </Text>
            </div>
          </div>
          {!rewardsBalance || rewardsBalance.isEqualTo(0) ? null : (
            <div>
              <div
                className='w-[8px] h-[8px] rounded-full inline-block mr-2'
                style={{ background: Colors.yellow500 }}
              ></div>
              <div className='inline-block align-text-top'>
                <Text size='sm' color='text-gray-400'>
                  Rewards Balance
                </Text>
                <Text size='sm' className='font-bold'>
                  {formatCurrency(new BigNumber(rewardsBalance))}
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const PortfolioDistribution = memo(_PortfolioDistribution)

export default PortfolioDistribution
