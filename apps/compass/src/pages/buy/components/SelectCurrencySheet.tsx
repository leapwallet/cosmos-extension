import { Compass, MagnifyingGlassMinus } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/search-input'
import TokenListSkeleton from 'components/Skeletons/TokenListSkeleton'
import { useGetKadoCurrencies } from 'hooks/useGetKadoDetails'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'

import CurrencyCard from './CurrencyCard'

type SelectCurrencySheetProps = {
  isVisible: boolean
  onClose: () => void
  onCurrencySelect: (code: string) => void
}

type CurrencyProps = {
  code: string
  name: string
  logo: string
}

export default function SelectCurrencySheet({
  isVisible,
  onClose,
  onCurrencySelect,
}: SelectCurrencySheetProps) {
  const [searchedCurrency, setSearchedCurrency] = useState('')
  const { isLoading, data: supportedCurrencies = [] } = useGetKadoCurrencies()
  const currencyList = useMemo<CurrencyProps[] | []>(
    () =>
      supportedCurrencies.filter(
        (currency: CurrencyProps) =>
          currency.code.toLowerCase().includes(searchedCurrency) ||
          currency.name.toLowerCase().includes(searchedCurrency),
      ),
    [supportedCurrencies, searchedCurrency],
  )

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      title='Select currency'
      className='!p-6'
      fullScreen={true}
    >
      <div className='flex flex-col items-center w-full pb-2'>
        <SearchInput
          value={searchedCurrency}
          onChange={(e) => setSearchedCurrency(e.target.value)}
          data-testing-id='currency-input-search'
          placeholder='Search currency'
          onClear={() => setSearchedCurrency('')}
          divClassName='rounded-2xl w-full flex items-center gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 dark:focus-within:border-white-100 hover:border-secondary-400 focus-within:border-black-100 border border-transparent'
          inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
        />
      </div>
      {isLoading && <TokenListSkeleton />}
      {!isLoading && (
        <div>
          {currencyList?.length === 0 && (
            <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
              <MagnifyingGlassMinus
                size={64}
                className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
              />
              <div className='flex flex-col justify-start items-center w-full gap-4'>
                <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
                  No tokens found
                </div>
                <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400 text-center'>
                  We couldn’t find a match. Try searching again or use a different keyword.
                </div>
              </div>
            </div>
          )}
          <div className='max-h-[460px]'>
            {currencyList.length !== 0 &&
              currencyList.map((currency, index) => (
                <>
                  <CurrencyCard
                    key={currency.code}
                    code={currency.code}
                    name={currency.name}
                    logo={currency.logo}
                    onClick={() => onCurrencySelect(currency.code)}
                  />
                  {index !== currencyList.length - 1 && (
                    <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                  )}
                </>
              ))}
          </div>
        </div>
      )}
    </BottomModal>
  )
}
