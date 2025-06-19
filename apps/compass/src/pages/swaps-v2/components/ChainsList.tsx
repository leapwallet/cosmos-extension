import { Question } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import Fuse from 'fuse.js'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { SourceChain, SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

export type TokenAssociatedChain = {
  chain: SourceChain
  asset?: SourceToken
}

export type ListChainsProps = {
  onChainSelect: (props: TokenAssociatedChain) => void
  selectedChain?: SourceChain
  selectedToken: SourceToken | null
  chainsToShow?: TokenAssociatedChain[]
  setSearchedChain: (chain: string) => void
  searchedChain: string
}

export function ChainCard({
  itemsLength,
  tokenAssociatedChain,
  index,
  setSearchedChain,
  onChainSelect,
  selectedChain,
  selectedToken,
}: {
  tokenAssociatedChain: TokenAssociatedChain
  index: number
  itemsLength: number
  setSearchedChain: (chain: string) => void
  onChainSelect: (props: TokenAssociatedChain) => void
  selectedChain?: SourceChain
  selectedToken: SourceToken | null
}) {
  const img = tokenAssociatedChain.chain.icon ?? GenericLight
  const chainName = tokenAssociatedChain.chain.chainName
  const isLast = index === itemsLength - 1
  const defaultTokenLogo = useDefaultTokenLogo()

  const isSelected =
    !!selectedChain &&
    selectedChain.key === tokenAssociatedChain.chain.key &&
    (!selectedToken ||
      selectedToken.skipAsset?.denom === tokenAssociatedChain.asset?.skipAsset?.denom)

  return (
    <React.Fragment
      key={`${tokenAssociatedChain.chain.chainName}-${tokenAssociatedChain.asset?.skipAsset?.denom}-${index}`}
    >
      <div
        onClick={() => {
          setSearchedChain('')
          onChainSelect(tokenAssociatedChain)
        }}
        className={classNames('flex flex-1 items-center py-3 cursor-pointer px-6', {
          'opacity-20': isSelected,
        })}
      >
        <div className='flex items-center flex-1'>
          <img
            src={img ?? defaultTokenLogo}
            className='h-10 w-10 mr-3'
            onError={imgOnError(defaultTokenLogo)}
          />
          <Text
            size='md'
            className='font-bold'
            data-testing-id={`switch-chain-${chainName.toLowerCase()}-ele`}
          >
            {chainName}
          </Text>
        </div>
      </div>
      {!isLast && <div className='border-b border-gray-100 dark:border-gray-850 mx-6' />}
    </React.Fragment>
  )
}

const ChainsListView = ({
  onChainSelect,
  selectedChain,
  selectedToken,
  chainsToShow,
  searchedChain,
  setSearchedChain,
}: ListChainsProps) => {
  const chainsFuse = useMemo(() => {
    return new Fuse(chainsToShow ?? [], {
      threshold: 0.3,
      keys: ['chain.chainName'],
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
      <div className='flex flex-col items-center h-full p-6'>
        <SearchInput
          value={searchedChain}
          onChange={(e) => setSearchedChain(e.target.value)}
          data-testing-id='switch-chain-input-search'
          placeholder='Search chain'
          onClear={() => setSearchedChain('')}
        />
      </div>

      <div
        className='w-full pb-6'
        style={{ height: (isSidePanel() ? window.innerHeight : 600) - 200, overflowY: 'scroll' }}
      >
        {filteredChains.length === 0 ? (
          <div className='py-[88px] w-full flex-col flex  justify-center items-center gap-4 px-6'>
            <Question size={40} className='dark:text-white-100' />
            <div className='flex flex-col justify-start items-center w-full gap-1'>
              <div className='text-md text-center font-bold !leading-[21.5px] dark:text-white-100'>
                No chains found for &apos;{searchedChain}&apos;
              </div>
              <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400'>
                Try searching for a different term
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
                  key={`${tokenAssociatedChain?.chain?.chainName}-${tokenAssociatedChain?.asset?.skipAsset.denom}`}
                  tokenAssociatedChain={tokenAssociatedChain}
                  index={index}
                  itemsLength={filteredChains.length}
                  selectedChain={selectedChain}
                  selectedToken={selectedToken}
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
