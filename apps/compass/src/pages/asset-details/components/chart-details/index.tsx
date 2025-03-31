import {
  CompassDenomInfoParams,
  currencyDetail,
  formatPercentAmount,
  formatTokenAmount,
  getKeyToUseForDenoms,
  LeapWalletApi,
  Token,
  useActiveStakingDenom,
  useAssetDetails,
  useAssetSocials,
  useChainInfo,
  useFeatureFlags,
  useformatCurrency,
  useIsFeatureExistForChain,
  useLiquidStakingProviders,
  useSelectedNetwork,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom, SupportedChain, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import {
  CompassSeiEvmConfigStore,
  CompassSeiTokensAssociationStore,
  CompassTokenTagsStore,
  DenomsStore,
  MarketDataStore,
  RootDenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { ArrowLeft } from '@phosphor-icons/react'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import ClickableIcon from 'components/clickable-icons'
import ReadMoreText from 'components/read-more-text'
import ReceiveToken from 'components/Receive'
import { useHardCodedActions } from 'components/search-modal'
import Text from 'components/text'
import { EventName, PageName } from 'config/analytics'
import { differenceInDays } from 'date-fns'
import { useChainPageInfo } from 'hooks'
import { usePageView } from 'hooks/analytics/usePageView'
import useGetTopCGTokens from 'hooks/explore/useGetTopCGTokens'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { BuyIcon } from 'icons/buy-icon'
import { DollarIcon } from 'icons/dollar-icon'
import { SwapIcon } from 'icons/swap-icon'
import { UploadIcon } from 'icons/upload-icon'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import { DiscoverHeader } from 'pages/discover/components/discover-header'
import SelectChain from 'pages/home/SelectChain'
import { StakeInputPageState } from 'pages/stake-v2/StakeInputPage'
import useAssets from 'pages/swaps-v2/hooks/useAssets'
import React, { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router'
import { manageChainsStore } from 'stores/manage-chains-store'
import { AggregatedSupportedChain } from 'types/utility'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { capitalize } from 'utils/strings'

import ChartSkeleton from '../ChartSkeleton'
import { TokensChart } from '../token-chart'

type TokenDetailsProps = {
  denomsStore: DenomsStore
  rootDenomsStore: RootDenomsStore
  compassTokensAssociationsStore: CompassSeiTokensAssociationStore
  compassSeiEvmConfigStore: CompassSeiEvmConfigStore
  marketDataStore: MarketDataStore
  compassTokenTagsStore: CompassTokenTagsStore
}

const TokensDetails = observer(
  ({
    denomsStore,
    rootDenomsStore,
    compassTokensAssociationsStore,
    compassSeiEvmConfigStore,
    marketDataStore,
    compassTokenTagsStore,
  }: TokenDetailsProps) => {
    const assetType = undefined
    const chainInfos = useChainInfos()
    const _activeChain = useActiveChain()
    const { activeWallet } = useActiveWallet()
    const assetsId = useQuery().get('assetName') ?? undefined
    const tokenChain = useQuery().get('tokenChain') ?? undefined
    const pageSource = useQuery().get('pageSource') ?? undefined
    const navigate = useNavigate()
    const { data: cgTokens = [] } = useGetTopCGTokens()
    const { data: featureFlags } = useFeatureFlags()
    const marketData = marketDataStore.data

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

    const { headerChainImgSrc } = useChainPageInfo()

    const { data: addSkipAssets } = useAssets()

    const skipAssets = useMemo(() => {
      return addSkipAssets?.[chainInfos?.[activeChain]?.chainId ?? '']
    }, [activeChain, addSkipAssets, chainInfos])

    const cgToken = useMemo(() => {
      if (assetType === 'cg') {
        return cgTokens?.find((t: { id: string }) => t.id === assetsId)
      }
    }, [assetType, assetsId, cgTokens])

    const skipSupportsToken = useMemo(() => {
      return (
        skipAssets &&
        skipAssets?.length > 0 &&
        !!skipAssets?.find((skipAsset) => {
          const assetToFind = []
          if (assetsId) {
            assetToFind.push(assetsId)
          }
          if (portfolio?.coinMinimalDenom) {
            assetToFind.push(portfolio?.coinMinimalDenom)
          }
          if (portfolio?.ibcDenom) {
            assetToFind.push(portfolio?.ibcDenom)
          }
          return (
            assetToFind.includes(skipAsset.denom.replace(/(cw20:|erc20\/)/g, '')) ||
            (!!skipAsset.evmTokenContract &&
              assetToFind.includes(skipAsset.evmTokenContract.replace(/(cw20:|erc20\/)/g, '')))
          )
        })
      )
    }, [assetsId, portfolio?.coinMinimalDenom, portfolio?.ibcDenom, skipAssets])

    const [showChainSelector, setShowChainSelector] = useState(false)
    const [showSendToStakeModal, setShowSendToStakeModal] = useState(false)
    const [showReceiveSheet, setShowReceiveSheet] = useState(false)
    const [showStakeSelectSheet, setShowStakeSelectSheet] = useState(false)
    const [formatCurrency] = useformatCurrency()
    const { handleSwapClick } = useHardCodedActions()

    const seiEvmRpcUrl = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_EVM_RPC_URL
    const seiEvmChainId = String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID)
    const seiCosmosChainId = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_COSMOS_CHAIN_ID
    const compassEvmToSeiMapping = compassTokensAssociationsStore.compassEvmToSeiMapping
    const compassSeiToEvmMapping = compassTokensAssociationsStore.compassSeiToEvmMapping

    const isSwapDisabled = useMemo(() => {
      return !skipSupportsToken || featureFlags?.all_chains?.swap === 'disabled'
    }, [skipSupportsToken, featureFlags?.all_chains?.swap])

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
      tokenChain: (tokenChain ?? 'cosmos') as unknown as SupportedChain,
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

    const [preferredCurrency] = useUserPreferredCurrency()
    const { data: socials } = useAssetSocials(denomInfo?.coinGeckoId)
    const [websiteUrl, twitterUrl] = useMemo(() => {
      const website = socials?.find((item) => item.type === 'website')?.url
      const twitter = socials?.find((item) => item.type === 'twitter')?.url
      return [website, twitter]
    }, [socials])

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

    const { price, details, priceChange } = {
      price: info?.price ?? cgToken?.current_price ?? portfolio?.usdPrice,
      details: info?.details,
      priceChange: info?.priceChange ?? cgToken?.price_change_percentage_24h,
    }

    const { chartData, minMax } = chartsData ?? { chartData: undefined, minMax: undefined }
    const totalHoldingsInUsd = portfolio?.usdValue
    const filteredChartDays = ChartDays
    const displayChain = chainInfos[tokenChain as SupportedChain]?.chainName ?? tokenChain

    const dontShowSelectChain = useDontShowSelectChain(manageChainsStore)
    const defaultIconLogo = useDefaultTokenLogo()

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(() => {
      if ((_activeChain as AggregatedSupportedChain) === 'aggregated') {
        return 'mainnet'
      }

      return _activeNetwork
    }, [_activeNetwork, _activeChain])
    const [activeStakingDenom] = useActiveStakingDenom(
      rootDenomsStore.allDenoms,
      denomInfo.chain as SupportedChain,
      activeNetwork,
    )

    const isStakeComingSoon = useIsFeatureExistForChain({
      checkForExistenceType: 'comingSoon',
      feature: 'stake',
      platform: 'Extension',
      forceChain: portfolio.ibcDenom ? (portfolio.chain as SupportedChain) : activeChain,
      forceNetwork: activeNetwork,
    })

    const isStakeNotSupported = useIsFeatureExistForChain({
      checkForExistenceType: 'notSupported',
      feature: 'stake',
      platform: 'Extension',
      forceChain: portfolio.ibcDenom ? (portfolio.chain as SupportedChain) : activeChain,
      forceNetwork: activeNetwork,
    })
    const isStakeDisabled = useMemo(() => {
      return (
        isStakeComingSoon ||
        isStakeNotSupported ||
        !!chainInfos[activeChain].evmOnlyChain ||
        activeStakingDenom?.coinMinimalDenom !== portfolio?.coinMinimalDenom
      )
    }, [
      activeChain,
      activeStakingDenom?.coinMinimalDenom,
      chainInfos,
      isStakeComingSoon,
      isStakeNotSupported,
      portfolio?.coinMinimalDenom,
    ])
    const { data: lsProviders = {} } = useLiquidStakingProviders()
    const tokenLSProviders = lsProviders[activeStakingDenom?.coinDenom]

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

    const chain = useChainInfo(activeChain)

    const handleStakeClick = () => {
      navigate('/stake/input', {
        state: {
          mode: 'DELEGATE',
          forceChain: activeChain,
          forceNetwork: activeNetwork,
        } as StakeInputPageState,
      })
      mixpanel.track(EventName.PageView, {
        pageName: PageName.Stake,
        pageViewSource: PageName.AssetDetails,
        chainName: chain.chainName,
        chainId: chain.chainId,
        time: Date.now() / 1000,
      })
    }

    return (
      <div className='w-full overflow-auto panel-height overflow-y-scroll relative'>
        <DiscoverHeader />
        <div className={classNames('overflow-y-scroll h-[calc(100%-65px)]')}>
          <div className='flex justify-between items-center py-1.5 px-3'>
            <ArrowLeft
              size={48}
              className='p-3 text-muted-foreground cursor-pointer'
              onClick={() => navigate(-1)}
            />
            <Text className='text-[18px] font-bold !leading-6' color='text-monochrome'>
              {capitalize(
                portfolio?.symbol ?? denomInfo?.coinDenom ?? denomInfo?.name ?? cgToken?.symbol,
              )}
            </Text>
            <div className='w-12 h-12' />
          </div>

          <div className='flex flex-col items-center px-4 py-2 gap-3'>
            {(assetType !== 'cg' && !loadingPrice) || (assetType === 'cg' && cgToken) ? (
              <>
                <Text size='jumbo' color='text-monochrome' className='font-black !leading-[48px]'>
                  {price && new BigNumber(price).gt(0)
                    ? formatCurrency(new BigNumber(price), 5)
                    : '-'}
                </Text>
                {chartsLoading ? (
                  <Skeleton width={160} height={24} />
                ) : (
                  <div className='flex gap-2'>
                    <p className='bg-secondary-200 rounded-md px-2 font-bold text-base text-muted-foreground'>
                      {changeInPrice > 0 ? '+' : '-'}
                      {formatCurrency(new BigNumber(changeInPrice).abs(), 4)}
                    </p>
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
                  </div>
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
            {!chartsErrors && !errorInfo && (
              <>
                {chartsLoading ? (
                  <ChartSkeleton />
                ) : chartData && chartData.length > 0 ? (
                  <TokensChart
                    chainColor={'#0A84FF'}
                    chartData={chartData}
                    loadingCharts={chartsLoading}
                    price={price}
                    minMax={minMax}
                    key={selectedDays}
                    selectedDays={selectedDays}
                  />
                ) : null}
              </>
            )}

            {!chartsLoading && chartData && chartData.length > 0 && price && (
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

          <div className='flex gap-6 p-4 justify-center w-full'>
            <ClickableIcon label='Buy' icon={BuyIcon} onClick={() => navigate('/buy')} />
            <ClickableIcon
              label='Send'
              icon={UploadIcon}
              onClick={() => {
                navigate(
                  `/send?assetCoinDenom=${portfolio?.ibcDenom || denomInfo?.coinMinimalDenom}`,
                  {
                    state: location.state,
                  },
                )
              }}
            />
            <ClickableIcon
              label='Swap'
              icon={SwapIcon}
              onClick={() => {
                const denomKey = getKeyToUseForDenoms(
                  denomInfo?.coinMinimalDenom ?? '',
                  chainInfos[(denomInfo?.chain ?? '') as SupportedChain]?.chainId,
                )
                handleSwapClick(
                  `https://swapfast.app/?destinationChainId=${chainInfos[activeChain].chainId}&destinationAsset=${denomInfo?.coinMinimalDenom}`,
                  `/swap?destinationChainId=${chainInfos[activeChain].chainId}&destinationToken=${denomKey}&pageSource=assetDetails`,
                )
              }}
              disabled={isSwapDisabled}
            />
            <ClickableIcon
              label='Stake'
              icon={DollarIcon}
              onClick={() => {
                if (portfolio.ibcDenom) {
                  setShowSendToStakeModal(true)
                } else {
                  if (tokenLSProviders?.length > 0) {
                    setShowStakeSelectSheet(true)
                  } else {
                    handleStakeClick()
                  }
                }
              }}
              disabled={isStakeDisabled}
            />
          </div>

          <div className='p-4 flex flex-col gap-3'>
            <Text size='sm' color='text-muted-foreground' className='font-bold !leading-5'>
              Your Balance
            </Text>
            <div className='flex bg-secondary-100 rounded-2xl py-3 px-4 gap-3'>
              <img
                src={denomInfo?.icon ?? cgToken?.image ?? defaultIconLogo}
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
        <ReceiveToken
          isVisible={showReceiveSheet}
          chain={denomInfo?.chain as unknown as SupportedChain}
          tokenBalanceOnChain={portfolio?.tokenBalanceOnChain}
          onCloseHandler={() => {
            setShowReceiveSheet(false)
          }}
        />
        <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      </div>
    )
  },
)

export default TokensDetails
