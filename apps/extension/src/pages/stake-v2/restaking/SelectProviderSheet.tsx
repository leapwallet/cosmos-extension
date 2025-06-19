import { formatPercentAmount, sliceWord, useProviderApr } from '@leapwallet/cosmos-wallet-hooks'
import { Provider } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Info } from '@phosphor-icons/react'
import { EmptyCard } from 'components/empty-card'
import BottomModal from 'components/new-bottom-modal'
import ValidatorListSkeleton from 'components/Skeletons/ValidatorListSkeleton'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/ui/tooltip'
import { TooltipProvider } from 'components/ui/tooltip'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { cn } from 'utils/cn'
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
      <button
        onClick={onClick}
        className={cn(
          `relative flex items-center flex-grow gap-4 px-5 py-4 mb-4 cursor-pointer rounded-xl w-full bg-secondary-100 hover:bg-secondary-200 transition-colors`,
        )}
      >
        <img
          src={Images.Misc.Validator}
          onError={imgOnError(GenericLight)}
          width={36}
          height={36}
          className='border rounded-full border-secondary-100'
        />
        <div className='flex flex-col flex-grow gap-0.5 justify-center items-start w-full'>
          <div className='flex flex-col items-start justify-between w-full'>
            <span className='font-bold text-sm text-start'>
              {sliceWord(
                provider.moniker,
                isSidePanel()
                  ? 22 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 25,
                0,
              )}
            </span>
            {provider.specs.length > 0 && (
              <span className='font-medium text-muted-foreground text-xs'>{`${provider.specs.length} Services`}</span>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-0.5 items-end w-full'>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger>
                <Info size={18} className='text-gray-400 dark:text-gray-600' />
              </TooltipTrigger>
              <TooltipContent side='left' className='bg-transparent border-none'>
                <ProviderTooltip provider={provider} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {parseFloat(apr ?? '0') > 0 && (
            <span className='font-medium text-xs text-muted-foreground'>
              Estimated APR&nbsp;
              <span className='font-bold'>{formatPercentAmount(apr ?? '', 1)}</span>%
            </span>
          )}
        </div>
      </button>
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
      return Math.random() - 0.5
    })
    const _activeProviders = _filteredProviders.filter(
      (provider) => provider.stakestatus === 'Active',
    )
    const _inactiveProviders = _filteredProviders.filter(
      (provider) => provider.stakestatus === 'Inactive',
    )
    setIsLoading(false)
    return [_activeProviders, searchedTerm ? _inactiveProviders : []]
  }, [providers, searchedTerm])

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
      fullScreen
      isOpen={isVisible}
      onClose={() => {
        setSearchedTerm('')
        onClose()
      }}
      title='Select Provider'
      className='p-6 overflow-auto flex flex-col gap-7 h-full !pb-0'
    >
      <SearchInput
        value={searchedTerm}
        onChange={(e) => setSearchedTerm(e.target.value)}
        data-testing-id='validator-input-search'
        placeholder='Enter provider name'
        onClear={() => setSearchedTerm('')}
      />

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
          className='flex-1 w-full overflow-auto pb-4'
        />
      )}
    </BottomModal>
  )
}
