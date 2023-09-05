import { useAddress, useGetOmniflixNFTs } from '@leapwallet/cosmos-wallet-hooks'
import React from 'react'

import { useCollectEndpointNfts } from '../hooks'
import { LoadNftDataProps } from './LoadNftData'

export function LoadOmniflixNft({ nftChain, index }: LoadNftDataProps) {
  const { forceContractsListChain, forceNetwork } = nftChain
  const walletAddress = useAddress(forceContractsListChain)
  const { status, data } = useGetOmniflixNFTs(walletAddress, forceNetwork)
  useCollectEndpointNfts(index, status, data, forceContractsListChain)

  return <></>
}
