import React, { useState } from 'react'

import {
  ChainNftsDetails,
  CollectionDetails,
  NftContextProvider,
  NftDetails,
  NftPage,
  ShowNfts,
} from './index'

export function NFTs() {
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
