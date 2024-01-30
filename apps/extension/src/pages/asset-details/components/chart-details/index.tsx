import {
  currencyDetail,
  formatPercentAmount,
  formatTokenAmount,
  LeapWalletApi,
  sliceWord,
  Token,
  useAssetDetails,
  useFeatureFlags,
  useformatCurrency,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import ClickableIcon from 'components/clickable-icons'
import PopupLayout from 'components/layout/popup-layout'
import ReadMoreText from 'components/read-more-text'
import ReceiveToken from 'components/Receive'
import { useHardCodedActions } from 'components/search-modal'
import Text from 'components/text'
import { KADO_BUY_SUPPORT_CHAINS } from 'config/config'
import { differenceInDays } from 'date-fns'
import useGetTopCGTokens from 'hooks/explore/useGetTopCGTokens'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import React, { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { capitalize } from 'utils/strings'

import ChartSkeleton from '../chart-skeleton/ChartSkeleton'
import DefiList from '../defi-list'
import { TokensChart } from './token-chart'

type TokenCTAsProps = {
  isSwapDisabled: boolean
  onReceiveClick: () => void
  onSendClick: () => void
  onStakeClick: () => void
  onBuyClick: () => void
  isBuyDisabled: boolean
}

function TokenCTAs({
  onReceiveClick,
  onSendClick,
  onStakeClick,
  isSwapDisabled,
  isBuyDisabled,
  onBuyClick,
}: TokenCTAsProps) {
  return (
    <div className='flex w-full flex-row items-center justify-between gap-[16px] px-[16px]'>
      <ClickableIcon
        image={{ src: 'add', alt: 'Buy' }}
        disabled={isBuyDisabled}
        onClick={onBuyClick}
      />
      <ClickableIcon
        image={{
          src: 'download',
          alt: 'Deposit',
        }}
        onClick={onReceiveClick}
      />
      <ClickableIcon image={{ src: 'file_upload', alt: 'Send' }} onClick={onSendClick} />

      <ClickableIcon
        disabled={isSwapDisabled}
        image={{ src: 'swap_horiz', alt: 'Swap' }}
        onClick={onStakeClick}
      />
    </div>
  )
}

function TokensDetails() {
  const assetType = undefined
  const chainInfos = useChainInfos()
  const assetsId = useQuery().get('assetName') ?? undefined
  const tokenChain = useQuery().get('tokenChain') ?? undefined

  const navigate = useNavigate()
  const { data: cgTokens = [] } = useGetTopCGTokens()
  const { data: featureFlags } = useFeatureFlags()

  const cgToken = useMemo(() => {
    if (assetType === 'cg') {
      return cgTokens?.find((t: { id: string }) => t.id === assetsId)
    }
  }, [assetType, assetsId, cgTokens])

  const state = useLocation().state
  const portfolio: Token = state as Token
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showReceiveSheet, setShowReceiveSheet] = useState(false)

  const [formatCurrency] = useformatCurrency()
  const defaultTokenLogo = useDefaultTokenLogo()
  const { handleSwapClick } = useHardCodedActions()

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
    denomInfo,
    activeChain,
  } = useAssetDetails({
    denom: assetsId as unknown as SupportedDenoms,
    tokenChain: (tokenChain ?? 'cosmos') as unknown as SupportedChain,
  })

  const [preferredCurrency] = useUserPreferredCurrency()

  const {
    data: chartDataCGTokens,
    isLoading: loadingChartsCGTokens,
    error: errorChartsCGTokens,
  } = useReactQuery(
    ['chartData', cgToken?.id, selectedDays],
    async () => {
      if (selectedDays && cgToken?.id) {
        try {
          const date = new Date()
          date.setDate(1)
          date.setMonth(1)
          date.setFullYear(date.getFullYear())

          const YTD = differenceInDays(new Date(), date)

          const response = await LeapWalletApi.getMarketChart(
            cgToken?.id,
            /**
             * Please change 'cosmos' to '' once package update is done.
             */
            (denomInfo?.chain ?? 'cosmos') as SupportedChain,
            selectedDays === 'YTD' ? YTD : ChartDays[selectedDays],
            currencyDetail[preferredCurrency].currencyPointer,
          )

          if (response) {
            const { data, minMax } = response
            return { chartData: data, minMax }
          }
        } catch (e) {
          //   console.error({ error: e, selectedDays, tokenId: cgToken?.id })
          //
        }
      }
    },
    { enabled: !!cgToken?.id, retry: 2, staleTime: 0 * 60 * 1000, cacheTime: 5 * 60 * 1000 },
  )

  const { chartsData, chartsLoading, chartsErrors } = useMemo(() => {
    if (assetType === 'cg') {
      return {
        chartsData: chartDataCGTokens,
        chartsLoading: loadingChartsCGTokens,
        chartsErrors: errorChartsCGTokens,
      }
    }
    return { chartsData: data, chartsLoading: loadingCharts, chartsErrors: errorCharts }
  }, [
    assetType,
    chartDataCGTokens,
    data,
    errorCharts,
    errorChartsCGTokens,
    loadingCharts,
    loadingChartsCGTokens,
  ])

  const { price, details, priceChange } = info ?? {
    price: cgToken?.current_price ?? undefined,
    details: undefined,
    priceChange: cgToken?.price_change_percentage_24h ?? undefined,
    marketCap: cgToken?.market_cap ?? undefined,
  }

  const portfolioPercentChange = portfolio?.percentChange ?? priceChange

  const { chartData, minMax } = chartsData ?? { chartData: undefined, minMax: undefined }

  const totalHoldingsInUsd = portfolio.usdValue

  const filteredChartDays = ChartDays

  const displayChain = chainInfos[tokenChain as SupportedChain]?.chainName ?? tokenChain

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                navigate(-1)
              },
              type: HeaderActionType.BACK,
            }}
            imgSrc={chainInfos[activeChain].chainSymbolImageUrl ?? defaultTokenLogo}
            onImgClick={() => setShowChainSelector(true)}
            title={<Text size='lg'>Asset details</Text>}
            topColor={Colors.getChainColor(activeChain)}
          />
        }
        headerZIndex={showReceiveSheet ? 0 : 3}
      >
        <div className='flex flex-col gap-y-[32px] pl-[24px] pr-[24px] pt-[12px] mb-[24px] justify-center'>
          <div className='flex w-full flex-col items-start justify-start gap-[12px]  mb-5'>
            <div className='flex w-full flex-col items-start gap-[24px] rounded-[24px] border border-gray-100 bg-gray-50 py-[10px] shadow-[0px_7px_24px_0px_rgba(0,0,0,0.25)] dark:border-gray-900 dark:bg-gray-950'>
              <div className='flex w-full flex-row items-center justify-between px-[16px]'>
                <div className='flex flex-row items-center justify-start gap-[14px]'>
                  {(assetType !== 'cg' && !denomInfo) || (assetType === 'cg' && !cgToken) ? (
                    <Skeleton circle width={34} height={34} />
                  ) : (
                    <img
                      className='h-[34px] w-[34px] rounded-full'
                      src={denomInfo?.icon ?? cgToken?.image ?? Images.Logos.GenericDark}
                      onError={imgOnError(Images.Logos.GenericDark)}
                      alt={'token-info'}
                    />
                  )}
                  <div className='flex flex-col items-start justify-center'>
                    {(assetType !== 'cg' && !denomInfo) || (assetType === 'cg' && !cgToken) ? (
                      <>
                        <Skeleton width={70} />
                        <Skeleton width={50} />
                      </>
                    ) : (
                      <>
                        <div className='text-lg font-bold !leading-[28px] text-black-100 dark:text-white-100'>
                          {sliceWord(
                            portfolio?.symbol ??
                              denomInfo?.coinDenom ??
                              denomInfo?.name ??
                              cgToken?.symbol,
                            5,
                            4,
                          )}
                        </div>
                        <div className='text-xs font-medium !leading-[18px] text-gray-600 dark:text-gray-400'>
                          {displayChain ?? cgToken?.name}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className='flex flex-row items-center justify-end '>
                  <div className='flex flex-col items-end justify-center'>
                    {(assetType !== 'cg' && !loadingPrice) || (assetType === 'cg' && cgToken) ? (
                      <>
                        <div className='text-right text-lg font-bold !leading-[28px] text-black-100 dark:text-white-100'>
                          {price ? formatCurrency(new BigNumber(price)) : '-'}
                        </div>
                        <div className='flex gap-x-[5px]'>
                          {portfolioPercentChange && (
                            <div
                              className={classNames(
                                'text-right text-xs font-medium !leading-[18px]',
                                {
                                  'text-green-500 dark:text-green-500':
                                    !portfolioPercentChange || portfolioPercentChange >= 0,
                                  'text-red-600 dark:text-red-400':
                                    portfolioPercentChange && portfolioPercentChange < 0,
                                },
                              )}
                            >
                              {formatPercentAmount(
                                new BigNumber(portfolioPercentChange).toString(),
                                2,
                              )}
                              %
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <Skeleton width={70} />
                        <Skeleton width={50} />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className='gap-2 flex flex-col justify-center items-center'>
                <div className='flex w-full flex-col items-center justify-start gap-[24px]'>
                  {chartsLoading || !chartData || !price ? (
                    <>{!chartsErrors && !errorInfo && <ChartSkeleton className='!mt-0 px-3' />}</>
                  ) : (
                    <>
                      <div className='flex w-full max-w-full flex-col items-start justify-start gap-[24px] px-[16px]'>
                        {
                          <TokensChart
                            chainColor={
                              chainInfos[denomInfo?.chain as SupportedChain]?.theme?.primaryColor ??
                              '#70B7FF'
                            }
                            chartData={chartData}
                            loadingCharts={chartsLoading}
                            price={price}
                            minMax={minMax}
                            key={selectedDays}
                          />
                        }
                        {price && (
                          <div className='flex w-full max-w-full flex-row justify-around gap-[4px] rounded-full border border-gray-100 dark:border-gray-900'>
                            {Object.keys(filteredChartDays).map((val, index) => {
                              return (
                                <div
                                  key={index}
                                  className={classNames(
                                    'rounded-[24px] px-[12px] py-[8px] text-[10px] font-bold !leading-[17px] hover:cursor-pointer ',
                                    {
                                      'bg-gray-200 text-gray-950 dark:bg-gray-800 dark:text-gray-50':
                                        val === selectedDays,
                                      'text-gray-400 dark:text-gray-600': val !== selectedDays,
                                    },
                                  )}
                                  onClick={() => {
                                    setSelectedDays(val)
                                  }}
                                >
                                  <div
                                    className={`text-xs font-bold md:!text-xs ${
                                      val === selectedDays
                                        ? 'text-black-100 dark:text-white-100'
                                        : 'text-gray-400 dark:text-gray-600'
                                    }`}
                                  >
                                    {val}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className='flex w-full flex-row items-center justify-between px-[16px]'>
                  <div className='text-sm font-bold !leading-[24px] text-gray-500 dark:text-gray-500'>
                    Token Balance
                  </div>
                  <div className='flex flex-row gap-1 justify-center items-center'>
                    <div className='text-md font-bold !leading-[24px] text-black-100 dark:text-white-100'>
                      {totalHoldingsInUsd
                        ? formatCurrency(new BigNumber(totalHoldingsInUsd))
                        : 'NA'}
                    </div>
                    <div className='text-sm font-medium !leading-[16px] text-gray-500 dark:text-gray-500'>
                      {`(`}
                      {formatTokenAmount(portfolio?.amount?.toString() ?? '')}{' '}
                      {sliceWord(denomInfo?.coinDenom ?? portfolio?.symbol, 5, 4)}
                      {`)`}
                    </div>
                  </div>
                </div>

                <div className='opacity-0'>
                  <CardDivider />
                </div>

                <TokenCTAs
                  onBuyClick={() => {
                    window.open(`https://cosmos.leapwallet.io/transact/buy`, '_blank')
                  }}
                  isBuyDisabled={!KADO_BUY_SUPPORT_CHAINS.includes(activeChain)}
                  onSendClick={() => {
                    navigate('/send', { state })
                  }}
                  onReceiveClick={() => {
                    setShowReceiveSheet(true)
                  }}
                  isSwapDisabled={
                    !chainInfos[activeChain].nativeDenoms[portfolio?.coinMinimalDenom ?? ''] ||
                    featureFlags?.all_chains?.swap === 'disabled'
                  }
                  onStakeClick={() =>
                    handleSwapClick(
                      `https://cosmos.leapwallet.io/transact/swap?sourceChainId=${chainInfos[activeChain].chainId}&sourceAssetDenom=${denomInfo?.coinMinimalDenom}`,
                    )
                  }
                />
              </div>
            </div>

            <DefiList tokenName={denomInfo?.name ?? portfolio.symbol} />

            {!loadingPrice && details && (
              <div>
                <div className='rounded-[16px] py-[12px] mb-[16px] items-center'>
                  <Text
                    size='sm'
                    className='py-[4px] font-bold '
                    color='text-gray-600 dark:text-gray-200'
                  >
                    About {denomInfo?.name ?? capitalize(denomInfo?.chain)}
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
              </div>
            )}
          </div>
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

export default TokensDetails
