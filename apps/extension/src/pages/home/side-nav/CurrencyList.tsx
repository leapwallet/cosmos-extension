import { CheckCircle } from '@phosphor-icons/react'
import NoSearchResults from 'components/no-search-results'
import { SearchInput } from 'components/ui/input/search-input'
import { useChainPageInfo } from 'hooks'
import {
  currencyDetail,
  CurrencyMap,
  useCurrencyUpdater,
  useUserPreferredCurrency,
} from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React from 'react'
import ReactCountryFlag from 'react-country-flag'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { rootStore } from 'stores/root-store'

export const CurrencyList = observer(({ onClose }: { onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCurrency] = useUserPreferredCurrency()
  const { topChainColor } = useChainPageInfo()
  const [currencyUpdater] = useCurrencyUpdater()

  const currencyData =
    searchQuery === ''
      ? CurrencyMap
      : CurrencyMap.filter(
          (currency) =>
            currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            currency.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
            currencyDetail[currency.country].ISOname.toLowerCase().includes(
              searchQuery.toLowerCase(),
            ),
        )

  return (
    <div className='flex flex-col gap-7 items-center h-full'>
      <SearchInput
        onClear={() => setSearchQuery('')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder='Search Currency'
        className='w-full'
      />

      <div className='flex flex-col gap-4 w-full pb-4'>
        {currencyData.length > 0 ? (
          currencyData.map((currency) => {
            return (
              <button
                key={currency.country}
                className='flex items-center gap-3 py-3 px-4 w-full rounded-xl bg-secondary-100 hover:bg-secondary-200 transition-colors'
                onClick={() => {
                  currencyUpdater(currency.country)
                  rootStore.setPreferredCurrency(selectedCurrency, currency.country)
                  onClose()
                  globalSheetsStore.setSideNavOpen(false)
                }}
              >
                <ReactCountryFlag
                  svg
                  countryCode={currency.country}
                  title={currency.country}
                  style={{ width: '32px', height: '32px' }}
                />

                <span className='mr-auto font-bold'>{currency.name}</span>

                {selectedCurrency.toString() === currency.country ? (
                  <CheckCircle className='text-accent-foreground' weight='fill' size={24} />
                ) : null}
              </button>
            )
          })
        ) : (
          <NoSearchResults searchQuery={searchQuery} />
        )}
      </div>
    </div>
  )
})
