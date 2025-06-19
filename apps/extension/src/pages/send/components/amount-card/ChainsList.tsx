import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import Fuse from 'fuse.js'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { CheckIcon } from 'icons/check-icon'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Virtuoso } from 'react-virtuoso'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

export type ListChainsProps = {
  onChainSelect: (props: ChainInfo) => void
  selectedChain?: ChainInfo
  chainsToShow?: ChainInfo[]
  setSearchedChain: (chain: string) => void
  searchedChain: string
  loadingChains: boolean
}

export function ChainsListSkeleton({ index, isLast }: { index: number; isLast: boolean }) {
  return (
    <React.Fragment key={`chain-list-skeleton-${index}`}>
      <div className='flex items-center py-4 mx-6 z-0 !h-[72px]'>
        <div className='w-9 h-9'>
          <Skeleton
            circle
            className='w-9 h-9'
            containerClassName='block !leading-none'
            style={{
              zIndex: 0,
            }}
          />
        </div>
        <div className='max-w-[80px] z-0 ml-4'>
          <Skeleton width={80} className='z-0 h-[17px]' />
        </div>
      </div>
      {!isLast && <div className='border-b border-gray-100 dark:border-gray-850 mx-6' />}
    </React.Fragment>
  )
}

export function ChainCard({
  itemsLength,
  tokenAssociatedChain,
  index,
  setSearchedChain,
  onChainSelect,
  selectedChain,
}: {
  tokenAssociatedChain: ChainInfo
  index: number
  itemsLength: number
  setSearchedChain: (chain: string) => void
  onChainSelect: (props: ChainInfo) => void
  selectedChain?: ChainInfo
}) {
  const img = tokenAssociatedChain.chainSymbolImageUrl ?? GenericLight
  const chainName = tokenAssociatedChain.chainName
  const isLast = index === itemsLength - 1
  const defaultTokenLogo = useDefaultTokenLogo()

  const isSelected = !!selectedChain && selectedChain.key === tokenAssociatedChain.key

  return (
    <React.Fragment key={`${tokenAssociatedChain.chainName}-${index}`}>
      <div
        onClick={() => {
          setSearchedChain('')
          onChainSelect(tokenAssociatedChain)
        }}
        className={classNames('flex flex-1 items-center cursor-pointer px-6 mb-3')}
      >
        <div className='flex items-center flex-1 rounded-xl bg-secondary-100 hover:bg-secondary-200 px-4 py-2'>
          <div className='flex items-center justify-center h-10 w-10 mr-3 shrink-0'>
            <img
              src={img || defaultTokenLogo}
              className='h-8 w-8 rounded-full'
              onError={imgOnError(defaultTokenLogo)}
            />
          </div>
          <Text
            className='font-bold text-base !leading-[22px] text-foreground'
            data-testing-id={`switch-chain-${chainName.toLowerCase()}-ele`}
          >
            {chainName}
          </Text>
          {isSelected && <CheckIcon size={20} className='text-accent-green ml-auto size-6' />}
        </div>
      </div>
    </React.Fragment>
  )
}

const ChainsListView = ({
  onChainSelect,
  selectedChain,
  chainsToShow,
  searchedChain,
  setSearchedChain,
  loadingChains,
}: ListChainsProps) => {
  const chainsFuse = useMemo(() => {
    return new Fuse(chainsToShow ?? [], {
      threshold: 0.3,
      keys: ['chainName'],
      shouldSort: false,
    })
  }, [chainsToShow])

  const filteredChains = useMemo(() => {
    if (!searchedChain) {
      return chainsToShow ?? []
    }
    return chainsFuse?.search(searchedChain).map((chain) => chain.item) ?? []
  }, [chainsFuse, searchedChain, chainsToShow])

  return (
    <>
      <div className='flex flex-col items-center p-6'>
        <SearchInput
          value={searchedChain}
          onChange={(e) => setSearchedChain(e.target.value)}
          data-testing-id='switch-chain-input-search'
          placeholder='Search by chain name'
          onClear={() => setSearchedChain('')}
        />
      </div>

      <div
        className={classNames('w-full pb-6', {
          'mt-3': filteredChains.length === 0 && !loadingChains,
        })}
        style={{ height: (isSidePanel() ? window.innerHeight : 600) - 156, overflowY: 'scroll' }}
      >
        {loadingChains ? (
          Array.from({ length: 5 }).map((_, index) => (
            <ChainsListSkeleton key={index} index={index} isLast={index === 4} />
          ))
        ) : filteredChains.length === 0 ? (
          <div className='w-full px-6 h-full pb-6'>
            <div className='h-full px-5 w-full flex-col flex justify-center items-center gap-4 border border-secondary-200 rounded-2xl'>
              <div className='p-2 bg-secondary-200 rounded-full'>
                <MagnifyingGlassMinus
                  size={64}
                  className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
                />
              </div>
              <div className='flex flex-col justify-start items-center w-full gap-3'>
                <div className='text-[18px] !leading-[24px] text-center font-bold text-foreground'>
                  No chains found
                </div>
                <div className='text-xs !leading-[16px] text-secondary-800 text-center'>
                  We couldn&apos;t find a match. Try searching again or use a different keyword.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Virtuoso
              data={filteredChains}
              style={{ flexGrow: '1', width: '100%' }}
              className='scrollbar'
              itemContent={(index, tokenAssociatedChain) => (
                <ChainCard
                  key={tokenAssociatedChain?.chainName}
                  tokenAssociatedChain={tokenAssociatedChain}
                  index={index}
                  itemsLength={filteredChains.length}
                  selectedChain={selectedChain}
                  onChainSelect={onChainSelect}
                  setSearchedChain={setSearchedChain}
                />
              )}
            />
          </>
        )}
      </div>
    </>
  )
}

export const ChainsList = observer(ChainsListView)
