import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { Provider } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/search-input'
import ValidatorListSkeleton from 'components/Skeletons/ValidatorListSkeleton'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { useMemo, useState } from 'react'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

import SelectSortBySheet from '../components/SelectSortBySheet'

type SelectProviderSheetProps = {
  isVisible: boolean
  onClose: () => void
  onProviderSelect: (provider: Provider) => void
  providers: Provider[]
  apy?: Record<string, number>
}

export type STAKE_SORT_BY = 'Amount staked' | 'APY' | 'Random'

type ProviderCardProps = {
  provider: Provider
  onClick: () => void
}

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
  return (
    <div
      onClick={onClick}
      className='relative flex justify-between items-center p-4 bg-white-100 dark:bg-gray-950 cursor-pointer rounded-xl'
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
          <Text size='sm' color='text-black-100 dark:text-white-100' className='font-bold mb-0.5'>
            {sliceWord(
              provider.moniker,
              isSidePanel()
                ? 22 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                : 30,
              0,
            )}
          </Text>
          {provider.spec && (
            <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
              {sliceWord(
                provider.spec.charAt(0).toUpperCase() + provider.spec.slice(1).toLowerCase(),
                isSidePanel()
                  ? 22 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 30,
                0,
              )}
            </Text>
          )}
        </div>
      </div>
    </div>
  )
}

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
        case 'APY':
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

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => {
        setSearchedTerm('')
        onClose()
      }}
      closeOnBackdropClick={true}
      title='Select Provider'
      className='p-6'
    >
      <div className='flex flex-col gap-y-6'>
        <SearchInput
          divClassName='flex w-full bg-white-100 dark:bg-gray-950 rounded-full py-2 pl-5 pr-[10px] focus-within:border-green-600'
          value={searchedTerm}
          onChange={(e) => setSearchedTerm(e.target.value)}
          data-testing-id='provider-input-search'
          placeholder='Search providers'
          onClear={() => setSearchedTerm('')}
        />

        {isLoading && <ValidatorListSkeleton />}
        {!isLoading && activeProviders?.length === 0 && inactiveProviders?.length === 0 && (
          <EmptyCard
            isRounded
            subHeading='Try a different search term'
            src={Images.Misc.Explore}
            heading={`No providers found for '${searchedTerm}'`}
            data-testing-id='select-provider-empty-card'
          />
        )}
        {!isLoading && activeProviders.length !== 0 && (
          <div className='flex flex-col gap-y-4'>
            {activeProviders.map((provider) => (
              <ProviderCard
                key={`${provider.address}+${provider.spec}`}
                provider={provider}
                onClick={() => onProviderSelect(provider)}
              />
            ))}
          </div>
        )}
        {!isLoading && searchedTerm && inactiveProviders.length !== 0 && (
          <div className='flex flex-col gap-y-4'>
            <Text size='xs' color='text-gray-700 dark:text-gray-400'>
              Inactive provider
            </Text>
            {inactiveProviders.map((provider) => (
              <ProviderCard
                key={`${provider.address}+${provider.spec}`}
                provider={provider}
                onClick={() => onProviderSelect(provider)}
              />
            ))}
          </div>
        )}
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
