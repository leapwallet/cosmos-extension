import {
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { Button } from 'components/ui/button'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Link } from 'react-router-dom'
import { rootDenomsStore } from 'stores/denoms-store-instance'

const NotStakedCard = observer(() => {
  const activeChain = useActiveChain()
  const activeNetwork = useSelectedNetwork()

  const [activeStakingDenom] = useActiveStakingDenom(
    rootDenomsStore.allDenoms,
    activeChain,
    activeNetwork,
  )

  return (
    <div className='flex flex-col gap-4 group'>
      <div className='flex flex-col items-center w-full h-40 px-4 pt-6 bg-secondary rounded-2xl overflow-hidden'>
        <span className='text-xs text-muted-foreground'>
          You haven&apos;t staked any {activeStakingDenom.coinDenom}
        </span>

        <span className='text-md font-bold'>Stake tokens to earn rewards</span>

        <img
          className='w-full h-auto flex-1 object-cover mt-2 group-hover:-translate-y-4 group-hover:scale-110 transition-transform duration-500 ease-in-out'
          src={Images.Misc.CompassNoStake}
        />
      </div>

      <Button asChild size='md' className='w-full'>
        <Link
          to='/stake/input'
          state={{ mode: 'DELEGATE', forceChain: activeChain, forceNetwork: activeNetwork }}
        >
          Stake
        </Link>
      </Button>
    </div>
  )
})

export default NotStakedCard
