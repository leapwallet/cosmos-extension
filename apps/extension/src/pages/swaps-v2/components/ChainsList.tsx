import { useCustomChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { Question } from '@phosphor-icons/react'
import classNames from 'classnames'
import { SearchInput } from 'components/search-input'
import Text from 'components/text'
import { ManageChainSettings, useManageChainData } from 'hooks/settings/useManageChains'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

export type ListChainsProps = {
  onChainSelect: (chainName: SupportedChain) => void
  selectedChain: SupportedChain
  chainsToShow?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
function PopularChains({
  popularChains,
  onClickHandler,
}: {
  popularChains: SupportedChain[]
  onClickHandler: (chain: SupportedChain) => void
}) {
  const chainInfos = useChainInfos()

  return (
    <div className='flex flex-col justify-start w-full items-start gap-[12px] mb-6'>
      <div className='font-bold dark:text-white-100 text-sm !leading-[19px]'>Popular chains</div>
      <div className='flex w-full flex-wrap gap-3'>
        {popularChains.map((chain) => (
          <button
            key={chain}
            className='flex gap-1 shrink-0 bg-gray-50 dark:bg-gray-900 rounded-full py-2 pl-2 pr-3 justify-center items-center'
            onClick={() => onClickHandler(chain)}
          >
            <img
              src={Images.Logos.getChainImage(chain)}
              alt={chain}
              className='w-6 h-6 rounded-full'
            />
            <span className='font-bold dark:text-white-100 text-sm !leading-[19px]'>
              {chainInfos[chain as SupportedChain].chainName}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ChainCard({
  itemsLength,
  chain,
  index,
  setSearchedChain,
  onChainSelect,
  selectedChain,
}: {
  chain: ManageChainSettings
  index: number
  itemsLength: number
  setSearchedChain: (chain: string) => void
  onChainSelect: (chainName: SupportedChain) => void
  selectedChain: SupportedChain
}) {
  const customChains = isCompassWallet() ? [] : useCustomChains()
  const chainInfos = useChainInfos()

  const img =
    chainInfos[chain.chainName as SupportedChain]?.chainSymbolImageUrl ??
    customChains.find((d) => d.chainName === chain.chainName)?.chainSymbolImageUrl ??
    GenericLight
  const chainName =
    chainInfos[chain.chainName as unknown as SupportedChain]?.chainName ?? chain.chainName
  const isLast = index === itemsLength - 1
  const defaultTokenLogo = useDefaultTokenLogo()

  return (
    <React.Fragment key={chain.chainName + index}>
      <div
        onClick={() => {
          setSearchedChain('')
          onChainSelect(chain.chainName)
        }}
        className={classNames('flex flex-1 items-center py-3 cursor-pointer', {
          'opacity-20': selectedChain === chain.chainName,
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

export function ChainsList({ onChainSelect, selectedChain, chainsToShow }: ListChainsProps) {
  const [searchedChain, setSearchedChain] = useState('')

  const [chains] = useManageChainData()
  const chainInfos = useChainInfos()

  const filteredChains = useMemo(() => {
    return chains.filter(function (chain) {
      if (!chain || !chain.active || (isCompassWallet() && chain.chainName === 'cosmos')) {
        return false
      }

      if (
        chainsToShow &&
        chainsToShow.length &&
        !chainsToShow.includes(chainInfos[chain.chainName]?.chainRegistryPath)
      ) {
        return false
      }

      const chainName = chainInfos[chain.chainName]?.chainName ?? chain.chainName
      return chainName.toLowerCase().includes(searchedChain.toLowerCase())
    })
  }, [chainInfos, chains, chainsToShow, searchedChain])

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

      <div className='w-full' style={{ height: window.innerHeight - 200, overflowY: 'scroll' }}>
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
                key={chain?.id}
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
