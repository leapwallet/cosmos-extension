import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { useChainPageInfo } from 'hooks'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { useState } from 'react'

export function NoStake() {
  const [showSideNav, setShowSideNav] = useState(false)
  const [showChainSelector, setShowChainSelector] = useState(false)
  const { headerChainImgSrc } = useChainPageInfo()
  const dontShowSelectChain = useDontShowSelectChain()

  return (
    <div className='relative w-[400px] overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                setShowSideNav(true)
              },
              type: HeaderActionType.NAVIGATION,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              className:
                'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full',
            }}
            imgSrc={headerChainImgSrc}
            onImgClick={dontShowSelectChain ? undefined : () => setShowChainSelector(true)}
            title={'Staking'}
          />
        }
      >
        <div className='flex flex-col items-center justify-center'>
          <img src={Images.Stake.NoStakeSVG} className='h-[240px] w-[240px] mt-6 mb-4' />
          <Text size='lg' className='font-bold text-center mb-0.5'>
            Staking not available
          </Text>
          <Text size='md' className='text-center max-w-[300px]' color='text-gray-300'>
            This chain does not support staking due to its underlying design
          </Text>
        </div>
      </PopupLayout>
      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <BottomNav label={BottomNavLabel.Stake} />
    </div>
  )
}
