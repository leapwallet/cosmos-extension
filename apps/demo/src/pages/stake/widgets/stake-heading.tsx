import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar } from '@leapwallet/leap-ui'
import currency from 'currency.js'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import Text from '~/components/text'
import { Images } from '~/images'

function StakeHeading({
  chainName,
  isLoading,
  maxApy,
  minApy,
}: {
  chainName: SupportedChain
  isLoading: boolean
  minApy: number
  maxApy: number
}) {
  return (
    <div className='flex flex-col'>
      <div className='flex gap-x-[12px]'>
        <div className='h-8 w-8'>
          <Avatar
            size='sm'
            avatarImage={ChainInfos[chainName].chainSymbolImageUrl}
            chainIcon={Images.Activity.Delegate}
          />
        </div>
        <Text size='xxl' className='font-black'>
          Stake {ChainInfos[chainName].denom}
        </Text>
      </div>
      {isLoading && <Skeleton count={1} width={200} />}
      {!isLoading && (
        <Text size='md' color='dark:text-gray-200 text-gray-800' className='font-bold'>
          APY: {currency((minApy * 100).toString(), { precision: 2, symbol: '' }).format()} -{' '}
          {currency((maxApy * 100).toString(), { precision: 2, symbol: '' }).format() + '%'}
        </Text>
      )}
    </div>
  )
}
export default StakeHeading
