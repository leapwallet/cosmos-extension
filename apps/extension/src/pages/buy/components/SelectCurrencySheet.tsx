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
      closeOnBackdropClick={true}
      title='Select Currency'
    >
      <div className='flex flex-col items-center h-full'>
        <SearchInput
          value={searchedCurrency}
          onChange={(e) => setSearchedCurrency(e.target.value)}
          data-testing-id='currency-input-search'
          placeholder='Search currency'
          onClear={() => setSearchedCurrency('')}
        />
      </div>
      {isLoading && <TokenListSkeleton />}
      {!isLoading && (
        <div>
          {currencyList?.length === 0 && (
            <EmptyCard
              isRounded
              subHeading='Try a different search term'
              src={Images.Misc.Explore}
              heading={`No results found`}
              data-testing-id='select-currency-empty-card'
            />
          )}
          {currencyList.length !== 0 &&
            currencyList.map((currency) => (
              <CurrencyCard
                key={currency.code}
                code={currency.code}
                name={currency.name}
                logo={currency.logo}
                onClick={() => onCurrencySelect(currency.code)}
              />
            ))}
        </div>
      )}
    </BottomModal>
  )
}
