import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { Network, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'

import { ChooseValidatorProps } from '../ChooseValidator'

type DepositAmountCardProps = {
  totalDelegations: string
  unstakingPeriod: string
  formatHideBalance: (s: string) => React.ReactNode
  network: Network
  currencyAmountDelegation: string
  activeChain: SupportedChain
  isLoading: boolean
  activeStakingCoinDenom: string
  activeNetwork: SelectedNetwork
}

const DepositAmountCard = React.memo(
  ({
    totalDelegations,
    currencyAmountDelegation,
    activeChain,
    isLoading,
    unstakingPeriod,
    network,
    formatHideBalance,
    activeStakingCoinDenom,
    activeNetwork,
  }: DepositAmountCardProps) => {
    const navigate = useNavigate()
    const activeChainInfo = useChainInfo(activeChain)

    return (
      <div className='dark:bg-gray-950 rounded-2xl bg-white-100 pt-4'>
        {isLoading && (
          <div className='w-[312px] p-4'>
            <Skeleton count={3} />
          </div>
        )}

        {!isLoading && (
          <Text
            size='xs'
            color='dark:text-gray-400 text-gray-600'
            className='font-bold mb-3 py-1 px-4'
          >
            Your deposited amount
          </Text>
        )}

        {!isLoading && (
          <div className='flex px-4 pb-4 justify-between items-center'>
            <div>
              <Text size='xl' className='text-[28px] mb-2 font-black'>
                {formatHideBalance(
                  currencyAmountDelegation === '-' ? '-' : currencyAmountDelegation,
                )}
              </Text>

              <Text size='xs' className='font-semibold'>
                {formatHideBalance(totalDelegations ?? `0.00 ${activeStakingCoinDenom}`)}
              </Text>
            </div>

            <div className='flex shrink h-[48px] w-[121px]'>
              <Buttons.Generic
                disabled={!network}
                onClick={async () => {
                  if (network) {
                    const validators = network?.getValidators({})

                    navigate('/stakeChooseValidator', {
                      state: {
                        validators,
                        apy: network.validatorApys,
                        unstakingPeriod,
                        mode: 'DELEGATE',
                        activeChain,
                        activeNetwork,
                      } as ChooseValidatorProps,
                    })
                  }
                }}
                color={Colors.getChainColor(activeChain, activeChainInfo)}
              >
                <div className='flex justify-center text-white-100'>
                  <span className='mr-1 material-icons-round'>add_circle</span>
                  <span>Stake</span>
                </div>
              </Buttons.Generic>
            </div>
          </div>
        )}
      </div>
    )
  },
)

DepositAmountCard.displayName = 'DepositAmountCard'
export { DepositAmountCard }
