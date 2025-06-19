import { BookmarkSimple } from '@phosphor-icons/react'
import { WalletButtonV2 } from 'components/button'
import { PageHeader } from 'components/header/PageHeaderV2'
import { SideNavMenuOpen } from 'components/header/sidenav-menu'
import { SidePanelTrigger } from 'components/header/sidepanel-trigger'
import { EventName, PageName } from 'config/analytics'
import { useQueryParams } from 'hooks/useQuery'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { observer } from 'mobx-react-lite'
import SelectWallet from 'pages/home/SelectWallet/v2'
import React, { useState } from 'react'
import { queryParams } from 'utils/query-params'
import { mixpanelTrack } from 'utils/tracking'

import { ALPHA_BOOKMARK_CLONE_ID, ALPHA_BOOKMARK_ID } from './utils/constants'

const BookmarkCta = () => {
  const params = useQueryParams()
  const showBookmarks = params.get(queryParams.alphaBookmarks) === 'true'

  return (
    <button
      className='py-2 px-2.5 text-foreground/75 hover:text-foreground transition-colors flex items-center bg-secondary-200 rounded-full overflow-hidden'
      onClick={() => {
        params.set(queryParams.alphaBookmarks, (!showBookmarks).toString())
        mixpanelTrack(EventName.PageView, {
          pageName: PageName.Bookmark,
        })
      }}
    >
      <BookmarkSimple id={ALPHA_BOOKMARK_ID} size={20} />
      <BookmarkSimple id={ALPHA_BOOKMARK_CLONE_ID} className='hidden' weight='fill' size={20} />
    </button>
  )
}
const AlphaHeaderView = (props: { disableWalletButton?: boolean }) => {
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const walletInfo = useWalletInfo()

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

        <BookmarkCta />
      </PageHeader>

      <SelectWallet isVisible={showSelectWallet} onClose={() => setShowSelectWallet(false)} />
    </>
  )
}

AlphaHeaderView.displayName = 'AlphaHeaderView'

export const AlphaHeader = observer(AlphaHeaderView)
