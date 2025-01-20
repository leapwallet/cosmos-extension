import {
  sliceSearchWord,
  sortStringArr,
  useDisabledNFTsCollections,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { NftInfo, NftStore } from '@leapwallet/cosmos-wallet-store'
import { EmptyCard } from 'components/empty-card'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { hiddenNftStore } from 'stores/manage-nft-store'

import { AllNftsHidden, ChainHeaderCollectionCard, Favourites } from './index'

type AllProps = {
  searchedText: string
  selectedSortsBy: SupportedChain[]
  nftStore: NftStore
}

export const All = observer(({ searchedText, selectedSortsBy, nftStore }: AllProps) => {
  const disabledNFTsCollections = useDisabledNFTsCollections()

  const sortedCollectionChains = nftStore.getSortedCollectionChains(
    disabledNFTsCollections,
    hiddenNftStore.hiddenNfts,
  )
  const _collectionData = nftStore.getVisibleCollectionData(hiddenNftStore.hiddenNfts)
  const areAllNftsHidden = nftStore.getAreAllNftsHidden(hiddenNftStore.hiddenNfts)

  const _nfts: { [key: string]: NftInfo[] } = useMemo(() => {
    return Object.keys(_collectionData?.nfts ?? {}).reduce((tempNfts, chain) => {
      const chainNfts = _collectionData?.nfts[chain].filter(
        (nft) => !disabledNFTsCollections.includes(nft.collection.address ?? ''),
      )

      return { ...tempNfts, [chain]: chainNfts }
    }, {})
  }, [_collectionData?.nfts, disabledNFTsCollections])

  const { filteredChains, filteredNfts } = useMemo(() => {
    const filteredNfts: { [key: string]: NftInfo[] } = {}

    if (selectedSortsBy.length) {
      sortedCollectionChains.forEach((chain) => {
        if (selectedSortsBy.includes(chain)) {
          filteredNfts[chain] = _nfts[chain] ?? []
        }
      })
    }

    if (searchedText) {
      ;(selectedSortsBy.length ? selectedSortsBy : sortedCollectionChains).forEach((chain) => {
        const tempNfts = _nfts[chain] ?? []

        const searchedNfts = tempNfts.filter((nft) => {
          return (
            nft.collection.name.trim().toLowerCase().includes(searchedText.toLowerCase()) ||
            nft.name.trim().toLowerCase().includes(searchedText.toLowerCase()) ||
            `#${nft.tokenId ?? nft.domain}`
              .trim()
              .toLowerCase()
              .includes(searchedText.toLowerCase())
          )
        })

        if (searchedNfts.length) {
          filteredNfts[chain] = searchedNfts
        } else {
          delete filteredNfts[chain]
        }
      })
    }

    return { filteredChains: sortStringArr(Object.keys(filteredNfts)), filteredNfts }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_nfts, searchedText, selectedSortsBy.length, sortedCollectionChains])

  if (areAllNftsHidden) {
    return <AllNftsHidden />
  }

  if (searchedText || selectedSortsBy.length) {
    return (
      <>
        {filteredChains.length === 0 ? (
          <EmptyCard
            isRounded
            subHeading='Please try again with something else'
            heading={`No results for “${sliceSearchWord(searchedText)}”`}
            src={Images.Misc.Explore}
          />
        ) : (
          filteredChains.map((chain) => {
            const nfts = filteredNfts[chain] ?? []

            return (
              <ChainHeaderCollectionCard
                key={chain}
                chain={chain as SupportedChain}
                nfts={nfts}
                nftsCount={nfts.length}
              />
            )
          })
        )}
      </>
    )
  }

  return (
    <>
      <Favourites nftStore={nftStore} />
      {sortedCollectionChains.map((chain) => {
        const nfts = _nfts[chain] ?? []
        return (
          <ChainHeaderCollectionCard
            key={chain}
            chain={chain}
            nfts={nfts}
            nftsCount={nfts.length}
          />
        )
      })}
    </>
  )
})
