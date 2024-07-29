import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { HeaderActionType } from '@leapwallet/leap-ui'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { WalletButton } from 'components/button'
import { EmptyCard } from 'components/empty-card'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { walletLabels } from 'config/constants'
import { useChainPageInfo } from 'hooks'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import SelectWallet from 'pages/home/SelectWallet'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useMemo, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { isCompassWallet } from 'utils/isCompassWallet'

import ComingSoonCard from './ComingSoonCard'
import NotSupportedCard from './NotSupportedCard'
import StakeHeading from './StakeHeading'

export default function StakingUnavailable({
  isStakeNotSupported,
  isStakeComingSoon,
}: {
  isStakeNotSupported: boolean
  isStakeComingSoon: boolean
}) {
  const { headerChainImgSrc } = useChainPageInfo()
  const dontShowSelectChain = useDontShowSelectChain()
  const walletAddresses = useGetWalletAddresses()

  const { activeWallet } = useActiveWallet()

  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [showSideNav, setShowSideNav] = useState(false)
  const [isWalletAddressCopied, setIsWalletAddressCopied] = useState(false)

  const handleOpenSelectChainSheet = useCallback(() => setShowChainSelector(true), [])
  const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])
  const handleCopyClick = useCallback(() => {
    setIsWalletAddressCopied(true)
    setTimeout(() => setIsWalletAddressCopied(false), 2000)

    UserClipboard.copyText(walletAddresses?.[0])
  }, [walletAddresses])

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar
    }

    if (isCompassWallet()) {
      return Images.Logos.CompassCircle
    }

    return Images.Logos.LeapLogo28
  }, [activeWallet?.avatar])

  if (!activeWallet) {
    return (
      <div className='relative w-full overflow-clip'>
        <PopupLayout>
          <div>
            <EmptyCard src={Images.Logos.LeapCosmos} heading='No wallet found' />
          </div>
        </PopupLayout>
      </div>
    )
  }

  const walletName =
    activeWallet.walletType === WALLETTYPE.LEDGER &&
    !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(activeWallet.name)
      ? `${walletLabels[activeWallet.walletType]} Wallet ${activeWallet.addressIndex + 1}`
      : formatWalletName(activeWallet.name)

  function getCardComponent() {
    if (isStakeNotSupported) {
      return <NotSupportedCard onAction={() => setShowChainSelector(true)} />
    }
    if (isStakeComingSoon) {
      return <ComingSoonCard onAction={() => setShowChainSelector(true)} />
    }
  }

  return (
    <div className='relative w-full overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <PageHeader
            action={{
              onClick: () => setShowSideNav(true),
              type: HeaderActionType.NAVIGATION,
              className: 'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
            }}
            imgSrc={headerChainImgSrc}
            onImgClick={dontShowSelectChain ? undefined : handleOpenSelectChainSheet}
            title={
              <WalletButton
                walletName={walletName}
                showWalletAvatar={true}
                walletAvatar={walletAvatar}
                showDropdown={true}
                handleDropdownClick={handleOpenWalletSheet}
                giveCopyOption={true}
                handleCopyClick={handleCopyClick}
                isAddressCopied={isWalletAddressCopied}
              />
            }
          />
        }
      >
        <div className='flex flex-col gap-y-6 p-6 mb-10 overflow-scroll'>
          <StakeHeading />
          {getCardComponent()}
        </div>
      </PopupLayout>
      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => setShowSelectWallet(false)}
        title='Wallets'
      />
      <BottomNav label={BottomNavLabel.Stake} />
    </div>
  )
}
