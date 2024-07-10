import { Token } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'

import { AssetCard } from './index'

type ListTokensProps = {
  assets: Token[]
}

export function ListTokens({ assets }: ListTokensProps) {
  const [showMaxAssets, setShowMaxAssets] = useState<number | 'all'>(10)

  const assetsToShow = useMemo(() => {
    switch (showMaxAssets) {
      case 'all':
        return assets ?? []

      default:
        return assets?.slice(0, showMaxAssets) ?? []
    }
  }, [assets, showMaxAssets])

  const TextElementToShow = useMemo(() => {
    const assetsLength = assets?.length ?? 0

    if (assetsLength > 10) {
      switch (showMaxAssets) {
        case 'all':
          return (
            <>
              Collapse{' '}
              <span className='material-icons-round !text-[16px] text-gray-600 dark:text-gray-400'>
                expand_less
              </span>
            </>
          )

        default:
          return (
            <>
              View {assetsLength - showMaxAssets} more tokens{' '}
              <span className='material-icons-round !text-[16px] text-gray-600 dark:text-gray-400'>
                expand_more
              </span>
            </>
          )
      }
    }

    return null
  }, [assets?.length, showMaxAssets])

  const handleTextElementClick = useCallback(() => {
    switch (showMaxAssets) {
      case 'all':
        setShowMaxAssets(10)
        break

      default:
        setShowMaxAssets('all')
        break
    }
  }, [showMaxAssets])

  return (
    <div
      className={classNames({
        'w-full flex flex-col items-center justify-center': !!TextElementToShow,
      })}
    >
      <div>
        {assetsToShow?.map((asset, index) => (
          <AssetCard key={index} asset={asset} style={{ height: 78 }} />
        ))}
      </div>

      {TextElementToShow ? (
        <button
          className='flex items-center justify-center text-gray-600 dark:text-gray-400 text-[14px] font-bold'
          onClick={handleTextElementClick}
        >
          {TextElementToShow}
        </button>
      ) : null}
    </div>
  )
}
