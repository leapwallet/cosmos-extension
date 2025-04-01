import { WalletButton } from 'components/button/WalletButton'
import { PageHeader } from 'components/header'
import { SideNavMenuOpen } from 'components/header/sidenav-menu'
import { SidePanelTrigger } from 'components/header/sidepanel-trigger'
import { useWalletInfo } from 'hooks/useWalletInfo'
import SelectWallet from 'pages/home/SelectWallet'
import React, { useState } from 'react'
import { sidePanelSupported } from 'utils/isSidePanel'

export const DiscoverHeader = (props: { disableWalletButton?: boolean }) => {
  const walletInfo = useWalletInfo()
  const [showSelectWallet, setShowSelectWallet] = useState(false)

  return (
    <>
      <PageHeader>
        <SideNavMenuOpen />

        <WalletButton
          showDropdown
          showWalletAvatar
          className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
          walletName={walletInfo.walletName}
          walletAvatar={walletInfo.walletAvatar}
          handleDropdownClick={() => setShowSelectWallet(true && !props.disableWalletButton)}
        />

        <SidePanelTrigger className={`pl-1.5 ${sidePanelSupported ? '!rounded-l-none' : ''}`} />
      </PageHeader>

      <SelectWallet isVisible={showSelectWallet} onClose={() => setShowSelectWallet(false)} />
    </>
  )
}
