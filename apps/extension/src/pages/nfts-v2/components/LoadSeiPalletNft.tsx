import {
  useAddress,
  useCollectEndpointNfts,
  useGetSeiPalletNFTs,
} from '@leapwallet/cosmos-wallet-hooks'
import React from 'react'

import { useNftContext } from '../context'
import { LoadNftDataProps } from './LoadNftData'

export function LoadSeiPalletNft({ nftChain, index }: LoadNftDataProps) {
  const { forceContractsListChain, forceNetwork } = nftChain
  const walletAddress = useAddress(forceContractsListChain)
  const { status, data } = useGetSeiPalletNFTs(walletAddress, forceNetwork)
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
