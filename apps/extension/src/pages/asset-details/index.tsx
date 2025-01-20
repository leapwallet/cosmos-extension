import {
  CompassDenomInfoParams,
  useAssetDetails,
  useformatCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import {
  ChainTagsStore,
  CompassSeiEvmConfigStore,
  CompassSeiTokensAssociationStore,
  DenomsStore,
  MarketDataStore,
} from '@leapwallet/cosmos-wallet-store'
import {
  Buttons,
  Header,
  HeaderActionType,
  LineDivider,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import { DownloadSimple, Eye, EyeSlash, UploadSimple } from '@phosphor-icons/react'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import Badge from 'components/badge/Badge'
import PopupLayout from 'components/layout/popup-layout'
import ReadMoreText from 'components/read-more-text'
import ReceiveToken from 'components/Receive'
import ChartSkeleton from 'components/Skeletons/ChartSkeleton'
import Text from 'components/text'
import { currencyDetail, useUserPreferredCurrency } from 'hooks/settings/useCurrency'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import React, { useEffect, useMemo, useState } from 'react'
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
import { hideAssetsStore } from 'stores/hide-assets-store'
import { Colors } from 'theme/colors'
import { Token } from 'types/bank'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { capitalize, formatTokenAmount, trim } from 'utils/strings'

const AssetDetails = observer(
  ({
    denomsStore,
    chainTagsStore,
    compassSeiEvmConfigStore,
    compassTokensAssociationsStore,
    marketDataStore,
  }: {
    denomsStore: DenomsStore
    chainTagsStore: ChainTagsStore
    compassSeiEvmConfigStore: CompassSeiEvmConfigStore
    compassTokensAssociationsStore: CompassSeiTokensAssociationStore
    marketDataStore: MarketDataStore
  }) => {
    const chainInfos = useChainInfos()
    const [formatCurrency] = useformatCurrency()
    const [preferenceCurrency] = useUserPreferredCurrency()
    const assetName =
      useQuery().get('assetName') ?? sessionStorage.getItem('asset-details-asset-name') ?? undefined
    const tokenChain =
      useQuery().get('tokenChain') ??
      sessionStorage.getItem('asset-details-token-chain') ??
      undefined

    useEffect(() => {
      assetName && sessionStorage.setItem('asset-details-asset-name', assetName)
      tokenChain && sessionStorage.setItem('asset-details-token-chain', tokenChain)
    }, [assetName, tokenChain])

    const navigate = useNavigate()
    const state = useLocation().state

    const defaultTokenLogo = useDefaultTokenLogo()

    const [showChainSelector, setShowChainSelector] = useState(false)
    const [showReceiveSheet, setShowReceiveSheet] = useState(false)

    const isDark = useTheme().theme === ThemeName.DARK
    const portfolio: Token = state as Token
    const formatter = Intl.NumberFormat('en', { notation: 'compact' })
    const marketData = marketDataStore.data

    const seiEvmRpcUrl = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_EVM_RPC_URL
    const seiEvmChainId = String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID)
    const seiCosmosChainId = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_COSMOS_CHAIN_ID
    const compassEvmToSeiMapping = compassTokensAssociationsStore.compassEvmToSeiMapping
    const compassSeiToEvmMapping = compassTokensAssociationsStore.compassSeiToEvmMapping

    const compassParams: CompassDenomInfoParams = useMemo(() => {
      if (!isCompassWallet()) {
        return {
          isCompassWallet: false,
        }
      }

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
      denomInfo,
    } = useAssetDetails({
      denoms: denomsStore.denoms,
      denom: assetName as unknown as SupportedDenoms,
      tokenChain: tokenChain as unknown as SupportedChain,
      compassParams,
      marketData: marketData,
    })

    const activeChainInfo = chainInfos[activeChain]

    const { price, details, priceChange, marketCap } = info ?? {
      price: undefined,
      details: undefined,
      priceChange: undefined,
      marketCap: undefined,
    }

    const { chartData, minMax } = data ?? { chartData: undefined, minMax: undefined }

    return (
      <div className='relative w-full overflow-clip panel-height'>
        <PopupLayout
          header={
            <Header
              action={{
                onClick: function noRefCheck() {
                  navigate(-1)
                },
                type: HeaderActionType.BACK,
              }}
              imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
              onImgClick={() => setShowChainSelector(true)}
              title={<Text size='lg'>Asset details</Text>}
            />
          }
          headerZIndex={3}
        >
          <div className='flex flex-col gap-y-[32px] pl-[28px] pr-[28px] mb-[32px] justify-center'>
            <div>
              <div className='flex flex-row pt-[24px] items-start'>
                <img
                  className='h-[48px] w-[48px] mr-[12px] p-[3px] dark:bg-white-30 bg-gray-200 rounded-full'
                  src={denomInfo?.icon ?? defaultTokenLogo}
                  onError={imgOnError(defaultTokenLogo)}
                />
                <div className='flex-col flex'>
                  <Text size='xxl' className='font-black'>
                    {denomInfo?.name ?? capitalize(denomInfo?.chain)}
                  </Text>
                  <div className='flex items-center'>
                    <Text size='sm' color='text-gray-400' className='font-medium'>
                      {trim(denomInfo?.coinDenom ?? '', 14)}
                    </Text>
                    {portfolio.ibcChainInfo ? (
                      <>
                        <div className='text-gray-400' style={{ margin: '0px 8px' }}>
                          |
                        </div>
                        <Badge
                          text={`${portfolio.ibcChainInfo.pretty_name} / ${portfolio.ibcChainInfo.channelId}`}
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {loadingCharts || !chartData || loadingPrice ? (
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
                          {marketCap ? (
                            <>
                              {currencyDetail[preferenceCurrency].symbol}
                              {formatter.format(marketCap)}
                            </>
                          ) : (
                            '-'
                          )}
                        </Text>
                      </div>
                    </div>
                    <LineDivider size='sm' />
                  </div>
                )}

                <>
                  {chartData?.length && !loadingCharts && price ? (
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
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  content={(data: any) => {
                                    let price = data?.value + minMax[0]?.price
                                    try {
                                      price = formatCurrency(new BigNumber(price))
                                    } catch (_) {
                                      //
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
                            chainInfos[denomInfo?.chain as SupportedChain]?.theme?.primaryColor ??
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
                    <>{price && chartData?.length ? <div className='h-[144px]' /> : null}</>
                  )}

                  {price && chartData?.length ? (
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
                  ) : null}
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
                  <DownloadSimple size={16} className='mr-2' />
                  <span>Receive</span>
                </div>
              </Buttons.Generic>
              <Buttons.Generic
                size='sm'
                color={isDark ? undefined : Colors.white100}
                onClick={() => {
                  navigate('/send', { state })
                }}
              >
                <div className={'flex justify-center text-black-100  items-center'}>
                  <UploadSimple size={16} className='mr-2' />
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
                  Token Balance
                </Text>
                <div>
                  <div
                    className={
                      'flex justify-center text-lg text-gray-600 dark:text-gray-200 items-center cursor-pointer'
                    }
                    onClick={() => hideAssetsStore.setHidden(!hideAssetsStore.isHidden)}
                  >
                    {hideAssetsStore.isHidden ? (
                      <Eye size={20} className='mr-2' />
                    ) : (
                      <EyeSlash size={20} className='mr-2' />
                    )}
                  </div>
                </div>
              </div>

              <div className='flex flex-col p-[4px]'>
                <Text size='xxl' className='font-black'>
                  {portfolio.usdValue === ''
                    ? hideAssetsStore.formatHideBalance(
                        formatTokenAmount(portfolio.amount, portfolio.symbol),
                      )
                    : hideAssetsStore.formatHideBalance(
                        formatCurrency(new BigNumber(portfolio.usdValue as string)),
                      )}
                </Text>

                {portfolio.usdValue !== '' && (
                  <div className='flex gap-x-[5px]'>
                    <Text size='sm' color='text-gray-400 font-bold'>
                      {hideAssetsStore.formatHideBalance(
                        formatTokenAmount(portfolio.amount, portfolio.symbol),
                      )}
                    </Text>
                  </div>
                )}
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
        </PopupLayout>
        <ReceiveToken
          isVisible={showReceiveSheet}
          chain={denomInfo?.chain as unknown as SupportedChain}
          onCloseHandler={() => {
            setShowReceiveSheet(false)
          }}
        />
        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
        />
      </div>
    )
  },
)

export default AssetDetails
