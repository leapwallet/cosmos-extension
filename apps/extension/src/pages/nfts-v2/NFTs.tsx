import { NftPage } from '@leapwallet/cosmos-wallet-hooks'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import React, { useState } from 'react'
import { chainTagsStore } from 'stores/chain-infos-store'
import { nftStore } from 'stores/nft-store'

import {
  ChainNftsDetails,
  CollectionDetails,
  NftContextProvider,
  NftDetails,
  ShowNfts,
} from './index'

export default function NFTs() {
  usePageView(PageName.NFT)

  const [activePage, setActivePage] = useState<NftPage>('ShowNfts')
  const value = { activePage, setActivePage }

  return (
    <NftContextProvider value={value}>
      {activePage === 'ShowNfts' && (
        <ShowNfts nftStore={nftStore} chainTagsStore={chainTagsStore} />
      )}
      {activePage === 'CollectionDetails' && <CollectionDetails nftStore={nftStore} />}
      {activePage === 'NftDetails' && <NftDetails />}
      {activePage === 'ChainNftsDetails' && <ChainNftsDetails nftStore={nftStore} />}
    </NftContextProvider>
  )
}
