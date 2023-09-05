import { useAddress, useGetStargazeNFTs } from '@leapwallet/cosmos-wallet-hooks'
import React from 'react'

import { useCollectEndpointNfts } from '../hooks'
import { LoadNftDataProps } from './LoadNftData'

export function LoadStargazeNft({ nftChain, index }: LoadNftDataProps) {
  const { forceContractsListChain, forceNetwork } = nftChain
  const walletAddress = useAddress(forceContractsListChain)
  const { status, data } = useGetStargazeNFTs(walletAddress, forceNetwork)
  useCollectEndpointNfts(index, status, data, forceContractsListChain)

  return <></>
}
