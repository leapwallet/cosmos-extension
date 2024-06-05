import {
  NftChain,
  TokensListByCollection,
  useIsSeiEvmChain,
  useLoadEvmNftData,
  useLoadNftData,
  useLoadNftDetails,
} from '@leapwallet/cosmos-wallet-hooks'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import React from 'react'

import { useNftContext } from '../context'

export type LoadNftDataProps = {
  nftChain: NftChain
  index: string
}

type LoadNftDetailsProps = LoadNftDataProps & {
  tokensListByCollection: TokensListByCollection
}

function LoadNftDetails({ tokensListByCollection, nftChain, index }: LoadNftDetailsProps) {
  const { setIsLoading, setCollectionData, nftChains } = useNftContext()
  useLoadNftDetails({
    nftChain,
    index,
    nftChains,
    setIsLoading,
    tokensListByCollection,
    setCollectionData,
  })

  return <></>
}

function LoadEvnNftData({ nftChain, index }: LoadNftDataProps) {
  const { setIsLoading, setCollectionData, nftChains } = useNftContext()
  const walletAddresses = useGetWalletAddresses(nftChain.forceChain)

  useLoadEvmNftData({
    nftChain,
    index,
    nftChains,
    setIsLoading,
    setCollectionData,
    walletAddress: walletAddresses[0],
  })

  return <></>
}

export function LoadNftData({ nftChain, index }: LoadNftDataProps) {
  const { setIsLoading, nftChains } = useNftContext()
  const { data } = useLoadNftData({ nftChain, index, setIsLoading, nftChains })
  const isSeiEvmChain = useIsSeiEvmChain(nftChain.forceChain)

  return (
    <>
      {isSeiEvmChain ? <LoadEvnNftData nftChain={nftChain} index={`evm-${index}`} /> : null}
      {data &&
        data.length > 0 &&
        data.map((nft) => {
          if (nft.tokens.length === 0) return null

          return (
            <LoadNftDetails
              key={nft.collection.address}
              tokensListByCollection={nft}
              nftChain={nftChain}
              index={index}
            />
          )
        })}
    </>
  )
}
