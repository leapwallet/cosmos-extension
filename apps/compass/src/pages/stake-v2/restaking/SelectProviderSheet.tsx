import { formatPercentAmount, sliceWord, useProviderApr } from '@leapwallet/cosmos-wallet-hooks'
import { Provider } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Info } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/search-input'
import ValidatorListSkeleton from 'components/Skeletons/ValidatorListSkeleton'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

import SelectSortBySheet from '../components/SelectSortBySheet'
import ProviderTooltip from './ProviderTooltip'

type SelectProviderSheetProps = {
  isVisible: boolean
  onClose: () => void
  onProviderSelect: (provider: Provider) => void
  providers: Provider[]
}

export type STAKE_SORT_BY = 'Amount staked' | 'APR' | 'Random'

type ProviderCardProps = {
  provider: Provider
  onClick: () => void
  rootDenomsStore: RootDenomsStore
}

export const ProviderCard = observer(
  ({ provider, onClick, rootDenomsStore }: ProviderCardProps) => {
    const [showTooltip, setShowTooltip] = useState(false)
    const { apr } = useProviderApr(provider.provider, rootDenomsStore.allDenoms)

    const handleMouseEnter = useCallback(() => {
      setShowTooltip(true)
    }, [])
    const handleMouseLeave = useCallback(() => {
      setShowTooltip(false)
    }, [])

    return (
      <div
        onClick={onClick}
        className='relative flex justify-between items-center p-4 mb-4 bg-white-100 dark:bg-gray-950 cursor-pointer rounded-xl'
      >
        <div className='flex items-center flex-grow'>
          <img
            src={Images.Misc.Validator}
            onError={imgOnError(GenericLight)}
            width={30}
            height={30}
            className='mr-3 border rounded-full dark:border-[#333333] border-[#cccccc]'
          />
          <div className='flex flex-col justify-center items-start w-full'>
            <div className='flex justify-between w-full'>
              <Text
                size='sm'
                color='text-black-100 dark:text-white-100'
                className='font-bold mb-0.5'
              >
                {sliceWord(
                  provider.moniker,
                  isSidePanel()
                    ? 22 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                    : 30,
                  0,
                )}
              </Text>
              <div className='relative'>
                <Info
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  size={18}
                  className='text-gray-400 dark:text-gray-600'
                />
                {showTooltip && (
                  <ProviderTooltip
                    provider={provider}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    positionClassName='-top-2 right-4 px-3'
                  />
                )}
              </div>
            </div>
            <div className='flex justify-between w-full'>
              {provider.specs.length > 0 && (
                <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                  {`${provider.specs.length} Services`}
                </Text>
              )}
              {parseFloat(apr ?? '0') > 0 && (
                <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                  Estimated APR&nbsp;
                  <span className='font-bold'>{formatPercentAmount(apr ?? '', 1)}</span>%
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
)

export default function SelectProviderSheet({
  isVisible,
  onClose,
  onProviderSelect,
  providers,
}: SelectProviderSheetProps) {
  const [searchedTerm, setSearchedTerm] = useState('')
  const [showSortBy, setShowSortBy] = useState(false)
  const [sortBy, setSortBy] = useState<STAKE_SORT_BY>('Random')
  const activeChain = useActiveChain()
  const [isLoading, setIsLoading] = useState(false)
  const [activeProviders, inactiveProviders] = useMemo(() => {
    setIsLoading(true)
    const _filteredProviders = providers
      .filter(
        (provider) =>
          provider.moniker && provider.moniker.toLowerCase().includes(searchedTerm.toLowerCase()),
      )
      .slice(0, 100)
    _filteredProviders.sort(() => {
      switch (sortBy) {
        case 'Amount staked':
          return 0
        case 'APR':
          return 0
        case 'Random':
          return Math.random() - 0.5
      }
    })
    const _activeProviders = _filteredProviders.filter(
      (provider) => provider.stakestatus === 'Active',
    )
    const _inactiveProviders = _filteredProviders.filter(
      (provider) => provider.stakestatus === 'Inactive',
    )
    setIsLoading(false)
    return [_activeProviders, searchedTerm ? _inactiveProviders : []]
  }, [providers, searchedTerm, sortBy])

  const listItems = useMemo(() => {
    const items: (Provider | { itemType: 'inactiveHeader' })[] = [...activeProviders]
    if (inactiveProviders.length > 0) {
      items.push({ itemType: 'inactiveHeader' })
      items.push(...inactiveProviders)
    }
    return items
  }, [activeProviders, inactiveProviders])

  const renderItem = useCallback(
    (_: number, item: Provider | { itemType: 'inactiveHeader' }) => {
      if ('itemType' in item) {
        return (
          <Text size='xs' color='text-gray-700 dark:text-gray-400' className='mb-4'>
            Inactive Provider
          </Text>
        )
      }
      return (
        <ProviderCard
          provider={item}
          onClick={() => onProviderSelect(item)}
          rootDenomsStore={rootDenomsStore}
        />
      )
    },
    [onProviderSelect],
  )

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => {
        setSearchedTerm('')
        onClose()
      }}
      title='Select Provider'
      containerClassName='h-[calc(100%-34px)]'
      className='p-6 !overflow-hidden max-h-[calc(100%-69px)] h-full'
    >
      <div className='flex flex-col gap-y-6 h-full'>
        <SearchInput
          divClassName='flex w-full bg-white-100 dark:bg-gray-950 rounded-full py-2 pl-5 pr-[10px] focus-within:border-green-600'
          value={searchedTerm}
          onChange={(e) => setSearchedTerm(e.target.value)}
          data-testing-id='provider-input-search'
          placeholder='Search providers'
          onClear={() => setSearchedTerm('')}
        />

        <div className='w-full h-full' style={{ overflowY: 'scroll' }}>
          {isLoading && <ValidatorListSkeleton />}
          {!isLoading && listItems.length === 0 && (
            <EmptyCard
              isRounded
              subHeading='Try a different search term'
              src={Images.Misc.Explore}
              heading={`No providers found for '${searchedTerm}'`}
              data-testing-id='select-provider-empty-card'
            />
          )}
          {!isLoading && listItems.length > 0 && (
            <Virtuoso
              data={listItems}
              itemContent={renderItem}
              style={{ flexGrow: '1', width: '100%' }}
            />
          )}
        </div>
      </div>
      <SelectSortBySheet
        onClose={() => setShowSortBy(false)}
        isVisible={showSortBy}
        setVisible={setShowSortBy}
        setSortBy={setSortBy}
        sortBy={sortBy}
        activeChain={activeChain}
      />
    </BottomModal>
  )
}
