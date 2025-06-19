import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import { Buttons } from '@leapwallet/leap-ui'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import Text from '~/components/text'
import { Colors } from '~/theme/colors'
import showOrHideBalances from '~/util/show-or-hide-balances'

function DepositAmountCard({
  totalDelegations,
  currencyAmountDelegation,
  activeChain,
  percentageChange,
  unstakingPeriod,
  validators,
  validatorApys,
}: {
  percentageChange: number
  totalDelegations: string
  currencyAmountDelegation: string
  activeChain: SupportedChain
  isLoading: boolean
  unstakingPeriod: string
  validators: Record<string, Validator>
  validatorApys: Record<string, number>
}) {
  const navigate = useNavigate()

  const handleStakeClick = () => {
    navigate('/choose-staking-validator', {
      state: {
        validators,
        apy: validatorApys,
        unstakingPeriod,
        mode: 'DELEGATE',
      },
    })
  }

  return (
    <div className='dark:bg-gray-900 rounded-2xl bg-white-100 pt-4'>
      <Text size='xs' color='dark:text-gray-200 text-gray-600' className='font-bold mb-3 py-1 px-4'>
        Your Deposited amount
      </Text>
      <div className='flex px-4 pb-4 justify-between items-center'>
        <div>
          <Text size='xl' className='text-[28px] mb-2 font-black'>
            {currencyAmountDelegation === '-' ? '$0.00' : currencyAmountDelegation}
          </Text>
          <Text size='xs' className='font-semibold'>
            {totalDelegations ?? `0.00 ${ChainInfos[activeChain].denom}`}
            {totalDelegations && (
              <>
                <span className='mx-2'>|</span>
                {showOrHideBalances(false, percentageChange)}
              </>
            )}
          </Text>
        </div>
        <div className='flex shrink  h-[48px] w-[121px]'>
          <Buttons.Generic onClick={handleStakeClick} color={Colors.getChainColor(activeChain)}>
            <div className='flex justify-center text-white-100'>
              <span className='mr-1 material-icons-round'>add_circle</span>
              <span>Stake</span>
            </div>
          </Buttons.Generic>
        </div>
      </div>
    </div>
  )
}

export default DepositAmountCard
