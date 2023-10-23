import {
  NftChain,
  OwnedCollectionTokenInfo,
  TokensListByCollection,
  useGetAllNFTsList,
  useGetTenOwnedCollection,
} from '@leapwallet/cosmos-wallet-hooks'
import React, { useEffect } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'
import { normalizeImageSrc } from 'utils/normalizeImageSrc'

import { Collection, useNftContext } from '../context'

export type LoadNftDataProps = {
  nftChain: NftChain
  index: string
}

type LoadNftDetailsProps = LoadNftDataProps & {
  tokensListByCollection: TokensListByCollection
}

function LoadNftDetails({ tokensListByCollection, nftChain, index }: LoadNftDetailsProps) {
  const { setIsLoading, setCollectionData } = useNftContext()
  const { forceChain, forceNetwork, forceContractsListChain } = nftChain
  const { status, data } = useGetTenOwnedCollection(tokensListByCollection, {
    forceChain,
    forceNetwork,
    tokenUriModifier: normalizeImageSrc,
  })

  useEffect(() => {
    if (status === 'loading' && isCompassWallet()) {
      setIsLoading((prevValue) => ({
        ...prevValue,
        [tokensListByCollection.collection.address]: true,
      }))
    }

    if (status === 'success') {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: false }))

      if (isCompassWallet()) {
        setIsLoading((prevValue) => ({
          ...prevValue,
          [tokensListByCollection.collection.address]: false,
        }))
      }
    }

    if (data && data.tokens.length) {
      const newCollection: Collection = {
        chain: forceContractsListChain,
        name: tokensListByCollection.collection.name,
        address: tokensListByCollection.collection.address,
        image: data.collection.image,
        totalNfts: tokensListByCollection.tokens.length,
        tokensListByCollection,
        forceChain,
        forceNetwork,
      }

      setCollectionData((prevValue) => {
        let collections = prevValue?.collections ?? []
        collections = collections.filter(
          (collection) => collection.address !== tokensListByCollection.collection.address,
        )

        const nfts = prevValue?.nfts ?? {}
        let tokens = data.tokens

        if (Object.keys(nfts).length && nfts[forceContractsListChain]) {
          const _tokens = nfts[forceContractsListChain]
          tokens = tokens.filter(
            (token: OwnedCollectionTokenInfo) =>
              !_tokens.find(
                (_token: OwnedCollectionTokenInfo) =>
                  _token.tokenId === token.tokenId && _token.domain === token.domain,
              ),
          )
        }

        // Final filter for checking tokens in collection
        const finalCollections = [...collections, { ...newCollection }]

        // to filter new state of nfts after NFT transfer
        const finalNFTs = (
          [...(nfts[forceContractsListChain] ?? []), ...tokens] as OwnedCollectionTokenInfo[]
        ).filter((nft) => {
          // find the matching collection fot the nft
          const coll = finalCollections.find(
            (c) => c.address === nft.collection.contractAddress ?? nft.collection.address,
          )
          // if not found, i.e its other collection
          if (!coll) return true
          // if found match all tokenIds
          return coll.tokensListByCollection?.tokens.includes(nft.tokenId)
        })

        return {
          ...prevValue,
          collections: finalCollections,
          nfts: {
            ...nfts,
            [forceContractsListChain]: finalNFTs,
          },
        }
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, data, index, forceContractsListChain, tokensListByCollection])

  return <></>
}

export function LoadNftData({ nftChain, index }: LoadNftDataProps) {
  const { setIsLoading } = useNftContext()
  const { forceChain, forceContractsListChain, forceNetwork } = nftChain
  const { isLoading, data } = useGetAllNFTsList({
    forceChain,
    forceContractsListChain,
    forceNetwork,
  }) ?? { isLoading: false }

  useEffect(() => {
    if (isLoading) {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: true }))
    }

    if (data && data.length === 0) {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: false }))
    }

    if (data && data.length && data.every(({ tokens }) => tokens.length === 0)) {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: false }))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isLoading, forceContractsListChain, data])

  return (
    <>
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
