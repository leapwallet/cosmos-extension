import { useDisabledNFTsCollections } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { NftInfo, NftStore } from '@leapwallet/cosmos-wallet-store'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { useChainInfos } from 'hooks/useChainInfos'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { getChainName } from 'utils/getChainName'

import { CollectionAvatar, TextHeaderCollectionCard } from './components'
import { useNftContext } from './context'

type ChainNftsDetailsProps = {
  nftStore: NftStore
}

export const ChainNftsDetails = observer(({ nftStore }: ChainNftsDetailsProps) => {
  const { setActivePage, showChainNftsFor } = useNftContext()
  const collectionData = nftStore.nftDetails.collectionData
  const chainInfos = useChainInfos()
  const chainInfo = chainInfos[showChainNftsFor]
  const disabledNFTsCollections = useDisabledNFTsCollections()

  const nfts = useMemo(() => {
    return (collectionData?.nfts[showChainNftsFor] ?? []).reduce(
      (_nfts: (NftInfo & { chain: SupportedChain })[], nft) => {
        if (disabledNFTsCollections.includes(nft.collection?.address ?? '')) {
          return _nfts
        }

        return [
          ..._nfts,
          {
            ...nft,
            chain: showChainNftsFor,
          },
        ]
      },
      [],
    )
  }, [collectionData?.nfts, disabledNFTsCollections, showChainNftsFor])

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
                  image={chainInfo.chainSymbolImageUrl}
                />
                <span className='truncate !max-w-[150px]' title={getChainName(chainInfo.chainName)}>
                  {getChainName(chainInfo.chainName)}
                </span>
              </h1>
            }
          />
        }
      >
        <div className='px-6 pt-4 pb-8'>
          <TextHeaderCollectionCard
            headerTitle={`${nfts.length} NFT${nfts.length > 1 ? 's' : ''}`}
            nfts={nfts}
            noChip={true}
          />
        </div>
      </PopupLayout>
    </div>
  )
})
