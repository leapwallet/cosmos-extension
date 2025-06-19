import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import PopupLayout from 'components/layout/popup-layout'
import { useChainPageInfo } from 'hooks'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { ActivityHeader } from 'pages/activity/components/activity-header'
import SelectChain from 'pages/home/SelectChain'
import React, { useState } from 'react'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { manageChainsStore } from 'stores/manage-chains-store'

type ComingSoonProps = {
  title: string
  chainTagsStore: ChainTagsStore
  bottomNavLabel: BottomNavLabel
}

export const ComingSoon = observer(({ chainTagsStore, title, bottomNavLabel }: ComingSoonProps) => {
  const [showChainSelector, setShowChainSelector] = useState(false)
  const { headerChainImgSrc } = useChainPageInfo()
  const dontShowSelectChain = useDontShowSelectChain(manageChainsStore)

  return (
    <>
      <ActivityHeader />
      <div className='h-[calc(100%-128px)] p-6'>
        <div className='rounded-2xl bg-secondary-100 px-2 h-full flex flex-col items-center justify-center text-center'>
          <img className='w-[180px]' src={Images.Logos.LeapLogo} alt='frog-coming-soon' />

          <h3 className='text-foreground font-bold text-[24px] mb-3'>Coming Soon!</h3>
          <p className='text-secondary-800 text-sm'>
            We&apos;re working on it. Or perhaps the chain is...
            <br />
            Either way, this page is coming soon!
          </p>
        </div>
      </div>
      <SelectChain
        isVisible={showChainSelector}
        onClose={() => setShowChainSelector(false)}
        chainTagsStore={chainTagsStore}
      />
    </>
  )
})
