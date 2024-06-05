import { useActiveStakingDenom, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router'

const RequireMinStaking = () => {
  const chainInfo = useChainInfo()
  const [activeStakingDenom] = useActiveStakingDenom()
  const navigate = useNavigate()

  const handleButtonClick = useCallback(() => {
    navigate('/stake')
  }, [navigate])

  return (
    <div className='flex mt-4 p-4 w-full flex-row justify-between items-center gap-2 dark:bg-gray-900 bg-white-100 rounded-[20px]'>
      <div className='text-xs font-medium !leading-[19.2px] dark:text-white-100'>
        {chainInfo.chainName} requires you to have <br></br>
        at least <span className='font-bold'>1 {activeStakingDenom?.coinDenom} staked</span> to
        start voting
      </div>
      <button
        onClick={handleButtonClick}
        className='rounded-full shrink-0 bg-gray-950 dark:bg-white-100 font-bold text-xs text-gray-100 py-[6px] px-[12px] dark:text-gray-950 !leading-[20px]'
      >
        Stake {activeStakingDenom?.coinDenom}
      </button>
    </div>
  )
}

export default RequireMinStaking
