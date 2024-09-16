import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainTagsStore,
  ClaimRewardsStore,
  DelegationsStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { HeaderActionType } from '@leapwallet/leap-ui'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { WalletButton } from 'components/button'
import { EmptyCard } from 'components/empty-card'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { walletLabels } from 'config/constants'
import { useChainPageInfo, useWalletInfo } from 'hooks'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
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

type StakingUnavailableProps = {
  isStakeNotSupported: boolean
  isStakeComingSoon: boolean
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  chainTagsStore: ChainTagsStore
}

const StakingUnavailable = observer(
  ({
    isStakeNotSupported,
    isStakeComingSoon,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    chainTagsStore,
  }: StakingUnavailableProps) => {
    const { headerChainImgSrc } = useChainPageInfo()
    const dontShowSelectChain = useDontShowSelectChain()
    const walletAddresses = useGetWalletAddresses()
    const { walletAvatar, walletName, activeWallet } = useWalletInfo()

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

    if (!activeWallet) {
      return (
        <div className='relative w-full overflow-clip panel-height'>
          <PopupLayout>
            <div>
              <EmptyCard src={Images.Logos.LeapCosmos} heading='No wallet found' />
            </div>
          </PopupLayout>
        </div>
      )
    }

    function getCardComponent() {
      if (isStakeNotSupported) {
        return <NotSupportedCard onAction={() => setShowChainSelector(true)} />
      }
      if (isStakeComingSoon) {
        return <ComingSoonCard onAction={() => setShowChainSelector(true)} />
      }
    }

    return (
      <div className='relative w-full overflow-clip panel-height'>
        <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
        <PopupLayout
          header={
            <PageHeader
              action={{
                onClick: () => setShowSideNav(true),
                type: HeaderActionType.NAVIGATION,
                className: 'min-w-[48px] h-[36px] px-2 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
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
            <StakeHeading
              rootDenomsStore={rootDenomsStore}
              delegationsStore={delegationsStore}
              validatorsStore={validatorsStore}
              unDelegationsStore={unDelegationsStore}
              claimRewardsStore={claimRewardsStore}
            />
            {getCardComponent()}
          </div>
        </PopupLayout>
        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
        />
        <SelectWallet
          isVisible={showSelectWallet}
          onClose={() => setShowSelectWallet(false)}
          title='Wallets'
        />
        <BottomNav label={BottomNavLabel.Stake} />
      </div>
    )
  },
)

export default StakingUnavailable
