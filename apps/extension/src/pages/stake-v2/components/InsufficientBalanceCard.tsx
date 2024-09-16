import {
  SelectedNetwork,
  useActiveStakingDenom,
  useChainInfo,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import Text from 'components/text'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router'
import { isCompassWallet } from 'utils/isCompassWallet'

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
      if (isCompassWallet()) {
        navigate(`/buy?pageSource=stake`)
      } else {
        navigate(
          `/swap?sourceChainId=${osmosisChainInfo.chainId}&sourceToken=${osmosisChainInfo.denom}&destinationChainId=${chain.chainId}&destinationToken=${activeStakingDenom.coinDenom}&pageSource=stake`,
        )
      }
    }

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
          onClick={handleButtonClick}
          className='flex items-center cursor-pointer py-2.5 px-4 justify-between bg-black-100 dark:bg-white-100 rounded-full text-xs text-white-100 dark:text-black-100 font-bold'
        >
          Get {activeStakingDenom?.coinDenom ?? ''}
        </button>
      </div>
    )
  },
)

export default InsufficientBalanceCard
