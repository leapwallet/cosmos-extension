import { EmptyCard } from 'components/empty-card'
import { useWalletInfo } from 'hooks'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import SelectWallet from 'pages/home/SelectWallet'
import React, { useState } from 'react'

import ComingSoonCard from './ComingSoonCard'
import NotSupportedCard from './NotSupportedCard'
import StakeHeading from './StakeHeading'

type StakingUnavailableProps = {
  isStakeNotSupported: boolean
  isStakeComingSoon: boolean
}

const StakingUnavailable = observer(
  ({ isStakeNotSupported, isStakeComingSoon }: StakingUnavailableProps) => {
    const { activeWallet } = useWalletInfo()

    const [showChainSelector, setShowChainSelector] = useState(false)
    const [showSelectWallet, setShowSelectWallet] = useState(false)

    if (!activeWallet) {
      return (
        <div className='relative w-full overflow-clip panel-height'>
          <EmptyCard src={Images.Logos.LeapCosmos} heading='No wallet found' />
        </div>
      )
    }

    return (
      <div className='relative w-full overflow-clip panel-height'>
        <div className='flex flex-col gap-y-6 p-6 mb-10 overflow-scroll'>
          <StakeHeading />
          {isStakeNotSupported ? (
            <NotSupportedCard onAction={() => setShowChainSelector(true)} />
          ) : isStakeComingSoon ? (
            <ComingSoonCard onAction={() => setShowChainSelector(true)} />
          ) : null}
        </div>
        <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
        <SelectWallet
          isVisible={showSelectWallet}
          onClose={() => setShowSelectWallet(false)}
          title='Wallets'
        />
      </div>
    )
  },
)

export default StakingUnavailable
