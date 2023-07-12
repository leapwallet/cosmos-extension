import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { GenericCard, Header, HeaderActionType } from '@leapwallet/leap-ui'
import React from 'react'
import ReactCountryFlag from 'react-country-flag'

import CardDivider from '~/components/card-divider'
import NoSearchResults from '~/components/no-search-results'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import {
  CurrencyMap,
  useCurrencyUpdater,
  usePreferredCurrency,
} from '~/hooks/settings/use-currency'
import { Images } from '~/images'
import { Colors } from '~/theme/colors'

type Props = {
  goBack: () => void
}

const ChangeCurrency: React.FC<Props> = ({ goBack }) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCurrency] = usePreferredCurrency()
  const activeChain = useActiveChain()
  const currencyUpdater = useCurrencyUpdater()

  const currencyData =
    searchQuery === ''
      ? CurrencyMap
      : CurrencyMap.filter((currency) =>
          currency.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )

  return (
    <div className='h-full'>
      <Header
        topColor={Colors.getChainColor(activeChain)}
        title='Currency'
        action={{ type: HeaderActionType.BACK, onClick: goBack }}
      />
      <div className='px-7 overflow-y-auto relative' style={{ height: 'calc(100% - 72px)' }}>
        <div className='mx-auto mt-7 w-full mb-4 flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
          <input
            placeholder='Search Currency'
            className='flex flex-grow text-base text-gray-400 outline-none bg-white-0'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length === 0 ? (
            <img src={Images.Misc.SearchIcon} />
          ) : (
            <img
              className='cursor-pointer'
              src={Images.Misc.CrossFilled}
              onClick={() => setSearchQuery('')}
            />
          )}
        </div>
        <div className='mb-7 bg-white-100 dark:bg-gray-900 rounded-2xl min-h-fit w-full overflow-y-auto'>
          {currencyData.length > 0 ? (
            currencyData.map((currency, index) => {
              const isFirst = index === 0
              const isLast = index === CurrencyMap.length - 1

              return (
                <div className='mx-auto w-full' key={index}>
                  <GenericCard
                    onClick={() => {
                      currencyUpdater(currency.country)
                      goBack()
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
                        <span
                          className='material-icons-round'
                          style={{ color: ChainInfos[activeChain].theme.primaryColor }}
                          color={ChainInfos[activeChain].theme.primaryColor}
                        >
                          check_circle
                        </span>
                      ) : null
                    }
                  />
                  {!isLast && <CardDivider />}
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
