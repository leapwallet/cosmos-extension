import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import TokenListSkeleton from 'components/Skeletons/TokenListSkeleton'
import { SearchInput } from 'components/ui/input/search-input'
import { useOnramperAssets } from 'hooks/useGetOnramperDetails'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import CurrencyCard from './CurrencyCard'

type SelectCurrencySheetProps = {
  isVisible: boolean
  onClose: () => void
  onCurrencySelect: (code: string) => void
  selectedCurrency?: string
}

type CurrencyProps = {
  code: string
  name: string
  logo: string
}

export const countryToCurrencyMap: Record<string, string> = {
  AE: 'AED',
  AR: 'ARS',
  AU: 'AUD',
  BG: 'BGN',
  BR: 'BRL',
  CA: 'CAD',
  CH: 'CHF',
  CL: 'CLP',
  CO: 'COP',
  CZ: 'CZK',
  DK: 'DKK',
  DO: 'DOP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  ES: 'EUR',
  IE: 'EUR',
  AT: 'EUR',
  BE: 'EUR',
  GB: 'GBP',
  HK: 'HKD',
  HU: 'HUF',
  ID: 'IDR',
  IL: 'ILS',
  IN: 'INR',
  JP: 'JPY',
  KE: 'KES',
  KR: 'KRW',
  MX: 'MXN',
  MY: 'MYR',
  NG: 'NGN',
  NO: 'NOK',
  NZ: 'NZD',
  PE: 'PEN',
  PH: 'PHP',
  PL: 'PLN',
  RO: 'RON',
  SE: 'SEK',
  SG: 'SGD',
  TH: 'THB',
  TR: 'TRY',
  TW: 'TWD',
  US: 'USD',
  VN: 'VND',
  ZA: 'ZAR',
}

export default function SelectCurrencySheet({
  isVisible,
  onClose,
  onCurrencySelect,
  selectedCurrency,
}: SelectCurrencySheetProps) {
  const [searchedCurrency, setSearchedCurrency] = useState('')
  const { isLoading, data: data } = useOnramperAssets()
  const { fiatAssets = [] } = data ?? {}
  const searchInputRef = useRef<HTMLInputElement>(null)
  const currencyList = useMemo<CurrencyProps[] | []>(
    () =>
      fiatAssets.filter(
        (currency: CurrencyProps) =>
          currency.code.toLowerCase().includes(searchedCurrency) ||
          currency.name.toLowerCase().includes(searchedCurrency),
      ),
    [fiatAssets, searchedCurrency],
  )

  useEffect(() => {
    if (isVisible) {
      setSearchedCurrency('')
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 200)
    }
  }, [isVisible])

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
          ref={searchInputRef}
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
          {currencyList.length !== 0 &&
            currencyList.map((currency, index) => (
              <>
                <CurrencyCard
                  key={currency.code}
                  code={currency.code}
                  name={currency.name}
                  logo={currency.logo}
                  onClick={() => onCurrencySelect(currency.code)}
                  isSelected={currency.code === selectedCurrency}
                />
              </>
            ))}
        </div>
      )}
    </BottomModal>
  )
}
