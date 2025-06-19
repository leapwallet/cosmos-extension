import { EmptyCard } from 'components/empty-card'
import { useWalletInfo } from 'hooks'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router'

import ComingSoonCard from './ComingSoonCard'
import NotStakedCard from './NotStakedCard'
import NotSupportedCard from './NotSupportedCard'
import StakeHeading from './StakeHeading'

type StakingUnavailableProps = {
  isStakeNotSupported: boolean
  isStakeComingSoon: boolean
}

const StakingUnavailable = observer(
  ({ isStakeNotSupported, isStakeComingSoon }: StakingUnavailableProps) => {
    const navigate = useNavigate()
    const { activeWallet } = useWalletInfo()
    const activeChain = useActiveChain()

    if (!activeWallet) {
      return (
        <div className='relative w-full overflow-clip panel-height flex justify-center items-center'>
          <EmptyCard
            src={Images.Logos.LeapCosmos}
            heading='No wallet found'
            logoClassName='size-14'
          />
        </div>
      )
    }

    function getCardComponent() {
      if (isStakeNotSupported) {
        return (
          <NotStakedCard
            title='Staking unavailable'
            subtitle={`Staking is not yet available for ${activeChain}. You can stake on other chains in the meantime.`}
            buttonText='Stake on a different chain'
            onClick={() => navigate('/home')}
          />
        )
      }
      if (isStakeComingSoon) {
        return (
          <NotStakedCard
            title='Coming soon!'
            subtitle={`Staking for ${activeChain} is coming soon! Devs are hard at work. Stay tuned!`}
            buttonText='Stake on a different chain'
            onClick={() => navigate('/home')}
          />
        )
      }
    }

    return (
      <div className='relative w-full overflow-clip panel-height'>
        <div className='flex flex-col gap-y-6 p-6 mb-10 overflow-scroll'>
          <StakeHeading />
          {getCardComponent()}
        </div>
      </div>
    )
  },
)

export default StakingUnavailable
