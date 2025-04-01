import {
  CompassDenomInfoParams,
  formatPercentAmount,
  formatTokenAmount,
  Token,
  useActiveWallet,
  useAssetDetails,
  useformatCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import {
  CompassSeiEvmConfigStore,
  CompassSeiTokensAssociationStore,
  CompassTokenTagsStore,
  DenomsStore,
  MarketDataStore,
  RootDenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { ArrowLeft } from '@phosphor-icons/react'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import ReadMoreText from 'components/read-more-text'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { BuyIcon } from 'icons/buy-icon'
import CardIcon from 'icons/card-icon'
import { DollarIcon } from 'icons/dollar-icon'
import { SendIcon } from 'icons/send-icon'
import { SwapIcon } from 'icons/swap-icon'
import { UploadIcon } from 'icons/upload-icon'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { DiscoverHeader } from 'pages/discover/components/discover-header'
import React, { useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { capitalize, formatForSubstring } from 'utils/strings'

import { AssetCtas } from './components/asset-ctas'
import ChartSkeleton from './components/ChartSkeleton'
import { TokensChart } from './components/token-chart'

type TokenDetailsProps = {
  denomsStore: DenomsStore
  rootDenomsStore: RootDenomsStore
  compassTokensAssociationsStore: CompassSeiTokensAssociationStore
  compassSeiEvmConfigStore: CompassSeiEvmConfigStore
  marketDataStore: MarketDataStore
  compassTokenTagsStore: CompassTokenTagsStore
}

const AssetDetails = observer(
  ({
    rootDenomsStore,
    compassTokensAssociationsStore,
    compassSeiEvmConfigStore,
    marketDataStore,
    compassTokenTagsStore,
  }: TokenDetailsProps) => {
    const [assetsId, setAssetsId] = useState<string | undefined>()
    const chainInfos = useChainInfos()
    const _activeChain = useActiveChain()
    const queryAssetsId = useQuery().get('assetName') ?? undefined
    const pageSource = useQuery().get('pageSource') ?? undefined
    const navigate = useNavigate()
    const marketData = marketDataStore.data
    const activeWallet = useActiveWallet()
    const location = useLocation()
    const portfolio = useMemo(() => {
      const navigateAssetDetailsState = JSON.parse(
        sessionStorage.getItem('navigate-assetDetails-state') ?? 'null',
      )

      return (location?.state ?? navigateAssetDetailsState) as Token
    }, [location?.state])

    const activeChain = useMemo(() => {
      return portfolio?.tokenBalanceOnChain ?? _activeChain
    }, [_activeChain, portfolio?.tokenBalanceOnChain])

    useEffect(() => {
      if (queryAssetsId) {
        setAssetsId(queryAssetsId)
      }
    }, [queryAssetsId])

    const [formatCurrency] = useformatCurrency()

    const seiEvmRpcUrl = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_EVM_RPC_URL
    const seiEvmChainId = String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID)
    const seiCosmosChainId = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_COSMOS_CHAIN_ID
    const compassEvmToSeiMapping = compassTokensAssociationsStore.compassEvmToSeiMapping
    const compassSeiToEvmMapping = compassTokensAssociationsStore.compassSeiToEvmMapping

    const compassParams: CompassDenomInfoParams = useMemo(() => {
      return {
        isCompassWallet: true,
        compassEvmToSeiMapping,
        compassSeiToEvmMapping,
        seiEvmRpcUrl,
        seiEvmChainId,
        seiCosmosChainId,
      }
    }, [
      compassEvmToSeiMapping,
      compassSeiToEvmMapping,
      seiCosmosChainId,
      seiEvmChainId,
      seiEvmRpcUrl,
    ])

    const {
      info,
      ChartDays,
      chartData: data,
      loadingCharts,
      loadingPrice,
      errorCharts,
      errorInfo,
      setSelectedDays,
      selectedDays,
      denomInfo: _denomInfo,
    } = useAssetDetails({
      denoms: Object.assign(
        {},
        rootDenomsStore.allDenoms,
        compassTokenTagsStore.compassTokenDenomInfo,
      ),
      denom: assetsId as unknown as SupportedDenoms,
      tokenChain: activeChain,
      compassParams,
      marketData,
    })

    const denomInfo: NativeDenom = _denomInfo ?? {
      chain: portfolio?.chain ?? '',
      coinDenom: portfolio?.symbol ?? portfolio?.name ?? portfolio?.coinMinimalDenom ?? '',
      coinMinimalDenom: portfolio?.coinMinimalDenom ?? '',
      coinDecimals: portfolio?.coinDecimals ?? 6,
      icon: portfolio?.img ?? '',
      coinGeckoId: portfolio?.coinGeckoId ?? '',
    }
    usePageView(PageName.AssetDetails, {
      pageViewSource: pageSource,
      tokenName: denomInfo.coinDenom,
    })

    const { chartsData, chartsLoading, chartsErrors } = useMemo(() => {
      return { chartsData: data, chartsLoading: loadingCharts, chartsErrors: errorCharts }
    }, [data, errorCharts, loadingCharts])

    const { price, details, priceChange } = {
      price: info?.price ?? Number(portfolio?.usdPrice),
      details: info?.details,
      priceChange: info?.priceChange,
    }

    const { chartData, minMax } = chartsData ?? { chartData: undefined, minMax: undefined }
    const totalHoldingsInUsd = portfolio?.usdValue
    const filteredChartDays = ChartDays
    const defaultIconLogo = useDefaultTokenLogo()

    const percentChange = useMemo(() => {
      if (selectedDays === '1D' && !!priceChange) {
        return Number(priceChange)
      }
      if (chartData && chartData.length > 0) {
        const firstPrice = chartData[0].smoothedPrice
        const lastPrice = price
        const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100

        return percentChange
      }
    }, [chartData, price, priceChange, selectedDays])

    const changeInPrice = useMemo(() => {
      const olderPrice = new BigNumber(price ?? 0).dividedBy(1 + (percentChange ?? 0) / 100)

      return new BigNumber(price ?? 0).minus(olderPrice).toNumber()
    }, [price, percentChange])

    const handleBackClick = () => {
      navigate(-1)
    }

    const handleScroll = () => {
      const tooltip = document.getElementsByClassName('rdk-portal')[0]
      if (tooltip && !tooltip.classList.contains('hidden')) {
        tooltip.classList.add('hidden')
      }
    }

    return (
      <>
        <DiscoverHeader />
        <div
          className={classNames('overflow-y-scroll h-[calc(100%-140px)]')}
          onScroll={handleScroll}
        >
          <div className='flex justify-between items-center py-1.5 px-3'>
            <ArrowLeft
              size={48}
              className='p-3 text-muted-foreground hover:text-monochrome cursor-pointer'
              onClick={handleBackClick}
            />
            <Text className='text-[18px] font-bold !leading-6' color='text-monochrome'>
              {capitalize(portfolio?.symbol ?? denomInfo?.coinDenom ?? denomInfo?.name)}
            </Text>
            <div className='w-12 h-12' />
          </div>

          <div className='flex flex-col items-center px-4 py-2 gap-3'>
            {!loadingPrice ? (
              <>
                <Text size='jumbo' color='text-monochrome' className='font-black !leading-[48px]'>
                  {price && new BigNumber(price).gt(0)
                    ? '$' + formatForSubstring(price.toString())
                    : '-'}
                </Text>

                {chartsLoading ? (
                  <Skeleton width={160} height={24} />
                ) : (
                  <>
                    {percentChange ? (
                      <p
                        className={cn('rounded-md px-2 font-bold text-base', {
                          'bg-green-900 text-green-600': percentChange >= 0,
                          'bg-red-800 text-red-400': percentChange < 0,
                        })}
                      >
                        {percentChange > 0 ? '+' : ''}
                        {formatPercentAmount(new BigNumber(percentChange).toString(), 2)}%
                      </p>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <>
                <Skeleton width={200} height={48} />
                <Skeleton width={160} height={24} />
              </>
            )}
          </div>

          <div className='flex flex-col items-center'>
            {!chartsErrors && !errorInfo ? (
              <>
                {chartsLoading ? (
                  <ChartSkeleton />
                ) : chartData && chartData.length > 1 ? (
                  <TokensChart
                    chainColor={'#0A84FF'}
                    chartData={chartData}
                    loadingCharts={chartsLoading}
                    price={price}
                    minMax={minMax}
                    key={selectedDays}
                    selectedDays={selectedDays}
                  />
                ) : (
                  <div className='w-full py-10 px-20 flex flex-col items-center gap-3'>
                    <img src={Images.Misc.Dish} className='w-6 h-6' />
                    <Text size='sm' color='text-secondary-600' className='font-medium text-center'>
                      No data available to display trends. Please check back later.
                    </Text>
                  </div>
                )}
              </>
            ) : (
              <div className='w-full py-10 px-20 flex flex-col items-center gap-3'>
                <img src={Images.Misc.Dish} className='w-6 h-6' />
                <Text size='sm' color='text-secondary-600' className='font-medium text-center'>
                  No data available to display trends. Please check back later.
                </Text>
              </div>
            )}

            {!chartsLoading && chartData && chartData.length > 1 && price && (
              <div className='flex justify-between py-2 px-4 gap-x-2 overflow-scroll hide-scrollbar'>
                {Object.keys(filteredChartDays).map((val, index) => {
                  return (
                    <div
                      key={index}
                      className={classNames(
                        'rounded-[9px] py-1 px-3 text-xs !leading-5 hover:cursor-pointer font-bold',
                        {
                          'bg-secondary text-blue-400': val === selectedDays,
                          'text-secondary-600': val !== selectedDays,
                        },
                      )}
                      onClick={() => {
                        setSelectedDays(val)
                      }}
                    >
                      {val}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {!activeWallet?.watchWallet && <AssetCtas denomInfo={denomInfo} assetsId={assetsId} />}

          <div className='p-4 flex flex-col gap-3'>
            <Text size='sm' color='text-muted-foreground' className='font-bold !leading-5'>
              Your Balance
            </Text>
            <div className='flex bg-secondary-100 rounded-2xl py-3 px-4 gap-3'>
              <img
                src={denomInfo?.icon ?? defaultIconLogo}
                onError={imgOnError(defaultIconLogo)}
                className='w-10 h-10 rounded-full'
              />
              <div className='flex flex-col grow '>
                <Text size='md' color='text-monochrome' className='font-bold !leading-6'>
                  {denomInfo?.name}
                </Text>
                <Text size='xs' color='text-muted-foreground' className='font-medium !leading-4'>
                  {formatTokenAmount(portfolio?.amount?.toString() ?? '', denomInfo?.coinDenom, 5)}
                </Text>
              </div>
              <div className='flex flex-col items-end justify-between py-[1px]'>
                <Text size='sm' color='text-monochrome' className='font-bold !leading-5'>
                  {totalHoldingsInUsd ? formatCurrency(new BigNumber(totalHoldingsInUsd), 5) : '-'}
                </Text>
                {percentChange ? (
                  <p
                    className={cn('font-medium text-xs', {
                      'text-accent-success-200': percentChange >= 0,
                      'text-red-400': percentChange < 0,
                    })}
                  >
                    {percentChange > 0 ? '+' : ''}
                    {formatPercentAmount(new BigNumber(percentChange).toString(), 2)}%
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* details */}
          {!loadingPrice && details && (
            <div className='flex flex-col gap-y-2 p-4'>
              <Text size='sm' color='text-muted-foreground' className='font-bold !leading-5'>
                About {denomInfo?.name ?? capitalize(denomInfo?.chain)}
              </Text>
              <ReadMoreText
                textProps={{
                  size: 'sm',
                  className: 'font-medium flex flex-column',
                  color: 'text-secondary-800',
                }}
                readMoreColor='#696969'
              >
                {details}
              </ReadMoreText>
            </div>
          )}
        </div>
      </>
    )
  },
)

export default AssetDetails
