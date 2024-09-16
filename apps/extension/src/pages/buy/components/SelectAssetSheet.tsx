import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/search-input'
import TokenListSkeleton from 'components/Skeletons/TokenListSkeleton'
import { AssetProps, useGetSupportedAssets } from 'hooks/kado/useGetSupportedAssets'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'

import AssetCard from './AssetCard'

type SelectAssetSheetProps = {
  isVisible: boolean
  onClose: () => void
  onAssetSelect: (asset: AssetProps) => void
}

const SelectAssetSheet = observer(
  ({ isVisible, onClose, onAssetSelect }: SelectAssetSheetProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const { isLoading, data: supportedAssets = [] } = useGetSupportedAssets()

    const assetList = useMemo<AssetProps[] | []>(
      () =>
        supportedAssets.filter(
          (asset: AssetProps) =>
            asset.symbol.toLowerCase().includes(searchTerm) ||
            asset.chainName.toLowerCase().includes(searchTerm),
        ),
      [supportedAssets, searchTerm],
    )

    return (
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        closeOnBackdropClick={true}
        title='Select Token'
      >
        <div className='flex flex-col items-center h-full'>
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testing-id='buy-asset-input-search'
            placeholder='Search token'
            onClear={() => setSearchTerm('')}
          />
        </div>
        {isLoading && <TokenListSkeleton />}
        {!isLoading && (
          <div>
            {assetList?.length === 0 && (
              <EmptyCard
                isRounded
                subHeading='Try a different search term'
                src={Images.Misc.Explore}
                heading={`No results found`}
                data-testing-id='select-asset-empty-card'
              />
            )}
            {assetList.length !== 0 &&
              assetList.map((asset) => (
                <AssetCard
                  key={asset.id}
                  symbol={asset.symbol}
                  chainName={asset.chainName}
                  assetImg={asset.assetImg}
                  chainSymbolImageUrl={asset.chainSymbolImageUrl}
                  onClick={() => onAssetSelect(asset)}
                />
              ))}
          </div>
        )}
      </BottomModal>
    )
  },
)

export default SelectAssetSheet
