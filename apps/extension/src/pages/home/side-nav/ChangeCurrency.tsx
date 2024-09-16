import { CardDivider, GenericCard, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { CheckCircle } from '@phosphor-icons/react'
import classNames from 'classnames'
import NoSearchResults from 'components/no-search-results'
import { useChainPageInfo } from 'hooks'
import {
  currencyDetail,
  CurrencyMap,
  useCurrencyUpdater,
  useUserPreferredCurrency,
} from 'hooks/settings/useCurrency'
import { Images } from 'images'
import React from 'react'
import ReactCountryFlag from 'react-country-flag'
import { rootStore } from 'stores/root-store'
import { isSidePanel } from 'utils/isSidePanel'

const ChangeCurrency = ({ goBack }: { goBack: () => void }) => {
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
    <div className='pb-5 panel-width enclosing-panel '>
      <Header title='Currency' action={{ type: HeaderActionType.BACK, onClick: goBack }} />
      <div className='flex flex-col items-center px-[28px] h-full'>
        <div className='mx-auto mt-[28px] w-[344px] mb-[16px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
          <input
            placeholder='Search Currency'
            className='flex flex-grow text-base text-gray-400 outline-none bg-white-0'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length === 0 ? (
            <img src={Images.Misc.Search} />
          ) : (
            <img
              className='cursor-pointer'
              src={Images.Misc.CrossFilled}
              onClick={() => setSearchQuery('')}
            />
          )}
        </div>
        <div
          className={classNames('bg-white-100 dark:bg-gray-900 rounded-2xl min-h-fit w-fit', {
            ' max-h-[420px]': !isSidePanel(),
          })}
          style={{ overflowY: 'scroll' }}
        >
          {currencyData.length > 0 ? (
            currencyData.map((currency, index) => {
              const isFirst = index === 0
              const isLast = index === CurrencyMap.length - 1
              return (
                <div className='mx-auto w-full' key={index}>
                  <GenericCard
                    onClick={() => {
                      currencyUpdater(currency.country)
                      rootStore.setPreferredCurrency(currency.country)
                    }}
                    className='mx-auto'
                    img={
                      <ReactCountryFlag
                        countryCode={currency.country}
                        style={{
                          width: '2em',
                          height: '2em',
                        }}
                        title={currency.country}
                        svg
                      />
                    }
                    isRounded={isFirst || isLast}
                    size='md'
                    subtitle=''
                    title={<span className='ml-2'>{currency.name}</span>}
                    icon={
                      selectedCurrency.toString() === currency.country ? (
                        <CheckCircle
                          weight='fill'
                          size={24}
                          style={{ color: topChainColor }}
                          color={topChainColor}
                        />
                      ) : null
                    }
                  />
                  <CardDivider />
                </div>
              )
            })
          ) : (
            <NoSearchResults searchQuery={searchQuery} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ChangeCurrency
