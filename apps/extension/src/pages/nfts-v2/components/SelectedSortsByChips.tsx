import { sortStringArr } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useChainPageInfo } from 'hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import React from 'react'
import { getChainName } from 'utils/getChainName'

import { Chip } from './index'

type SelectedSortsByChipsProps = {
  selectedSortsBy: SupportedChain[]
  setSelectedSortsBy: React.Dispatch<React.SetStateAction<SupportedChain[]>>
}

export function SelectedSortsByChips({
  selectedSortsBy,
  setSelectedSortsBy,
}: SelectedSortsByChipsProps) {
  const chainInfos = useChainInfos()
  const { topChainColor } = useChainPageInfo()

  return (
    <div className='flex overflow-auto whitespace-nowrap scroll-smooth mb-4'>
      {sortStringArr(selectedSortsBy).map((chain) => {
        const chainInfo = chainInfos[chain as SupportedChain]

        return (
          <Chip
            key={chain}
            className='bg-gray-100 dark:bg-gray-950 py-[8px] px-[14px] mr-3 min-w-[125px]'
          >
            <Chip.Image
              className='w-[15px] h-[15px] mr-2'
              src={chainInfo.chainSymbolImageUrl}
              alt={`${chainInfo.chainName.toLowerCase()} logo`}
            />

            <Chip.Text
              className='text-gray-800 dark:text-gray-50 text-sm max-w-[90px] truncate'
              title={getChainName(chainInfo.chainName)}
            >
              {getChainName(chainInfo.chainName)}
            </Chip.Text>

            <Chip.Image
              className='w-[12px] h-[12px] ml-2 cursor-pointer'
              src={Images.Misc.Cross}
              alt='close'
              onClick={() =>
                setSelectedSortsBy((prevValue) =>
                  prevValue.filter((prevChain) => prevChain !== chain),
                )
              }
            />
          </Chip>
        )
      })}

      <Chip
        onClick={() => setSelectedSortsBy([])}
        className='cursor-pointer border border-gray-100 dark:border-gray-800 py-[8px] px-[14px]'
      >
        <Chip.Text
          className='text-gray-800 dark:text-gray-50 text-sm font-bold'
          title='Reset'
          style={{ color: topChainColor }}
        >
          Reset
        </Chip.Text>
      </Chip>
    </div>
  )
}
