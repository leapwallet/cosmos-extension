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
import {
  ChainInfos,
  NativeDenom,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  ChainTagsStore,
  CompassSeiEvmConfigStore,
  CompassSeiTokensAssociationStore,
  CompassTokenTagsStore,
  DenomsStore,
  MarketDataStore,
  RootDenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import {
  ArrowDown,
  ArrowsLeftRight,
  ArrowUp,
  CurrencyCircleDollar,
  Globe,
  XLogo,
} from '@phosphor-icons/react'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import ReadMoreText from 'components/read-more-text'
import ReceiveToken from 'components/Receive'
import { useHardCodedActions } from 'components/search-modal'
import Text from 'components/text'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
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
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import StakeSelectSheet from 'pages/stake-v2/components/StakeSelectSheet'
import { StakeInputPageState } from 'pages/stake-v2/StakeInputPage'
import useAssets from 'pages/swaps-v2/hooks/useAssets'
import React, { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router'
import { manageChainsStore } from 'stores/manage-chains-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { capitalize } from 'utils/strings'

import ChartSkeleton from '../chart-skeleton/ChartSkeleton'
import SendToStakeModal from './SendToStakeModal'
import { TokensChart } from './token-chart'

type TokenDetailsProps = {
  denomsStore: DenomsStore
  rootDenomsStore: RootDenomsStore
  chainTagsStore: ChainTagsStore
  compassTokensAssociationsStore: CompassSeiTokensAssociationStore
  compassSeiEvmConfigStore: CompassSeiEvmConfigStore
  marketDataStore: MarketDataStore
  compassTokenTagsStore: CompassTokenTagsStore
}

const TokensDetails = observer(
  ({
    denomsStore,
    rootDenomsStore,
    chainTagsStore,
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
      const assetToFind: string[] = []
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
        skipAssets &&
        skipAssets?.length > 0 &&
        !!skipAssets?.find((skipAsset) => {
          if (skipAsset.denom === 'ethereum-native') {
            return assetToFind.includes('wei')
          }
          return (
            assetToFind.includes(skipAsset.denom.replace(/(cw20:|erc20\/)/g, '')) ||
            assetToFind.includes(skipAsset.denom.replace(/(cw20:|erc20\/)/g, '').toLowerCase()) ||
            (!!skipAsset.evmTokenContract &&
              (assetToFind.includes(skipAsset.evmTokenContract.replace(/(cw20:|erc20\/)/g, '')) ||
                assetToFind.includes(
                  skipAsset.evmTokenContract.replace(/(cw20:|erc20\/)/g, '').toLowerCase(),
                )))
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
    const assetImg = denomInfo?.icon ?? cgToken?.image
    usePageView(PageName.AssetDetails, true, {
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
    const displayChain =
      chainInfos[portfolio?.tokenBalanceOnChain as SupportedChain]?.chainName ??
      portfolio?.tokenBalanceOnChain ??
      chainInfos[tokenChain as SupportedChain]?.chainName ??
      tokenChain

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
        activeStakingDenom?.coinMinimalDenom !== portfolio?.coinMinimalDenom ||
        (!!portfolio?.ibcDenom && isCompassWallet())
      )
    }, [
      activeChain,
      activeStakingDenom?.coinMinimalDenom,
      chainInfos,
      isStakeComingSoon,
      isStakeNotSupported,
      portfolio?.coinMinimalDenom,
      portfolio?.ibcDenom,
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
              imgSrc={headerChainImgSrc}
              onImgClick={dontShowSelectChain ? undefined : () => setShowChainSelector(true)}
              title={
                <Text size='lg'>
                  {capitalize(
                    portfolio?.symbol ?? denomInfo?.coinDenom ?? denomInfo?.name ?? cgToken?.symbol,
                  )}
                </Text>
              }
            />
          }
          headerZIndex={showReceiveSheet ? 0 : 3}
        >
          <div
            className={classNames('overflow-y-scroll h-[calc(100%-72px)] relative', {
              'h-[calc(100%-72px-36px)]': activeWallet?.watchWallet,
            })}
          >
            {/* chart */}
            <div className='flex flex-col items-center p-6'>
              {(assetType !== 'cg' && !loadingPrice) || (assetType === 'cg' && cgToken) ? (
                <>
                  <Text size='xxl' color='text-black-100 dark:text-white-100' className='font-bold'>
                    {price && new BigNumber(price).gt(0)
                      ? formatCurrency(new BigNumber(price), 5)
                      : '-'}
                  </Text>
                  {chartsLoading ? (
                    <Skeleton width={80} containerClassName='h-4' />
                  ) : (
                    !!percentChange && (
                      <div
                        className={classNames('text-xs font-bold ', {
                          'text-green-600 dark:text-green-600':
                            !percentChange || percentChange >= 0,
                          'text-red-600 dark:text-red-400': percentChange && percentChange < 0,
                        })}
                      >
                        {`${changeInPrice > 0 ? '+' : '-'}${formatCurrency(
                          new BigNumber(changeInPrice).abs(),
                          2,
                        )} (${formatPercentAmount(new BigNumber(percentChange).toString(), 2)}%)`}
                      </div>
                    )
                  )}
                </>
              ) : (
                <>
                  <Skeleton width={90} height={36} />
                  <Skeleton width={80} />
                </>
              )}
            </div>

            <div className='flex flex-col gap-y-5 items-center'>
              {!chartsErrors && !errorInfo && (
                <>
                  {chartsLoading ? (
                    <ChartSkeleton />
                  ) : chartData && chartData.length > 0 ? (
                    <TokensChart
                      chainColor={'#70B7FF'}
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
                <div className='flex justify-between gap-x-2 overflow-scroll hide-scrollbar'>
                  {Object.keys(filteredChartDays).map((val, index) => {
                    return (
                      <div
                        key={index}
                        className={classNames(
                          'rounded-2xl py-1.5 px-4 text-xs hover:cursor-pointer ',
                          {
                            'bg-gray-100 text-black-100 dark:bg-gray-900 dark:text-white-100 font-bold':
                              val === selectedDays,
                            'text-gray-700 dark:text-gray-400 font-medium': val !== selectedDays,
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

            <div className='flex flex-col gap-y-7 p-6'>
              <div className='flex flex-col gap-y-3'>
                <Text size='sm' color='text-gray-600 dark:text-gray-400' className='font-bold'>
                  Your Balance
                </Text>
                <div className='flex flex-col dark:bg-gray-950 bg-gray-100 rounded-lg p-4 gap-y-4 border dark:border-gray-850 border-gray-100'>
                  <div className='flex gap-x-2 items-center'>
                    <div className='relative w-[50px] h-[40px] flex items-center justify-center'>
                      <TokenImageWithFallback
                        assetImg={assetImg}
                        text={denomInfo?.coinDenom}
                        altText={denomInfo?.coinDenom}
                        imageClassName='w-[30px] h-[30px] rounded-full shrink-0'
                        containerClassName='w-[30px] h-[30px] rounded-full shrink-0 !bg-gray-200 dark:!bg-gray-800'
                        textClassName='text-[8.34px] !leading-[11px]'
                      />
                      <img
                        src={
                          chainInfos[denomInfo?.chain as SupportedChain]?.chainSymbolImageUrl ??
                          ChainInfos[denomInfo?.chain as SupportedChain]?.chainSymbolImageUrl
                        }
                        onError={imgOnError(defaultIconLogo)}
                        className='w-[15px] h-[15px] absolute bottom-[3px] right-[3px] rounded-full bg-white-100 dark:bg-black-100'
                      />
                    </div>
                    <div className='flex flex-row items-center justify-between w-full'>
                      <div className='flex flex-col items-start'>
                        <div className='flex items-center gap-x-1.5'>
                          <Text
                            size='md'
                            color='text-black-100 dark:text-white-100'
                            className='font-bold'
                          >
                            {denomInfo?.name}
                          </Text>
                          {portfolio?.ibcDenom ? (
                            <Text
                              size='xs'
                              color='text-gray-800 dark:text-gray-200'
                              className='font-medium p-1 rounded-[4px] dark:bg-gray-850 bg-gray-200 !leading-[10px]'
                            >
                              IBC
                            </Text>
                          ) : null}
                        </div>
                        <Text size='xs' color='text-gray-600 dark:text-gray-400'>
                          {displayChain ?? cgToken?.name}
                        </Text>
                      </div>
                      <div className='flex flex-col items-end gap-y-1'>
                        <Text
                          size='md'
                          color='text-black-100 dark:text-white-100'
                          className='font-bold'
                        >
                          {totalHoldingsInUsd
                            ? formatCurrency(new BigNumber(totalHoldingsInUsd), 5)
                            : '-'}
                        </Text>
                        <Text
                          size='xs'
                          color='text-gray-600 dark:text-gray-400'
                          className='font-medium'
                        >
                          {formatTokenAmount(
                            portfolio?.amount?.toString() ?? '',
                            denomInfo?.coinDenom,
                            5,
                          )}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className='h-[1px] w-full dark:bg-gray-850 bg-gray-200' />
                  <div className='flex flex-row h-[56px] p-1 gap-x-2'>
                    <button
                      onClick={() => {
                        navigate(
                          `/send?assetCoinDenom=${
                            portfolio?.ibcDenom || denomInfo?.coinMinimalDenom
                          }`,
                          {
                            state: location.state,
                          },
                        )
                      }}
                      className='flex flex-row gap-x-2 items-center justify-center h-full w-full p-3 bg-gray-200 dark:bg-gray-800 rounded-full'
                    >
                      <ArrowUp size={20} className='text-black-100 dark:text-white-100' />
                      <Text
                        size='xs'
                        color='text-black-100 dark:text-white-100'
                        className='font-bold'
                      >
                        Send
                      </Text>
                    </button>
                    <button
                      onClick={() => {
                        setShowReceiveSheet(true)
                      }}
                      className='flex flex-row gap-x-2 items-center justify-center h-full w-full p-3 bg-gray-200 dark:bg-gray-800 rounded-full'
                    >
                      <ArrowDown size={20} className='text-black-100 dark:text-white-100' />
                      <Text
                        size='xs'
                        color='text-black-100 dark:text-white-100'
                        className='font-bold'
                      >
                        Receive
                      </Text>
                    </button>
                    <button
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
                      className={classNames(
                        'flex flex-row gap-x-2 items-center justify-center h-full w-full p-3 bg-gray-200 dark:bg-gray-800 rounded-full',
                        {
                          'opacity-40 cursor-no-drop': isStakeDisabled,
                        },
                      )}
                    >
                      <CurrencyCircleDollar
                        size={20}
                        className='text-black-100 dark:text-white-100'
                      />
                      <Text
                        size='xs'
                        color='text-black-100 dark:text-white-100'
                        className='font-bold'
                      >
                        Stake
                      </Text>
                    </button>
                  </div>
                </div>
              </div>

              {/* details */}
              {!loadingPrice && details && (
                <div className='flex flex-col gap-y-2'>
                  <Text size='sm' color='text-gray-600 dark:text-gray-400'>
                    About {denomInfo?.name ?? capitalize(denomInfo?.chain)}
                  </Text>
                  <ReadMoreText
                    textProps={{ size: 'sm', className: 'font-medium  flex flex-column' }}
                    readMoreColor={'#70B7FF'}
                  >
                    {details}
                  </ReadMoreText>
                </div>
              )}

              <div className='flex flex-row items-center gap-x-2'>
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='px-3 py-1.5 rounded-[28px] dark:bg-gray-950 bg-gray-100'
                  >
                    <div className='flex flex-row items-center gap-x-1'>
                      <Globe size={20} className='text-black-100 dark:text-white-100' />
                      <Text
                        size='xs'
                        color='text-black-100 dark:text-white-100'
                        className='font-medium'
                      >
                        Website
                      </Text>
                    </div>
                  </a>
                )}
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='px-3 py-1.5 rounded-[28px] dark:bg-gray-950 bg-gray-100'
                  >
                    <XLogo size={20} className='text-black-100 dark:text-white-100' />
                  </a>
                )}
              </div>
            </div>
            {!isSwapDisabled && (
              <div className='flex w-full py-4 px-6 mt-auto sticky bottom-0 z-[2] bg-gray-50 dark:bg-black-100 '>
                <Buttons.Generic
                  size='normal'
                  color={Colors.green600}
                  onClick={() => {
                    const denomKey = getKeyToUseForDenoms(
                      denomInfo?.coinMinimalDenom ?? '',
                      chainInfos[(denomInfo?.chain ?? '') as SupportedChain]?.chainId ?? '',
                    )
                    handleSwapClick(
                      `https://swapfast.app/?destinationChainId=${chainInfos[activeChain].chainId}&destinationAsset=${denomInfo?.coinMinimalDenom}`,
                      `/swap?destinationChainId=${chainInfos[activeChain].chainId}&destinationToken=${denomKey}&pageSource=assetDetails`,
                    )
                  }}
                  disabled={isSwapDisabled}
                >
                  <div className='flex flex-row items-center gap-x-1'>
                    <ArrowsLeftRight size={20} className='text-white-100' />
                    <Text color='text-white-100'>Swap</Text>
                  </div>
                </Buttons.Generic>
              </div>
            )}
          </div>
        </PopupLayout>
        <ReceiveToken
          isVisible={showReceiveSheet}
          chain={denomInfo?.chain as unknown as SupportedChain}
          tokenBalanceOnChain={portfolio?.tokenBalanceOnChain}
          onCloseHandler={() => {
            setShowReceiveSheet(false)
          }}
        />
        <StakeSelectSheet
          isVisible={showStakeSelectSheet}
          title='Stake'
          onClose={() => setShowStakeSelectSheet(false)}
          tokenLSProviders={tokenLSProviders}
          handleStakeClick={handleStakeClick}
          rootDenomsStore={rootDenomsStore}
          delegationsStore={delegationsStore}
          validatorsStore={validatorsStore}
          unDelegationsStore={unDelegationsStore}
          claimRewardsStore={claimRewardsStore}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
        />
        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
        />
        <SendToStakeModal
          isVisible={showSendToStakeModal}
          ibcDenom={portfolio}
          onClose={() => setShowSendToStakeModal(false)}
          nativeDenom={activeStakingDenom}
        />
      </div>
    )
  },
)

export default TokensDetails
