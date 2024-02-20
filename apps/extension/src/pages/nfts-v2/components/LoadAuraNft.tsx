import { useAddress, useGetAuraNFTs } from '@leapwallet/cosmos-wallet-hooks'
import React from 'react'

import { useCollectEndpointNfts } from '../hooks'
import { LoadNftDataProps } from './LoadNftData'

export function LoadAuraNft({ nftChain, index }: LoadNftDataProps) {
  const { forceContractsListChain, forceNetwork } = nftChain
  const walletAddress = useAddress(forceContractsListChain)
  const { status, data } = useGetAuraNFTs(walletAddress, forceNetwork)
  useCollectEndpointNfts(index, status, data, forceContractsListChain)

  return <></>
}
