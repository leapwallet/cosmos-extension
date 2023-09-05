import {
  OwnedCollectionTokenInfo,
  useActiveChain,
  useDisabledNFTsCollections,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useMemo } from 'react'
import { Colors } from 'theme/colors'
import { getChainName } from 'utils/getChainName'

import { CollectionAvatar, TextHeaderCollectionCard } from './components'
import { useNftContext } from './context'

export function ChainNftsDetails() {
  const { collectionData, setActivePage, showChainNftsFor } = useNftContext()
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()
  const chainInfo = chainInfos[showChainNftsFor]
  const disabledNFTsCollections = useDisabledNFTsCollections()

  const nfts = useMemo(() => {
    return (collectionData?.nfts[showChainNftsFor] ?? []).reduce(
      (_nfts: (OwnedCollectionTokenInfo & { chain: SupportedChain })[], nft) => {
        if (
          disabledNFTsCollections.includes(nft.collection.address ?? nft.collection.address ?? '')
        ) {
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
                  image={chainInfo.chainSymbolImageUrl}
                />
                <span className='truncate max-w-[150px]' title={getChainName(chainInfo.chainName)}>
                  {getChainName(chainInfo.chainName)}
                </span>
              </h1>
            }
            topColor={Colors.getChainColor(activeChain)}
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
}
