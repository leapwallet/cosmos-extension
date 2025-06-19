import {
  SelectedNetwork,
  sliceWord,
  useActiveStakingDenom,
  useSelectedNetwork,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import BigNumber from 'bignumber.js'
import { EmptyCard } from 'components/empty-card'
import BottomModal from 'components/new-bottom-modal'
import ValidatorListSkeleton from 'components/Skeletons/ValidatorListSkeleton'
import { Button } from 'components/ui/button'
import { SearchInput } from 'components/ui/input/search-input'
import currency from 'currency.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import Sort from 'icons/sort'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Virtuoso } from 'react-virtuoso'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'

import SelectSortBySheet from './SelectSortBySheet'

type SelectValidatorSheetProps = {
  isVisible: boolean
  onClose: () => void
  onValidatorSelect: (validator: Validator) => void
  validators: Validator[]
  apr?: Record<string, number>
  selectedValidator?: Validator
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

export type STAKE_SORT_BY = 'Amount staked' | 'APR' | 'Random'

type ValidatorCardProps = {
  validator: Validator
  onClick: () => void
  activeChain?: SupportedChain
  activeNetwork?: SelectedNetwork
  isSelected?: boolean
}

export const ValidatorCard = observer(
  ({ validator, onClick, activeChain, activeNetwork, isSelected }: ValidatorCardProps) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [activeStakingDenom] = useActiveStakingDenom(
      rootDenomsStore.allDenoms,
      activeChain,
      activeNetwork,
    )
    const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator)
    const imageUrl = validator?.image || validatorImage || Images.Misc.Validator

    const { commission, moniker, tokens } = useMemo(() => {
      const moniker = sliceWord(
        validator.moniker,
        26 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7),
        0,
      )
      const tokens = `${currency(
        (validator.delegations?.total_tokens_display ?? validator.tokens ?? '') as string,
        {
          symbol: '',
          precision: 0,
        },
      ).format()} ${activeStakingDenom.coinDenom}`

      const commission = validator.commission?.commission_rates.rate
        ? `${new BigNumber(validator.commission.commission_rates.rate)
            .multipliedBy(100)
            .toFixed(0)}%`
        : 'N/A'

      return {
        moniker,
        tokens,
        commission,
      }
    }, [activeStakingDenom.coinDenom, validator])

    const isPromoted =
      validator.custom_attributes?.priority !== undefined &&
      validator.custom_attributes.priority >= 1

    return (
      <button
        onClick={onClick}
        className={cn(
          `relative flex items-center flex-grow gap-4 px-5 py-4 mb-4 cursor-pointer rounded-xl w-full bg-secondary-100 hover:bg-secondary-200 transition-colors`,
          isPromoted && 'py-[22.5px]',
          isSelected && 'border border-monochrome',
        )}
      >
        <div className='relative shrink-0 h-9 w-9'>
          <img
            src={imageUrl}
            onError={imgOnError(GenericLight)}
            onLoadCapture={() => {
              setIsImageLoaded(true)
            }}
            width={36}
            height={36}
            className='border rounded-full border-secondary-100'
          />
          {!isImageLoaded && <Skeleton circle className='absolute inset-0' />}
        </div>
        <div className='flex flex-col gap-0.5 justify-center items-start w-full'>
          <span className='font-bold text-sm text-start'>{moniker}</span>
          {isPromoted && <span className='text-xs text-accent-success font-medium'>Promoted</span>}
        </div>

        <div className='flex flex-col gap-0.5 items-end w-full'>
          <span className='font-medium text-sm'>{tokens}</span>
          <span className='font-medium text-xs text-muted-foreground'>
            Commission: {commission}
          </span>
        </div>
      </button>
    )
  },
)

export default function SelectValidatorSheet({
  isVisible,
  onClose,
  onValidatorSelect,
  validators,
  apr,
  selectedValidator,
  forceChain,
  forceNetwork,
}: SelectValidatorSheetProps) {
  const [searchedTerm, setSearchedTerm] = useState('')
  const [showSortBy, setShowSortBy] = useState(false)
  const [sortBy, setSortBy] = useState<STAKE_SORT_BY>('Random')

  const _activeChain = useActiveChain()
  const _activeNetwork = useSelectedNetwork()
  const activeChain = forceChain ?? _activeChain
  const activeNetwork = forceNetwork ?? _activeNetwork

  const [isLoading, setIsLoading] = useState(false)
  const [activeValidators, inactiveValidators] = useMemo(() => {
    setIsLoading(true)
    const filteredValidators = validators.filter(
      (validator) =>
        validator.moniker.toLowerCase().includes(searchedTerm.toLowerCase()) ||
        validator.address.includes(searchedTerm),
    )
    filteredValidators.sort((a, b) => {
      switch (sortBy) {
        case 'Amount staked':
          return +(a.tokens ?? '') < +(b.tokens ?? '') ? 1 : -1
        case 'APR':
          return apr ? (apr[a.address] < apr[b.address] ? 1 : -1) : 0
        case 'Random':
          return Math.random() - 0.5
      }
    })
    if (sortBy === 'Random') {
      filteredValidators.sort((a, b) => {
        const priorityA = a.custom_attributes?.priority
        const priorityB = b.custom_attributes?.priority

        if (priorityA !== undefined && priorityB !== undefined) {
          if (priorityA !== priorityB) {
            return priorityA - priorityB
          }
          return Math.random() - 0.5
        } else if (priorityA !== undefined) {
          return -1
        } else if (priorityB !== undefined) {
          return 1
        } else {
          return 0
        }
      })
    }
    const _activeValidators = filteredValidators.filter((validator) => validator.active !== false)
    const _inactiveValidators = filteredValidators.filter((validator) => validator.active === false)
    setIsLoading(false)
    return [_activeValidators, searchedTerm ? _inactiveValidators : []]
  }, [validators, searchedTerm, sortBy, apr])

  const listItems = useMemo(() => {
    const items: (Validator | { itemType: 'inactiveHeader' })[] = [...activeValidators]
    if (inactiveValidators.length > 0) {
      items.push({ itemType: 'inactiveHeader' })
      items.push(...inactiveValidators)
    }
    return items
  }, [activeValidators, inactiveValidators])

  const renderItem = useCallback(
    (_: number, item: Validator | { itemType: 'inactiveHeader' }) => {
      if ('itemType' in item) {
        return null
      }

      return (
        <ValidatorCard
          validator={item}
          onClick={() => onValidatorSelect(item)}
          activeChain={activeChain}
          activeNetwork={activeNetwork}
          isSelected={selectedValidator?.address === item.address}
        />
      )
    },
    [activeChain, activeNetwork, onValidatorSelect, selectedValidator?.address],
  )

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={() => {
        setSearchedTerm('')
        onClose()
      }}
      title='Select Validator'
      className='p-6 overflow-auto flex flex-col gap-7 h-full !pb-0'
    >
      <div className='flex gap-x-2 justify-between items-center'>
        <SearchInput
          value={searchedTerm}
          onChange={(e) => setSearchedTerm(e.target.value)}
          data-testing-id='validator-input-search'
          placeholder='Enter validator name'
          onClear={() => setSearchedTerm('')}
        />
        <Button
          size={'icon'}
          variant={'secondary'}
          className='text-muted-foreground h-12 w-14'
          onClick={() => setShowSortBy(true)}
        >
          <Sort size={20} />
        </Button>
      </div>

      {isLoading && <ValidatorListSkeleton />}

      {!isLoading && listItems.length === 0 && (
        <EmptyCard
          isRounded
          subHeading='Try a different search term'
          src={Images.Misc.Explore}
          heading={`No validators found for '${searchedTerm}'`}
          data-testing-id='select-validator-empty-card'
        />
      )}

      {!isLoading && listItems.length > 0 && (
        <Virtuoso
          data={listItems}
          itemContent={renderItem}
          className='flex-1 w-full overflow-auto pb-4'
        />
      )}

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
