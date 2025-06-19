import { CaretDown } from '@phosphor-icons/react'
import { WalletButtonV2 } from 'components/button'
import { PageHeader } from 'components/header/PageHeaderV2'
import { SideNavMenuOpen } from 'components/header/sidenav-menu'
import { SidePanelTrigger } from 'components/header/sidepanel-trigger'
import { useDefaultTokenLogo } from 'hooks'
import useQuery from 'hooks/useQuery'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useChainPageInfo } from 'hooks/utility/useChainPageInfo'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { earnFeatureShowStore } from 'stores/earn-feature-show'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { imgOnError } from 'utils/imgOnError'

import SelectChain from '../SelectChain'
import SelectWallet from '../SelectWallet/v2'
import EarnUSDNSheet from './EarnUSDNSheet'

const GeneralHomeHeaderView = (props: { disableWalletButton?: boolean }) => {
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [defaultFilter, setDefaultFilter] = useState<string | undefined>(undefined)
  const [showEarnUSDN, setShowEarnUSDN] = useState(false)
  const walletInfo = useWalletInfo()
  const query = useQuery()
  const navigate = useNavigate()

  const { headerChainImgSrc } = useChainPageInfo()
  const defaultTokenLogo = useDefaultTokenLogo()

  useEffect(() => {
    if (!globalSheetsStore.isChainSelectorOpen) setDefaultFilter('Popular')
  }, [globalSheetsStore.isChainSelectorOpen])

  // Handle deep links
  useEffect(() => {
    if (query.get('openChainSwitch')) {
      const _defaultFilter = query.get('defaultFilter')
      navigate('/home')
      globalSheetsStore.toggleChainSelector()
      if (_defaultFilter) {
        setDefaultFilter(_defaultFilter)
      }

      return
    }

    if (query.get('openLightNode')) {
      navigate('/home')
      globalSheetsStore.toggleSideNav({
        openLightNodePage: true,
      })

      return
    }

    if (query.get('openEarnUSDN')) {
      earnFeatureShowStore.show !== 'false'
        ? setShowEarnUSDN(true)
        : navigate('/earn-usdn', { replace: true })

      return
    }
  }, [navigate, query])

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

        <button
          className='bg-secondary-200 hover:bg-secondary-300 rounded-full px-3 py-2 transition-colors flex items-center gap-1'
          onClick={() => globalSheetsStore.toggleChainSelector()}
        >
          <img
            src={headerChainImgSrc}
            className={'size-5 rounded-full overflow-hidden object-cover'}
            onError={imgOnError(defaultTokenLogo)}
          />
          <CaretDown weight='fill' className='size-3 fill-muted-foreground' />
        </button>
      </PageHeader>

      <SelectWallet isVisible={showSelectWallet} onClose={() => setShowSelectWallet(false)} />

      <SelectChain
        isVisible={globalSheetsStore.isChainSelectorOpen}
        onClose={() => globalSheetsStore.toggleChainSelector()}
        defaultFilter={defaultFilter}
      />

      {showEarnUSDN && (
        <EarnUSDNSheet
          onClose={() => {
            setShowEarnUSDN(false)
            navigate('/home', { replace: true })
          }}
        />
      )}
    </>
  )
}

GeneralHomeHeaderView.displayName = 'GeneralHomeHeader'

export const GeneralHomeHeader = observer(GeneralHomeHeaderView)
