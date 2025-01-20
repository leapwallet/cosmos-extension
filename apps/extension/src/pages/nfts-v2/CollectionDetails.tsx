import { Collection } from '@leapwallet/cosmos-wallet-hooks'
import { NftStore } from '@leapwallet/cosmos-wallet-store'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { useChainInfos } from 'hooks/useChainInfos'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { hiddenNftStore } from 'stores/manage-nft-store'
import { normalizeImageSrc } from 'utils/normalizeImageSrc'

import { ChainHeaderCollectionCard, CollectionAvatar } from './components'
import { useNftContext } from './context'

type CollectionDetailsProps = {
  nftStore: NftStore
}

export const CollectionDetails = observer(({ nftStore }: CollectionDetailsProps) => {
  const { setActivePage, showCollectionDetailsFor } = useNftContext()
  const collectionData = nftStore.nftDetails.collectionData
  const chainInfos = useChainInfos()

  const { collection, nfts } = useMemo(() => {
    const collection =
      collectionData?.collections.find(
        (collection) => collection.address === showCollectionDetailsFor,
      ) ?? ({} as Collection)

    const collectionNfts = collection
      ? collectionData?.nfts[collection?.chain].filter((nft) =>
          [nft.collection?.address ?? ''].includes(collection.address),
        ) ?? []
      : []

    const nfts = collectionNfts.filter(
      (nft) =>
        !hiddenNftStore.hiddenNfts.some((hiddenNft) => {
          const [address, tokenId] = hiddenNft.split('-:-')

          return (
            [nft.collection.address ?? ''].includes(address) &&
            (nft.tokenId ?? nft.domain) === tokenId
          )
        }),
    )

    return { collection, nfts }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collectionData?.collections,
    collectionData?.nfts,
    hiddenNftStore.hiddenNfts,
    showCollectionDetailsFor,
  ])

  return (
    <div className='relative w-full overflow-clip panel-height'>
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
                  image={normalizeImageSrc(collection?.image ?? '', collection?.address ?? '')}
                />
                <span className='truncate !max-w-[150px]' title={collection.name ?? ''}>
                  {collection.name ?? ''}
                </span>
              </h1>
            }
          />
        }
      >
        <div className='px-6 pt-4 pb-8'>
          <ChainHeaderCollectionCard nfts={nfts} chain={collection.chain} nftsCount={nfts.length} />
        </div>
      </PopupLayout>
    </div>
  )
})
