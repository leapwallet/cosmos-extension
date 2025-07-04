import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import TokenListSkeleton from 'components/Skeletons/TokenListSkeleton'
import { SearchInput } from 'components/ui/input/search-input'
import { AssetProps, useGetSupportedAssets } from 'hooks/swapped/useGetSupportedAssets'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import AssetCard from './AssetCard'

type SelectAssetSheetProps = {
  isVisible: boolean
  onClose: () => void
  onAssetSelect: (asset: AssetProps) => void
  selectedAsset?: AssetProps
}

const SelectAssetSheet = observer(
  ({ isVisible, onClose, onAssetSelect, selectedAsset }: SelectAssetSheetProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const { isLoading, data: supportedAssets = [] } = useGetSupportedAssets()
    const searchInputRef = useRef<HTMLInputElement>(null)

    const assetList = useMemo<AssetProps[] | []>(
      () =>
        supportedAssets.filter(
          (asset: AssetProps) =>
            asset.symbol.toLowerCase().includes(searchTerm) ||
            asset.chainName.toLowerCase().includes(searchTerm),
        ),
      [supportedAssets, searchTerm],
    )

    useEffect(() => {
      if (isVisible) {
        setSearchTerm('')
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 200)
      }
    }, [isVisible])

    return (
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        fullScreen
        title='Select token to buy'
        className='!p-6'
      >
        <div className='flex flex-col items-center w-full pb-2'>
          <SearchInput
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testing-id='buy-asset-input-search'
            placeholder='Search Token'
            onClear={() => setSearchTerm('')}
          />
        </div>
        {isLoading && <TokenListSkeleton />}
        {!isLoading && (
          <div>
            {assetList?.length === 0 && (
              <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
                <MagnifyingGlassMinus
                  size={64}
                  className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
                />
                <div className='flex flex-col justify-start items-center w-full gap-4'>
                  <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
                    No tokens found
                  </div>
                  <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400 text-center'>
                    We couldn’t find a match. Try searching again or use a different keyword.
                  </div>
                </div>
              </div>
            )}
            {assetList.length !== 0 &&
              assetList.map((asset, index) => (
                <>
                  <AssetCard
                    key={asset.id}
                    symbol={asset.symbol}
                    chainName={asset.chainName}
                    assetImg={asset.assetImg}
                    chainSymbolImageUrl={asset.chainSymbolImageUrl}
                    onClick={() => onAssetSelect(asset)}
                    isSelected={
                      asset.symbol === selectedAsset?.symbol &&
                      asset.chainId === selectedAsset?.chainId
                    }
                  />
                </>
              ))}
          </div>
        )}
      </BottomModal>
    )
  },
)

export default SelectAssetSheet
