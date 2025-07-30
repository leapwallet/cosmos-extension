import { usePopularTokensOnramper } from '@leapwallet/cosmos-wallet-hooks'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import TokenListSkeleton from 'components/Skeletons/TokenListSkeleton'
import { SearchInput } from 'components/ui/input/search-input'
import { AssetProps, useGetSupportedAssets } from 'hooks/swapped/useGetSupportedAssets'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { chainInfoStore } from 'stores/chain-infos-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'

import AssetCard from './AssetCard'

type AssetOrTitle = AssetProps | { title: string }

type SelectAssetSheetProps = {
  isVisible: boolean
  onClose: () => void
  onAssetSelect: (asset: AssetProps) => void
  selectedAsset?: AssetProps
}

const SelectAssetSheet = observer(
  ({ isVisible, onClose, onAssetSelect, selectedAsset }: SelectAssetSheetProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const { isLoading: isAllTokensLoading, data: supportedAssets = [] } = useGetSupportedAssets()
    const { data: popularAssets = [] } = usePopularTokensOnramper()
    const searchInputRef = useRef<HTMLInputElement>(null)
    const chainInfos = chainInfoStore.chainInfos
    const denoms = rootDenomsStore.allDenoms
    const denomsArray = Object.values(denoms)
    const chainsArray = Object.values(chainInfos)

    const popularUpdatedAssets = useMemo(() => {
      const res: AssetProps[] = popularAssets.reduce((acc: AssetProps[], asset) => {
        const chain = chainsArray.find((chain) => {
          return chain.chainRegistryPath === asset.origin || chain.key === asset.origin
        })
        const denomData = denomsArray.find(
          (denom) => denom.coinDenom.toLowerCase() === asset.symbol.toLowerCase(),
        )
        if (chain) {
          acc.push({
            ...asset,
            chainName: chain.chainName,
            chainId: chain.chainId,
            assetImg: denomData?.icon ?? '',
            chainSymbolImageUrl: chain.chainSymbolImageUrl,
            chainKey: chain.key,
          })
        }
        return acc
      }, [])
      return res
    }, [chainsArray, denomsArray, popularAssets])

    const popularAssetsList = useMemo<AssetOrTitle[] | []>(() => {
      const res = popularUpdatedAssets.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.chainName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      if (res.length > 0) {
        return [{ title: 'Popular tokens' }, ...res]
      }
      return res
    }, [popularUpdatedAssets, searchTerm])

    const assetList = useMemo<AssetOrTitle[] | []>(() => {
      const res = supportedAssets
        .filter(
          (asset: AssetProps) =>
            (asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
              asset.chainName.toLowerCase().includes(searchTerm.toLowerCase())) &&
            !popularAssets.some((popularAsset) => popularAsset.id === asset.id),
        )
        .sort((a, b) => {
          const aSymbolMatch = a.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ? 0 : 1
          const bSymbolMatch = b.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ? 0 : 1
          return aSymbolMatch - bSymbolMatch
        })
      if (res.length > 0) {
        return [{ title: 'Available tokens' }, ...res]
      }
      return res
    }, [supportedAssets, searchTerm, popularAssets])

    const allAssets = useMemo(() => {
      return [...popularAssetsList, ...assetList]
    }, [popularAssetsList, assetList])

    const isLoading = isAllTokensLoading && popularAssetsList.length === 0

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
        className='!p-6 h-full'
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
          <div className='h-[calc(100%-56px)] overflow-y-auto'>
            {allAssets?.length === 0 && (
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
            <Virtuoso
              data={allAssets}
              style={{ flexGrow: '1', width: '100%' }}
              itemContent={(index, asset) => {
                if ('title' in asset) {
                  return (
                    <div className='text-muted-foreground pt-5 pb-1 font-bold text-xs'>
                      {asset.title}
                    </div>
                  )
                }
                return (
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
                )
              }}
            />
          </div>
        )}
      </BottomModal>
    )
  },
)

export default SelectAssetSheet
