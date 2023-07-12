import { SupportedCurrencies, useAssetDetails } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, SupportedChain, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import {
  Buttons,
  Header,
  HeaderActionType,
  LineDivider,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  ChartTooltip,
  Gridline,
  GridlineSeries,
  LinearAxisLine,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearYAxis,
  LinearYAxisTickSeries,
  LineChart,
  LineSeries,
  MarkLine,
  TooltipArea,
} from 'reaviz'
import { Colors } from 'theme/colors'
import { Token } from 'types/bank'

import Badge from '~/components/badge'
import PopupLayout from '~/components/popup-layout'
import ReadMoreText from '~/components/read-more-text'
import ReceiveToken from '~/components/receive-token'
import SelectChain from '~/components/select-chain'
import { ChartSkeleton } from '~/components/skeletons'
import Text from '~/components/text'
import {
  currencyDetail,
  useFormatCurrency,
  usePreferredCurrency,
} from '~/hooks/settings/use-currency'
import {
  useHideSmallBalances,
  useSetHideSmallBalances,
} from '~/hooks/settings/use-hide-small-balances'
import useQueryParams from '~/hooks/use-query-params'
import { ChainLogos } from '~/images/logos'
import { capitalize, formatTokenAmount } from '~/util/strings'

import AssetActivity from './widgets/asset-activity'

export default function AssetDetails() {
  const formatCurrency = useFormatCurrency()
  const preferredCurrency = usePreferredCurrency()
  const assetName = useQueryParams().get('assetName') ?? undefined
  const tokenChain = useQueryParams().get('tokenChain') ?? undefined
  const navigate = useNavigate()
  const state = useLocation().state

  const balancesHidden = useHideSmallBalances()
  const setBalancesVisibility = useSetHideSmallBalances()

  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showReceiveSheet, setShowReceiveSheet] = useState(false)

  const isDark = useTheme().theme === ThemeName.DARK

  const portfolio: Token = state as Token
  const portfolioPercentChange = portfolio.percentChange
    ? `${portfolio.percentChange.toFixed(2)}%`
    : ''

  const formatter = Intl.NumberFormat('en', { notation: 'compact' })

  const {
    activeChain,
    info,
    ChartDays,
    chartData: data,
    loadingCharts,
    loadingPrice,
    errorCharts,
    errorInfo,
    setSelectedDays,
    selectedDays,
    activityList,
    isActivityLoading,
    denomInfo,
  } = useAssetDetails({
    denom: assetName as unknown as SupportedDenoms,
    tokenChain: tokenChain as unknown as SupportedChain,
  })

  const { price, details, priceChange, marketCap } = info ?? {
    price: undefined,
    details: undefined,
    priceChange: undefined,
    marketCap: undefined,
  }

  const { chartData, minMax } = data ?? { chartData: undefined, minMax: undefined }

  return (
    <div className='relative w-full overflow-clip'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                navigate(-1)
              },
              type: HeaderActionType.BACK,
            }}
            imgSrc={ChainLogos[activeChain]}
            onImgClick={function noRefCheck() {
              setShowChainSelector(true)
            }}
            title={<Text size='lg'>Asset details</Text>}
            topColor={ChainInfos[activeChain].theme.primaryColor}
          />
        }
      >
        <div className='flex flex-col gap-y-[32px] pl-[28px] pr-[28px] mb-[32px] justify-center'>
          <div>
            <div className='flex flex-row pt-[24px] items-center'>
              <img
                className='h-[48px] w-[48px] mr-[12px] p-[3px] dark:bg-white-30 bg-gray-200 rounded-full'
                src={denomInfo?.icon}
              />
              <div className='flex-col flex'>
                <Text size='xxl' className='font-black'>
                  {capitalize(denomInfo?.chain)}
                </Text>
                <div className='flex items-center'>
                  <Text size='sm' color='text-gray-400' className='font-medium'>
                    {denomInfo?.coinDenom}
                  </Text>
                  {portfolio.ibcChainInfo ? (
                    <>
                      <div className='text-gray-400' style={{ margin: '0px 8px' }}>
                        |
                      </div>
                      <Badge
                        image={portfolio.ibcChainInfo.icon}
                        text={`${portfolio.ibcChainInfo.pretty_name} / ${portfolio.ibcChainInfo.channelId}`}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          {loadingCharts || !chartData || !price ? (
            <>{!errorCharts && !errorInfo && <ChartSkeleton />}</>
          ) : (
            <>
              {!loadingPrice && price && priceChange && (
                <div>
                  <LineDivider size='sm' />
                  <div className='flex flex-row mt-[16px] mb-[16px] justify-around'>
                    <div className='flex flex-col'>
                      <Text size='sm' color='text-gray-400 font-medium'>
                        Price
                      </Text>
                      <Text size='xl' className='font-extrabold'>
                        {formatCurrency(new BigNumber(price))}
                      </Text>
                    </div>
                    <div className='flex flex-col'>
                      <Text size='sm' color='text-gray-400 font-medium'>
                        Past 1 day
                      </Text>
                      <Text
                        size='xl'
                        color='font-extrabold'
                        className={classNames('font-extrabold', {
                          'text-green-600': priceChange >= 0,
                          'text-red-300': priceChange < 0,
                        })}
                      >
                        {priceChange?.toFixed(2)}%
                      </Text>
                    </div>
                    <div className='flex flex-col'>
                      <Text size='sm' color='text-gray-400 font-medium'>
                        Market cap
                      </Text>
                      <Text size='xl' className='font-extrabold'>
                        {currencyDetail[preferredCurrency as SupportedCurrencies].symbol}
                        {formatter.format(marketCap)}
                      </Text>
                    </div>
                  </div>
                  <LineDivider size='sm' />
                </div>
              )}
              <>
                {chartData && !loadingCharts && price ? (
                  <LineChart
                    height={144}
                    width={344}
                    xAxis={
                      <LinearXAxis
                        tickSeries={<LinearXAxisTickSeries tickSize={0} />}
                        axisLine={<LinearAxisLine strokeWidth={0} />}
                      />
                    }
                    yAxis={
                      <LinearYAxis
                        tickSeries={<LinearYAxisTickSeries tickSize={0} />}
                        axisLine={<LinearAxisLine strokeWidth={0} />}
                      />
                    }
                    series={
                      <LineSeries
                        markLine={<MarkLine strokeColor={Colors.gray400} />}
                        tooltip={
                          <TooltipArea
                            tooltip={
                              <ChartTooltip
                                followCursor={true}
                                placement='auto'
                                modifiers={{
                                  offset: '5px, 5px',
                                }}
                                content={(data: { value: number; metadata: string }) => {
                                  let price: string
                                  try {
                                    price = formatCurrency(
                                      new BigNumber(data.value + minMax[0].price),
                                    )
                                  } catch (_) {
                                    price = '-'
                                  }
                                  return (
                                    <>
                                      <Text size='xs' className='font-bold'>
                                        {price}
                                      </Text>
                                      <Text size='xs' color='text-gray-400 font-semibold'>
                                        {data.metadata}
                                      </Text>
                                    </>
                                  )
                                }}
                              />
                            }
                          />
                        }
                        colorScheme={() =>
                          ChainInfos[denomInfo?.chain as SupportedChain]?.theme?.primaryColor ??
                          '#70B7FF'
                        }
                        interpolation={'smooth'}
                      />
                    }
                    gridlines={<GridlineSeries line={<Gridline strokeWidth={0} />} />}
                    data={chartData.map((val, index) => {
                      return {
                        data: val.price,
                        key: index,
                        metadata: val.date,
                      }
                    })}
                  />
                ) : (
                  <>{price && <div className='h-[144px]' />}</>
                )}
                {price && (
                  <div className='flex flex-row gap-x-[12px]  justify-around'>
                    {Object.keys(ChartDays).map((val, index) => {
                      return (
                        <div
                          key={index}
                          className={classNames(
                            'p-[5px] hover:cursor-pointer px-[8px] rounded-md ',
                            {
                              'bg-gray-200 dark:bg-gray-800': val === selectedDays,
                            },
                          )}
                          onClick={() => {
                            setSelectedDays(val)
                          }}
                        >
                          <Text size='sm'>{val}</Text>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            </>
          )}
          <div className='flex justify-between'>
            <Buttons.Generic
              size='sm'
              color={isDark ? undefined : Colors.white100}
              onClick={() => {
                setShowReceiveSheet(true)
              }}
            >
              <div className={'flex justify-center text-black-100  items-center'}>
                <span className='mr-2 material-icons-round'>download</span>
                <span>Receive</span>
              </div>
            </Buttons.Generic>
            <Buttons.Generic
              size='sm'
              color={isDark ? undefined : Colors.white100}
              onClick={() => {
                navigate('/send')
              }}
            >
              <div className={'flex justify-center text-black-100  items-center'}>
                <span className='mr-2 material-icons-round'>file_upload</span>
                <span>Send</span>
              </div>
            </Buttons.Generic>
          </div>

          <div className=' bg-white-100 dark:bg-gray-900 rounded-[16px] p-[12px] items-center'>
            <div className='flex justify-between'>
              <Text
                size='xs'
                className='p-[4px] font-bold'
                color='text-gray-600 dark:text-gray-200'
              >
                Your {capitalize(denomInfo?.chain)} Portfolio
              </Text>
              <div>
                <div
                  className={
                    'flex justify-center text-lg text-gray-600 dark:text-gray-200 items-center cursor-pointer'
                  }
                  onClick={() => setBalancesVisibility(!balancesHidden)}
                >
                  <span className='mr-2 text-lg material-icons-round'>
                    {balancesHidden ? 'visibility' : 'visibility_off'}
                  </span>
                  <span className='text-sm'>{balancesHidden ? 'Show' : 'Hide'}</span>
                </div>
              </div>
            </div>
            <div className='flex flex-col p-[4px]'>
              <Text size='xxl' className='font-black'>
                {balancesHidden ? '••••••••' : formatCurrency(new BigNumber(portfolio.usdValue))}
              </Text>
              <div className='flex gap-x-[5px]'>
                <Text size='sm' color='text-gray-400 font-bold'>
                  {balancesHidden
                    ? '••••••••'
                    : formatTokenAmount(portfolio.amount, portfolio.symbol)}
                </Text>
                {portfolioPercentChange && (
                  <Text
                    size='sm'
                    color='font-bold'
                    className={classNames({
                      'text-green-600': portfolio.percentChange >= 0,
                      'text-red-300': portfolio.percentChange < 0,
                    })}
                  >
                    {' | '} {balancesHidden ? '••••••••' : portfolioPercentChange}
                  </Text>
                )}
              </div>
            </div>
          </div>
          {!loadingPrice && details && (
            <div>
              <LineDivider size='sm' />
              <div className='rounded-[16px] py-[12px] my-[16px] items-center'>
                <Text
                  size='sm'
                  className='py-[4px] font-bold '
                  color='text-gray-600 dark:text-gray-200'
                >
                  About {capitalize(denomInfo?.chain)}
                </Text>
                <div className='flex flex-col pt-[4px]'>
                  <ReadMoreText
                    textProps={{ size: 'md', className: 'font-medium  flex flex-column' }}
                    readMoreColor={Colors.getChainColor(denomInfo?.chain as SupportedChain)}
                  >
                    {details}
                  </ReadMoreText>
                </div>
              </div>
              <LineDivider size='sm' />
            </div>
          )}
          <AssetActivity activityList={activityList} isActivityLoading={isActivityLoading} />
        </div>
      </PopupLayout>
      <ReceiveToken
        isVisible={showReceiveSheet}
        chain={denomInfo?.chain as unknown as SupportedChain}
        onCloseHandler={() => {
          setShowReceiveSheet(false)
        }}
      />
      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
    </div>
  )
}
