import {
  useAddress,
  useCollectEndpointNfts,
  useGetStargazeNFTs,
} from '@leapwallet/cosmos-wallet-hooks'
import React from 'react'

import { useNftContext } from '../context'
import { LoadNftDataProps } from './LoadNftData'

export function LoadStargazeNft({ nftChain, index }: LoadNftDataProps) {
  const { forceContractsListChain, forceNetwork } = nftChain
  const walletAddress = useAddress(forceContractsListChain)
  const { status, data } = useGetStargazeNFTs(walletAddress, forceNetwork)
  const { setIsLoading, setCollectionData, nftChains } = useNftContext()

  useCollectEndpointNfts({
    index,
    status,
    data,
    chain: forceContractsListChain,
    setIsLoading,
    setCollectionData,
    nftChains,
  })

  return <></>
}
