import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import Text from 'components/text'
import useHorizontalScroll from 'hooks/useHorizontalScroll'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import { chainDecimals } from '../utils'

type IShowVotes = {
  dataMock: {
    title: string
    value: number
    color: string
    percent: string
  }[]
  chain: ChainInfo
}

export function ShowVotes({ dataMock, chain }: IShowVotes) {
  const { scrollRef, props } = useHorizontalScroll<HTMLDivElement>()
  const decimals =
    Object.values(chain.nativeDenoms)?.[0]?.coinDecimals ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chainDecimals as any)[chain?.bip44?.coinType]

  return (
    <div className='h-[52px]'>
      <div
        className='flex items-start no-scrollbar overflow-y-auto whitespace-nowrap'
        ref={scrollRef}
        {...props}
      >
        {dataMock.map((item) => {
          const isLoading = item.title === 'loading'

          return (
            <div
              key={item.color}
              className={`px-3 py-2 dark:bg-gray-900 bg-white-100 rounded-[12px] mr-3${
                isLoading ? ' w-[150px]' : ''
              }`}
            >
              {isLoading ? (
                <Skeleton count={2} />
              ) : (
                <>
                  <div className='flex items-center'>
                    <div
                      className='rounded-[2px] w-3 h-3 mr-1'
                      style={{ backgroundColor: item.color }}
                    />
                    <p className='dark:text-white-100 text-gray-400 whitespace-nowrap text-xs font-bold'>{`${item.title} - ${item.percent}`}</p>
                  </div>
                  <Text
                    size='xs'
                    color='text-gray-400 font-medium whitespace-nowrap'
                    style={{ lineHeight: '20px' }}
                  >
                    {`${new Intl.NumberFormat('en-US').format(
                      +Number(item.value / Math.pow(10, decimals)).toFixed(2),
                    )} ${chain.denom}`}
                  </Text>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
