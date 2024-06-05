import {
  Collection,
  OwnedCollectionTokenInfo,
  TokensListByCollection,
  useFractionalizedNftContracts,
  useGetOwnedCollection,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { useHiddenNFTs } from 'hooks/settings'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { normalizeImageSrc } from 'utils/normalizeImageSrc'

import { ChainHeaderCollectionCard, CollectionAvatar } from './components'
import { useNftContext } from './context'

type OwnedCollectionDetailsProps = {
  collection: Collection
  nfts: OwnedCollectionTokenInfo[]
}

function OwnedCollectionDetails({ collection, nfts }: OwnedCollectionDetailsProps) {
  const [allData, setAllData] = useState(nfts)
  const hiddenNfts = useHiddenNFTs()
  const fractionalizedNftContracts = useFractionalizedNftContracts()

  const { data, status, fetchMore } = useGetOwnedCollection(
    (collection.tokensListByCollection ?? []) as TokensListByCollection,
    {
      forceChain: collection.forceChain as SupportedChain,
      forceNetwork: collection.forceNetwork as 'mainnet' | 'testnet',
      tokenUriModifier: normalizeImageSrc,
      paginationLimit: 10,
    },
  )

  useEffect(() => {
    if (data) {
      setAllData((prevData) => {
        const newNFTs = data.tokens.filter(
          (token: OwnedCollectionTokenInfo) =>
            !prevData.find((nft) => nft.tokenId === token.tokenId && nft.domain === token.domain),
        )

        const nfts = [...prevData, ...newNFTs].filter(
          (nft) =>
            !hiddenNfts.some((hiddenNft) => {
              const [address, tokenId] = hiddenNft.split('-')

              return (
                [nft.collection.address ?? '', nft.collection.contractAddress ?? ''].includes(
                  address,
                ) && (nft.tokenId ?? nft.domain) === tokenId
              )
            }),
        )

        return nfts
      })
    }
  }, [collection.address, data, hiddenNfts])

  useEffect(() => {
    const bottom = document.querySelector(`[data-loader-id=${collection?.address}]`)
    if (!bottom || status !== 'success') return

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        fetchMore()
      }
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    })
    observer.observe(bottom)

    return () => {
      observer.disconnect()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection?.address, status])

  const isFractionalizedNft = useMemo(() => {
    return fractionalizedNftContracts.includes(collection.address ?? '')
  }, [collection.address, fractionalizedNftContracts])

  const nftsCount = useMemo(() => {
    if (isFractionalizedNft) {
      return allData.length ?? collection.totalNfts
    }

    return collection.totalNfts ?? allData.length
  }, [allData.length, collection.totalNfts, isFractionalizedNft])

  return (
    <ChainHeaderCollectionCard
      chain={collection.chain}
      nfts={allData}
      nftsCount={nftsCount}
      haveToShowLoader={true}
      isFetchingMore={['fetching-more', 'loading'].includes(status)}
    />
  )
}

export function CollectionDetails() {
  const { setActivePage, showCollectionDetailsFor, collectionData } = useNftContext()
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()
  const hiddenNfts = useHiddenNFTs()

  const { collection, nfts } = useMemo(() => {
    const collection =
      collectionData?.collections.find(
        (collection) => collection.address === showCollectionDetailsFor,
      ) ?? ({} as Collection)

    const collectionNfts = collection
      ? collectionData?.nfts[collection?.chain].filter((nft) =>
          [nft.collection.address ?? '', nft.collection.contractAddress ?? ''].includes(
            collection.address,
          ),
        ) ?? []
      : []

    const nfts = collectionNfts.filter(
      (nft) =>
        !hiddenNfts.some((hiddenNft) => {
          const [address, tokenId] = hiddenNft.split('-')

          return (
            [nft.collection.address ?? '', nft.collection.contractAddress ?? ''].includes(
              address,
            ) && (nft.tokenId ?? nft.domain) === tokenId
          )
        }),
    )

    return { collection, nfts }
  }, [collectionData?.collections, collectionData?.nfts, hiddenNfts, showCollectionDetailsFor])

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => setActivePage('ShowNfts'),
              type: HeaderActionType.BACK,
            }}
            title={
              <h1 className='flex'>
                <CollectionAvatar
                  className='h-[30px] w-[30px]'
                  bgColor={chainInfos[collection.chain ?? '']?.theme?.primaryColor ?? ''}
                  image={collection.image}
                />
                <span className='truncate max-w-[150px]' title={collection.name ?? ''}>
                  {collection.name ?? ''}
                </span>
              </h1>
            }
            topColor={Colors.getChainColor(activeChain)}
          />
        }
      >
        <div className='px-6 pt-4 pb-8'>
          {['omniflix', 'stargaze', 'aura'].includes(collection.chain) ||
          collection.address.toLowerCase().startsWith('0x') ? (
            <ChainHeaderCollectionCard
              nfts={nfts}
              chain={collection.chain}
              nftsCount={nfts.length}
            />
          ) : (
            <OwnedCollectionDetails collection={collection} nfts={nfts} />
          )}
        </div>
      </PopupLayout>
    </div>
  )
}
