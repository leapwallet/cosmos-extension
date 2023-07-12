import { useActiveChain } from 'hooks/settings/useActiveChain'
import React, { useState } from 'react'

import NFTDetails from './details'
import NFTGallery from './gallery'
import GeneralizedNFTsView from './generalized'

export type NFTObjectProps = {
  name: string
  image: string
  edition: number
  description: string
  external_url: string
  tokenId: string
  creator: string
  owner: string
  tokenUri: string
  collection: {
    creator: string
    description: string
    image: string
    external_link: string
    royalty_info: { payment_address: string; share: string }
    name: string
    symbol: string
    contractAddress: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    marketplaceInfo: any
  }
  price: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reserveFor: any
  expiresAt: string
  expiresAtDateTime: string
}

export type CollectionObjectProps = {
  name: string
  contractAddr: string
  items: NFTObjectProps[]
}

const StargazeNFTView = () => {
  const [NFTDetailsProp, setNFTDetailsProp] = useState<object | undefined>()

  return (
    <>
      {NFTDetailsProp === undefined ? (
        <NFTGallery setNFTDetailsProp={setNFTDetailsProp} />
      ) : (
        <NFTDetails NFTDetailsProp={NFTDetailsProp} setNFTDetailsProp={setNFTDetailsProp} />
      )}
    </>
  )
}

export default function NFTs() {
  const activeChain = useActiveChain()

  if (activeChain === 'stargaze') {
    return <StargazeNFTView />
  }

  if (activeChain === 'mars') {
    return <GeneralizedNFTsView forceChain='stargaze' forceContractsListChain='mars' />
  }

  return <GeneralizedNFTsView />
}
