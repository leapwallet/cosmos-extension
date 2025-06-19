import {
  SelectedNetwork,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Button } from 'components/ui/button'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { rootDenomsStore } from 'stores/denoms-store-instance'

import { StakeInputPageState } from '../StakeInputPage'

const NotStakedCard = observer(
  ({
    forceChain,
    forceNetwork,
    onClick,
    title,
    subtitle,
    buttonText,
  }: {
    forceChain?: SupportedChain
    forceNetwork?: SelectedNetwork
    title: string
    subtitle: string
    onClick?: () => void
    buttonText: string
  }) => {
    const _activeChain = useActiveChain()
    const _activeNetwork = useSelectedNetwork()
    const activeChain = forceChain ?? _activeChain
    const activeNetwork = forceNetwork ?? _activeNetwork
    const navigate = useNavigate()

    const [activeStakingDenom] = useActiveStakingDenom(
      rootDenomsStore.allDenoms,
      activeChain,
      activeNetwork,
    )

    return (
      <div className='flex flex-col gap-7 py-[90px] px-4 border border-secondary-100 rounded-2xl'>
        <div className='flex flex-col w-full items-center'>
          <img className='w-[88px] mb-1' src={Images.Logos.LeapLogo} />
          <span className='text-foreground text-[18px] mb-2 font-bold'>{title}</span>
          <span className='text-secondary-800 text-xs text-center'>{subtitle}</span>
        </div>

        <Button
          className='w-full'
          onClick={() => {
            if (onClick) {
              onClick()
            } else {
              const state: StakeInputPageState = {
                mode: 'DELEGATE',
                forceChain: activeChain,
                forceNetwork: activeNetwork,
              }
              sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state))
              navigate('/stake/input', {
                state,
              })
            }
          }}
        >
          {buttonText}
        </Button>
      </div>
    )
  },
)

export default NotStakedCard
