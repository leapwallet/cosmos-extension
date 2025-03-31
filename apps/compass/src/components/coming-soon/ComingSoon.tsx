import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import { useChainPageInfo } from 'hooks'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import React, { useState } from 'react'
import { manageChainsStore } from 'stores/manage-chains-store'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'

type ComingSoonProps = {
  title: string
}

export const ComingSoon = observer(({ title }: ComingSoonProps) => {
  const [showChainSelector, setShowChainSelector] = useState(false)
  const { headerChainImgSrc } = useChainPageInfo()
  const dontShowSelectChain = useDontShowSelectChain(manageChainsStore)

  return (
    <div className='relative w-full overflow-clip panel-height'>
      <Header
        action={{
          onClick: function noRefCheck() {
            globalSheetsStore.setSideNavOpen(true)
          },
          type: HeaderActionType.NAVIGATION,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          className:
            'min-w-[48px] h-[36px] px-2 bg-[#FFFFFF] dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full',
        }}
        imgSrc={headerChainImgSrc}
        onImgClick={dontShowSelectChain ? undefined : () => setShowChainSelector(true)}
        title={title}
      />

      <div className='h-[475px] px-4 flex flex-col items-center justify-center text-center gap-[4px]'>
        <div className='relative'>
          <span
            className='absolute w-[200px] h-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-[0.3rem]'
            style={{ boxShadow: '2px -2px 4.5rem 1.5rem #28ba5b', borderRadius: '100% 100% 0 0' }}
          ></span>

          <img
            className='z-[1] relative'
            src='https://assets.leapwallet.io/frog-coming-soon.png'
            alt='frog-coming-soon'
          />
        </div>

        <h3 className='dark:text-white-100 font-bold text-[24px]'>Coming soon</h3>
        <p className='text-gray-400 text-[16px] font-medium'>
          We&apos;re working on it. Or perhaps the chain is...
          <br />
          Either way, this page is coming soon!
        </p>
      </div>

      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
    </div>
  )
})
