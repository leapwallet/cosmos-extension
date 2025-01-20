import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { Question } from '@phosphor-icons/react'
import classNames from 'classnames'
import { SearchInput } from 'components/search-input'
import Text from 'components/text'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { SourceChain } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

export type ListChainsProps = {
  onChainSelect: (chainName: SupportedChain) => void
  selectedChain: SupportedChain
  chainsToShow?: SourceChain[]
  setSearchedChain: (chain: string) => void
  searchedChain: string
}

export function ChainCard({
  itemsLength,
  chain,
  index,
  setSearchedChain,
  onChainSelect,
  selectedChain,
}: {
  chain: SourceChain
  index: number
  itemsLength: number
  setSearchedChain: (chain: string) => void
  onChainSelect: (chainName: SupportedChain) => void
  selectedChain: SupportedChain
}) {
  const img = chain.icon ?? GenericLight
  const chainName = chain.chainName
  const isLast = index === itemsLength - 1
  const defaultTokenLogo = useDefaultTokenLogo()

  return (
    <React.Fragment key={chain.chainName + index}>
      <div
        onClick={() => {
          setSearchedChain('')
          onChainSelect(chain.key)
        }}
        className={classNames('flex flex-1 items-center py-3 cursor-pointer', {
          'opacity-20': selectedChain === chain.key,
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
      {!isLast && <div className='border-b w-full border-gray-100 dark:border-gray-850' />}
    </React.Fragment>
  )
}

const ChainsListView = ({
  onChainSelect,
  selectedChain,
  chainsToShow,
  searchedChain,
  setSearchedChain,
}: ListChainsProps) => {
  const filteredChains = useMemo(() => {
    return (
      chainsToShow?.filter((chain) =>
        chain.chainName.toLowerCase().includes(searchedChain.toLowerCase()),
      ) ?? []
    )
  }, [chainsToShow, searchedChain])

  return (
    <>
      <div className='flex flex-col items-center h-full mb-6'>
        <SearchInput
          value={searchedChain}
          onChange={(e) => setSearchedChain(e.target.value)}
          data-testing-id='switch-chain-input-search'
          placeholder='Search chain'
          onClear={() => setSearchedChain('')}
          divClassName='rounded-2xl w-full flex gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 focus-within:border-green-600 border border-transparent'
          inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
        />
      </div>

      <div
        className='w-full'
        style={{ height: (isSidePanel() ? window.innerHeight : 600) - 200, overflowY: 'scroll' }}
      >
        {filteredChains.length === 0 ? (
          <div className='py-[88px] w-full flex-col flex  justify-center items-center gap-4'>
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
          <Virtuoso
            data={filteredChains}
            style={{ flexGrow: '1', width: '100%' }}
            itemContent={(index, chain) => (
              <ChainCard
                key={chain?.chainName}
                chain={chain}
                index={index}
                itemsLength={filteredChains.length}
                selectedChain={selectedChain}
                onChainSelect={onChainSelect}
                setSearchedChain={setSearchedChain}
              />
            )}
          />
        )}
      </div>
    </>
  )
}

export const ChainsList = observer(ChainsListView)
