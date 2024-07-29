import {
  sliceWord,
  useActiveStakingDenom,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/search-input'
import ValidatorListSkeleton from 'components/Skeletons/ValidatorListSkeleton'
import Text from 'components/text'
import currency from 'currency.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { useMemo, useState } from 'react'
import { imgOnError } from 'utils/imgOnError'

import SelectSortBySheet from './SelectSortBySheet'

type SelectValidatorSheetProps = {
  isVisible: boolean
  onClose: () => void
  onValidatorSelect: (validator: Validator) => void
  validators: Validator[]
  apy?: Record<string, number>
}

export type STAKE_SORT_BY = 'Amount staked' | 'APY' | 'Random'

type ValidatorCardProps = {
  validator: Validator
  onClick: () => void
}

export function ValidatorCard({ validator, onClick }: ValidatorCardProps) {
  const [activeStakingDenom] = useActiveStakingDenom()
  const { data: imageUrl } = useValidatorImage(validator)

  return (
    <div
      onClick={onClick}
      className={`relative flex justify-between items-center p-4 ${
        validator.custom_attributes?.priority ? 'bg-[#29A87426]' : 'bg-white-100 dark:bg-gray-950'
      } cursor-pointer rounded-xl`}
    >
      {validator.custom_attributes?.priority !== undefined &&
        validator.custom_attributes.priority >= 1 && (
          <div className='text-white-100 dark:text-white-100 absolute top-0 right-4 px-1.5 py-0.5 bg-green-600 rounded-b-[4px] text-[10px] font-bold'>
            Promoted
          </div>
        )}
      <div className='flex items-center flex-grow'>
        <img
          src={imageUrl ?? validator?.image ?? Images.Misc.Validator}
          onError={imgOnError(GenericLight)}
          width={30}
          height={30}
          className='mr-3 border rounded-full dark:border-[#333333] border-[#cccccc]'
        />
        <div className='flex flex-col justify-center items-start w-full'>
          <Text size='sm' color='text-black-100 dark:text-white-100' className='font-bold mb-0.5'>
            {sliceWord(validator.moniker, 30, 0)}
          </Text>
          <div className='flex justify-between w-full'>
            <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
              {`${currency(
                (validator.delegations?.total_tokens_display ?? validator.tokens) as string,
                {
                  symbol: '',
                  precision: 0,
                },
              ).format()} ${activeStakingDenom.coinDenom}`}
            </Text>
            <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
              Commission:{' '}
              {validator.commission?.commission_rates.rate
                ? `${new BigNumber(validator.commission.commission_rates.rate)
                    .multipliedBy(100)
                    .toFixed(0)}%`
                : 'N/A'}
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SelectValidatorSheet({
  isVisible,
  onClose,
  onValidatorSelect,
  validators,
  apy,
}: SelectValidatorSheetProps) {
  const [searchedTerm, setSearchedTerm] = useState('')
  const [showSortBy, setShowSortBy] = useState(false)
  const [sortBy, setSortBy] = useState<STAKE_SORT_BY>('Random')
  const activeChain = useActiveChain()
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
        case 'APY':
          return apy ? (apy[a.address] < apy[b.address] ? 1 : -1) : 0
        case 'Random':
          return 0
      }
    })
    if (sortBy === 'Random') {
      filteredValidators.sort((a, b) => {
        const priorityA = a.custom_attributes?.priority
        const priorityB = b.custom_attributes?.priority

        if (priorityA !== undefined && priorityB !== undefined) {
          return priorityA - priorityB
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
  }, [validators, searchedTerm, sortBy, apy])

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => {
        setSearchedTerm('')
        onClose()
      }}
      closeOnBackdropClick={true}
      title='Select Validator'
      className='p-6'
    >
      <div className='flex flex-col gap-y-6'>
        <div className='flex gap-x-4 justify-between items-center'>
          <SearchInput
            divClassName='flex w-full bg-white-100 dark:bg-gray-950 rounded-full py-2 pl-5 pr-[10px] focus-within:border-green-600'
            value={searchedTerm}
            onChange={(e) => setSearchedTerm(e.target.value)}
            data-testing-id='validator-input-search'
            placeholder='Search validators'
            onClear={() => setSearchedTerm('')}
          />
          <span
            onClick={() => setShowSortBy(true)}
            className='material-icons-round text-black-100 dark:text-white-100 rounded-3xl cursor-pointer dark:bg-gray-950 bg-white-100 p-2'
          >
            sort
          </span>
        </div>

        {isLoading && <ValidatorListSkeleton />}
        {!isLoading && activeValidators?.length === 0 && inactiveValidators.length === 0 && (
          <EmptyCard
            isRounded
            subHeading='Try a different search term'
            src={Images.Misc.Explore}
            heading={`No validators found for '${searchedTerm}'`}
            data-testing-id='select-validator-empty-card'
          />
        )}
        {!isLoading && activeValidators.length !== 0 && (
          <div className='flex flex-col gap-y-4'>
            {activeValidators.map((validator) => (
              <ValidatorCard
                key={validator.address}
                validator={validator}
                onClick={() => onValidatorSelect(validator)}
              />
            ))}
          </div>
        )}
        {!isLoading && searchedTerm && inactiveValidators.length !== 0 && (
          <div className='flex flex-col gap-y-4'>
            <Text size='xs' color='text-gray-700 dark:text-gray-400'>
              Inactive validator
            </Text>
            {inactiveValidators.map((validator) => (
              <ValidatorCard
                key={validator.address}
                validator={validator}
                onClick={() => onValidatorSelect(validator)}
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
