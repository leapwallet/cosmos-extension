import { WalletButtonV2 } from 'components/button'
import { PageHeader } from 'components/header/PageHeaderV2'
import { SideNavMenuOpen } from 'components/header/sidenav-menu'
import { SidePanelTrigger } from 'components/header/sidepanel-trigger'
import { useWalletInfo } from 'hooks/useWalletInfo'
import SelectWallet from 'pages/home/SelectWallet/v2'
import React, { useState } from 'react'

export const ActivityHeader = (props: { disableWalletButton?: boolean }) => {
  const walletInfo = useWalletInfo()
  const [showSelectWallet, setShowSelectWallet] = useState(false)

  return (
    <>
      <PageHeader>
        <div className='flex items-center bg-secondary-200 rounded-full overflow-hidden'>
          <SideNavMenuOpen className='py-2 pr-1.5 pl-2.5 text-foreground/75 hover:text-foreground transition-colors' />
          <div className='h-5 w-px bg-secondary-300' />
          <SidePanelTrigger className='py-2 pl-1.5 pr-2.5 text-foreground/75 hover:text-foreground transition-colors' />
        </div>

        <WalletButtonV2
          showDropdown
          showWalletAvatar
          className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
          walletName={walletInfo.walletName}
          walletAvatar={walletInfo.walletAvatar}
          handleDropdownClick={() => setShowSelectWallet(true && !props.disableWalletButton)}
        />
      </PageHeader>

      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => setShowSelectWallet(false)}
        title='Your Wallets'
      />
    </>
  )
}
