import { NftPage } from '@leapwallet/cosmos-wallet-hooks'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import React, { useState } from 'react'

import {
  ChainNftsDetails,
  CollectionDetails,
  NftContextProvider,
  NftDetails,
  ShowNfts,
} from './index'

export function NFTs() {
  usePageView(PageName.NFT)

  const [activePage, setActivePage] = useState<NftPage>('ShowNfts')
  const value = { activePage, setActivePage }

  return (
    <NftContextProvider value={value}>
      {activePage === 'ShowNfts' && <ShowNfts />}
      {activePage === 'CollectionDetails' && <CollectionDetails />}
      {activePage === 'NftDetails' && <NftDetails />}
      {activePage === 'ChainNftsDetails' && <ChainNftsDetails />}
    </NftContextProvider>
  )
}
