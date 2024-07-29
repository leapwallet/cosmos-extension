import { useActiveStakingDenom, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import Text from 'components/text'
import React from 'react'
import { useNavigate } from 'react-router'

export default function InsufficientBalanceCard() {
  const [activeStakingDenom] = useActiveStakingDenom()
  const chain = useChainInfo()
  const navigate = useNavigate()
  const osmosisChainInfo = useChainInfo('osmosis')

  return (
    <div className='flex w-full items-center justify-between py-3 px-4 rounded-2xl bg-white-100 dark:bg-gray-950'>
      <div className='flex flex-col gap-y-2'>
        <Text size='sm' color='text-black-100 dark:text-white-100' className='font-bold'>
          Insufficient balance to stake
        </Text>
        <Text size='xs' color='text-gray-800 dark:text-gray-200' className='font-medium'>
          Get {activeStakingDenom.coinDenom} to stake and earn rewards
        </Text>
      </div>
      <button
        onClick={() =>
          navigate(
            `/swap?sourceChainId=${osmosisChainInfo.chainId}&sourceToken=${osmosisChainInfo.denom}&destinationChainId=${chain.chainId}&destinationToken=${activeStakingDenom.coinDenom}&pageSource=stake`,
          )
        }
        className='flex items-center cursor-pointer py-2.5 px-4 justify-between bg-black-100 dark:bg-white-100 rounded-full text-xs text-white-100 dark:text-black-100 font-bold'
      >
        Get {activeStakingDenom?.coinDenom ?? ''}
      </button>
    </div>
  )
}
