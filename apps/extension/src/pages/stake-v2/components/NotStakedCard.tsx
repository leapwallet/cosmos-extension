import { SelectedNetwork, useActiveStakingDenom } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import Text from 'components/text'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

type NotStakedCardProps = {
  rootDenomsStore: RootDenomsStore
  activeChain?: SupportedChain
  activeNetwork?: SelectedNetwork
}

const NotStakedCard = observer(
  ({ rootDenomsStore, activeChain, activeNetwork }: NotStakedCardProps) => {
    const [activeStakingDenom] = useActiveStakingDenom(
      rootDenomsStore.allDenoms,
      activeChain,
      activeNetwork,
    )

    return (
      <div className='flex flex-col items-center w-full px-4 pt-6 bg-white-100 dark:bg-gray-950 rounded-2xl'>
        <Text size='xs' color='text-gray-600 dark:text-gray-400'>
          You haven&apos;t staked any {activeStakingDenom.coinDenom}
        </Text>

        <Text className='text-[18px] font-bold' color='text-black-100 dark:text-white-100'>
          Stake tokens to earn rewards
        </Text>

        {isCompassWallet() ? (
          <img className='w-full h-[120px] object-cover mt-2' src={Images.Misc.CompassNoStake} />
        ) : (
          <img className='w-[200px] h-[106px] object-cover mt-8' src={Images.Logos.LeapLogo} />
        )}
      </div>
    )
  },
)

export default NotStakedCard
