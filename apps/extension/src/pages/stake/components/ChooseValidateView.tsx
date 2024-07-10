import { sliceSearchWord } from '@leapwallet/cosmos-wallet-hooks'
import { Delegation, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/search-input'
import { Images } from 'images'
import React from 'react'

import { ChooseValidatorViewHeading, CurrentValidatorCard, ValidatorsList } from './index'

type ChooseValidatorViewProps = {
  validators: Validator[]
  fromValidator?: Validator
  delegation?: Delegation
  searchfilter: string
  setSearchfilter: (s: string) => void
  apys: Record<string, number>
  onClickSortBy: () => void
  onShuffle: () => void
  setSelectedValidator: (v: Validator) => void
  activeStakingCoinDenom: string
}

const ChooseValidatorView = React.memo(
  ({
    validators,
    apys,
    searchfilter,
    fromValidator,
    delegation,
    onClickSortBy,
    setSearchfilter,
    setSelectedValidator,
    activeStakingCoinDenom,
  }: ChooseValidatorViewProps) => {
    return (
      <>
        {!(fromValidator && delegation) && (
          <ChooseValidatorViewHeading activeStakingCoinDenom={activeStakingCoinDenom} />
        )}
        <div className='flex flex-col gap-y-4 mb-8'>
          {fromValidator && delegation && (
            <CurrentValidatorCard fromValidator={fromValidator} delegation={delegation} />
          )}

          <div className='flex justify-between items-center'>
            <SearchInput
              divClassName='w-[288px] flex h-10 bg-white-100 dark:bg-gray-950 rounded-[30px] py-2 pl-5 pr-[10px]'
              placeholder='Search validators...'
              value={searchfilter}
              onChange={(e) => setSearchfilter(e.target?.value)}
              onClear={() => setSearchfilter('')}
            />

            <div
              onClick={onClickSortBy}
              className='rounded-3xl h-10 w-10 cursor-pointer ml-3 justify-center items-center dark:bg-gray-950 bg-white-100'
            >
              <span className='material-icons-round  h-10 w-10 mt-2 text-center text-white-100'>
                sort
              </span>
            </div>
          </div>

          {validators?.length === 0 ? (
            <EmptyCard
              isRounded
              subHeading='Please try again with something else'
              heading={'No results for “' + sliceSearchWord(searchfilter) + '”'}
              src={Images.Misc.Explore}
            />
          ) : (
            <ValidatorsList
              onSelectValidator={setSelectedValidator}
              validators={validators}
              apys={apys}
              activeStakingCoinDenom={activeStakingCoinDenom}
            />
          )}
        </div>
      </>
    )
  },
)

ChooseValidatorView.displayName = 'ChooseValidatorView'
export { ChooseValidatorView }
