import {
  SelectedNetwork,
  useActiveStakingDenom,
  useChainInfo,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Button } from 'components/ui/button'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router-dom'

type InsufficientBalanceCardProps = {
  rootDenomsStore: RootDenomsStore
  activeChain?: SupportedChain
  activeNetwork?: SelectedNetwork
}

const InsufficientBalanceCard = observer(
  ({ rootDenomsStore, activeChain, activeNetwork }: InsufficientBalanceCardProps) => {
    const [activeStakingDenom] = useActiveStakingDenom(
      rootDenomsStore.allDenoms,
      activeChain,
      activeNetwork,
    )
    const chain = useChainInfo()
    const navigate = useNavigate()
    const osmosisChainInfo = useChainInfo('osmosis')

    const handleButtonClick = () => {
      navigate(
        `/swap?sourceChainId=${osmosisChainInfo.chainId}&sourceToken=${osmosisChainInfo.denom}&destinationChainId=${chain.chainId}&destinationToken=${activeStakingDenom.coinDenom}&pageSource=stake`,
      )
    }

    return (
      <div className='flex w-full items-center justify-between p-5 rounded-xl bg-secondary-100'>
        <div className='flex flex-col gap-1'>
          <span className='font-medium'>Insufficient balance to stake</span>
          <span className='text-muted-foreground text-xs'>
            Get {activeStakingDenom.coinDenom ?? ''} to stake and earn rewards
          </span>
        </div>
        <Button size={'slim'} variant='mono' asChild onClick={handleButtonClick}>
          <span>Get {activeStakingDenom.coinDenom ?? ''}</span>
        </Button>
      </div>
    )
  },
)

export default InsufficientBalanceCard
