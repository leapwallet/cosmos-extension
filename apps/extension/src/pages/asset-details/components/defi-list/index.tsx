/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInvestData } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import Text from 'components/text'
import React, { useMemo, useState } from 'react'

import DefiRow from '../DefiRow/DefiRow'
import { SortingButton } from '../DefiRow/SortingButton'

function sortByDefiName(a: any, b: any) {
  return b?.productName?.toLowerCase() <= a?.productName?.toLowerCase() ? -1 : 1
}

function sortByDefiType(a: any, b: any) {
  return b?.dappCategory?.toLowerCase() <= a?.dappCategory?.toLowerCase() ? -1 : 1
}

function sortByDefiTvl(a: any, b: any) {
  return new BigNumber(b?.tvl ?? '0').comparedTo(a?.tvl)
}

function sortByDefiApr(a: any, b: any) {
  return new BigNumber(b?.apr ?? '0').comparedTo(a?.apr)
}

function DefiList({ tokenName }: { tokenName: string }) {
  const [selectedSortBy, setSelectedSortBy] = useState<string>('apr')
  const [sortingDirection, setSortingDirection] = useState<string>('dsc')
  const [searchInput] = useState<string>(tokenName)
  const [filterList] = useState<string>('all')

  const investData: any = useInvestData()

  const { products: _products } = investData?.data ?? { products: undefined }

  const data = useMemo(() => {
    return Object.values(_products).filter((d: any) => d?.visible)
  }, [_products])

  const sortedTokens = useMemo(() => {
    return data
      ?.filter(
        (a: any) =>
          a?.productName?.trim()?.toLowerCase()?.includes(searchInput?.trim()?.toLowerCase()) ||
          a?.tokens?.includes(searchInput?.trim()?.toUpperCase()),
      )
      ?.sort((a: any, b: any) => {
        let sortOrder = -1
        switch (selectedSortBy) {
          case 'dappCategory': {
            sortOrder = sortByDefiType(a, b)
            break
          }
          case 'tvl': {
            sortOrder = sortByDefiTvl(a, b)
            break
          }
          case 'apr': {
            sortOrder = sortByDefiApr(a, b)
            break
          }
          case 'productName':
          default: {
            sortOrder = sortByDefiName(a, b)
            break
          }
        }
        return sortingDirection === 'asc' ? -1 * sortOrder : sortOrder
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filterList, searchInput, selectedSortBy, sortingDirection])

  if (!investData?.data || sortedTokens.length === 0) return null

  return (
    <div>
      <div className='rounded-[16px] py-[12px] items-center'>
        <Text size='sm' className='py-[4px] font-bold ' color='text-gray-600 dark:text-gray-200'>
          {`Top ${tokenName.toUpperCase()} Yields`}
        </Text>
      </div>
      <div className='flex w-full flex-col items-start justify-start rounded-[24px] border border-gray-100 bg-gray-50 shadow-[0px_7px_24px_0px_rgba(0,0,0,0.25)] dark:border-gray-900 dark:bg-gray-950'>
        <div className='grid w-full grid-cols-[6fr_2fr_2fr_1fr] items-center justify-center rounded-t-[24px] bg-gray-50 dark:bg-gray-950'>
          <SortingButton
            sortBy={selectedSortBy}
            sortDir={sortingDirection}
            setSortDir={setSortingDirection}
            setSortBy={setSelectedSortBy}
            label='Name'
            sortName='productName'
            classNamesObj={{
              outerContainer:
                'h-[40px] sm:h-[55px] pl-6 pr-[24px] text-xs sm:!text-sm !font-medium sm:!font-bold',
            }}
          />
          <SortingButton
            sortBy={selectedSortBy}
            sortDir={sortingDirection}
            setSortDir={setSortingDirection}
            setSortBy={setSelectedSortBy}
            label='TVL'
            sortName='tvl'
            classNamesObj={{
              outerContainer: 'h-[40px] sm:h-[55px] text-xs sm:!text-sm !font-medium sm:!font-bold',
            }}
          />
          <SortingButton
            sortBy={selectedSortBy}
            sortDir={sortingDirection}
            setSortDir={setSortingDirection}
            setSortBy={setSelectedSortBy}
            label='APR'
            sortName='apr'
            classNamesObj={{
              outerContainer:
                'h-[40px] sm:h-[55px] text-xs sm:!text-sm !font-medium sm:!font-bold gap-[4px] sm:gap-[10px] !justify-end sm:!justify-start',
            }}
          />
          <div></div>
        </div>
        {sortedTokens?.map((token: any) => {
          return (
            <React.Fragment key={token?.productName + token?.chain}>
              <CardDivider />
              <DefiRow token={token} />
            </React.Fragment>
          )
        })}
        <CardDivider />

        <div className='flex pr-3 flex-row items-center justify-end mr-3 group z-0 w-full cursor-pointer transition'>
          <div
            onClick={() => {
              window.open(`https://cosmos.leapwallet.io/explore/defi`, '_blank')
            }}
            className='flex flex-row items-center justify-end gap-2'
          >
            <Text
              size='sm'
              className='py-[4px] font-bold !text-gray-500 group-hover:!text-black-100 dark:!text-gray-500 dark:group-hover:!text-white-100'
            >
              View All
            </Text>
          </div>
          <div className='material-icons-round flex !h-[20px] !w-[20px] flex-row items-center justify-center gap-2 !text-[16px] !text-gray-500 group-hover:!text-black-100 dark:!text-gray-500 dark:group-hover:!text-white-100'>
            {'chevron_right'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefiList
