import { APTOS_COIN, APTOS_FA } from '@aptos-labs/ts-sdk'
import { getAddress } from '@ethersproject/address'
import {
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
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  aptosChainNativeFATokenMapping,
  aptosChainNativeTokenMapping,
  ChainInfos,
  fromSmall,
  getNobleClaimYield,
  NativeDenom,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  ChainTagsStore,
  DenomsStore,
  PercentageChangeDataStore,
  PriceStore,
  RootDenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { ArrowLeft, Globe, X, XLogo } from '@phosphor-icons/react'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import ClickableIcon from 'components/clickable-icons-v2'
import { PageHeader } from 'components/header/PageHeaderV2'
import ReadMoreText from 'components/read-more-text'
import ReceiveToken from 'components/Receive'
import { useHardCodedActions } from 'components/search-modal'
import Text from 'components/text'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { Button } from 'components/ui/button'
import { EventName, PageName } from 'config/analytics'
import { LEAPBOARD_SWAP_URL } from 'config/constants'
import { differenceInDays } from 'date-fns'
import { useChainPageInfo } from 'hooks'
import { usePageView } from 'hooks/analytics/usePageView'
import useGetTopCGTokens from 'hooks/explore/useGetTopCGTokens'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import useQuery, { useQueryParams } from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { DollarIconV2 } from 'icons/dollar-icon-v2'
import { ReceiveIcon } from 'icons/receive-icon'
import { SwapIconV2 } from 'icons/swap-icon-v2'
import { UploadIconV2 } from 'icons/upload-icon-v2'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import ReviewClaimTxSheet from 'pages/earnUSDN/ReviewClaimTx'
import TxPage from 'pages/earnUSDN/TxPage'
import SelectChain from 'pages/home/SelectChain'
import StakeSelectSheet from 'pages/stake-v2/components/StakeSelectSheet'
import { StakeInputPageState } from 'pages/stake-v2/StakeInputPage'
import useAssets from 'pages/swaps-v2/hooks/useAssets'
import { hasCoinType } from 'pages/swaps-v2/utils'
import React, { useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router-dom'
import { coingeckoIdsStore } from 'stores/balance-store'
import { miscellaneousDataStore } from 'stores/chain-infos-store'
import { denomsStore } from 'stores/denoms-store-instance'
import { earnBannerShowStore } from 'stores/earn-banner-show'
import { earnFeatureShowStore } from 'stores/earn-feature-show'
import { manageChainsStore } from 'stores/manage-chains-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { AggregatedSupportedChain } from 'types/utility'
import { imgOnError } from 'utils/imgOnError'
import { capitalize } from 'utils/strings'

import ChartSkeleton from '../chart-skeleton/ChartSkeleton'
import SendToStakeModal from './SendToStakeModal'
import { TokensChart } from './token-chart'

type TokenDetailsProps = {
  denomsStore: DenomsStore
  rootDenomsStore: RootDenomsStore
  chainTagsStore: ChainTagsStore
  percentageChangeDataStore: PercentageChangeDataStore
  priceStore: PriceStore
}

const TokensDetails = observer(
  ({
    rootDenomsStore,
    chainTagsStore,
    percentageChangeDataStore,
    priceStore,
  }: TokenDetailsProps) => {
    const assetType = undefined
    const query = useQueryParams()
    const chainInfos = useChainInfos()
    const _activeChain = useActiveChain()
    const { activeWallet } = useActiveWallet()
    const assetsId = useQuery().get('assetName') ?? undefined
    const tokenChain = useQuery().get('tokenChain') ?? undefined
    const pageSource = useQuery().get('pageSource') ?? undefined
    const navigate = useNavigate()
    const { data: cgTokens = [] } = useGetTopCGTokens()
    const { data: featureFlags } = useFeatureFlags()
    const percentageChangeData = percentageChangeDataStore.data ?? {}
    const [earnBannerVisible, setEarnBannerVisible] = useState(earnBannerShowStore.show === 'true')
    const [claimAmount, setClaimAmount] = useState('')
    const getWallet = Wallet.useGetWallet()
    const [showReviewTxSheet, setShowReviewTxSheet] = useState(false)
    const [txHash, setTxHash] = useState<string>()
    const nobleChainInfo = useChainInfo('noble')

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
          if (
            assetToFind.some((asset) => Object.values(aptosChainNativeTokenMapping).includes(asset))
          ) {
            return hasCoinType(skipAsset) && skipAsset.coinType === APTOS_COIN
          }
          if (
            assetToFind.some((asset) =>
              Object.values(aptosChainNativeFATokenMapping).includes(asset),
            )
          ) {
            return (
              skipAsset.denom === APTOS_FA ||
              (hasCoinType(skipAsset) && skipAsset.coinType === APTOS_COIN)
            )
          }
          return (
            assetToFind.includes(skipAsset.denom.replace(/(cw20:|erc20\/)/g, '')) ||
            assetToFind.includes(skipAsset.denom.replace(/(cw20:|erc20\/)/g, '').toLowerCase()) ||
            (!!skipAsset.evmTokenContract &&
              (assetToFind.includes(skipAsset.evmTokenContract.replace(/(cw20:|erc20\/)/g, '')) ||
                assetToFind.includes(
                  skipAsset.evmTokenContract.replace(/(cw20:|erc20\/)/g, '').toLowerCase(),
                ))) ||
            (hasCoinType(skipAsset) &&
              (assetToFind.includes(skipAsset.coinType) ||
                assetToFind.includes(skipAsset.coinType.toLowerCase())))
          )
        })
      )
    }, [assetsId, portfolio?.coinMinimalDenom, portfolio?.ibcDenom, skipAssets])

    const [showChainSelector, setShowChainSelector] = useState(false)
    const [showSendToStakeModal, setShowSendToStakeModal] = useState(false)
    const [showStakeSelectSheet, setShowStakeSelectSheet] = useState(false)
    const [formatCurrency] = useformatCurrency()
    const { handleSwapClick } = useHardCodedActions()

    // TODO: Remove this once we have a proper way to handle denoms, why rootDenomsStore.allDenoms not have denoms added to denomsStore.denoms post loading?
    const denoms = useMemo(() => {
      return Object.assign({}, rootDenomsStore.allDenoms, denomsStore.denoms)
    }, [rootDenomsStore.allDenoms, denomsStore.denoms])

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
      denoms,
      denom: assetsId as unknown as SupportedDenoms,
      tokenChain: (tokenChain ?? 'cosmos') as unknown as SupportedChain,
      compassParams: { isCompassWallet: false },
      coingeckoIdsStore,
      percentageChangeDataStore,
      priceStore: priceStore,
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

    const isSwapDisabled = useMemo(() => {
      if (denomInfo.chain === 'noble' && denomInfo.coinMinimalDenom === 'uusdn') return true
      return !skipSupportsToken || featureFlags?.all_chains?.swap === 'disabled'
    }, [
      denomInfo.chain,
      denomInfo.coinMinimalDenom,
      skipSupportsToken,
      featureFlags?.all_chains?.swap,
    ])

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

    const chainIcon = useMemo(() => {
      return (
        chainInfos[portfolio?.tokenBalanceOnChain as SupportedChain]?.chainSymbolImageUrl ??
        ChainInfos[portfolio?.tokenBalanceOnChain as SupportedChain]?.chainSymbolImageUrl ??
        chainInfos[denomInfo?.chain as SupportedChain]?.chainSymbolImageUrl ??
        ChainInfos[denomInfo?.chain as SupportedChain]?.chainSymbolImageUrl
      )
    }, [chainInfos, denomInfo?.chain, portfolio?.tokenBalanceOnChain])

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
      forceChain: portfolio?.ibcDenom ? (portfolio?.chain as SupportedChain) : activeChain,
      forceNetwork: activeNetwork,
    })

    const isStakeNotSupported = useIsFeatureExistForChain({
      checkForExistenceType: 'notSupported',
      feature: 'stake',
      platform: 'Extension',
      forceChain: portfolio?.ibcDenom ? (portfolio?.chain as SupportedChain) : activeChain,
      forceNetwork: activeNetwork,
    })
    const isStakeDisabled = useMemo(() => {
      return (
        isStakeComingSoon ||
        isStakeNotSupported ||
        !!chainInfos[activeChain]?.evmOnlyChain ||
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
      const state: StakeInputPageState = {
        mode: 'DELEGATE',
        forceChain: activeChain,
        forceNetwork: activeNetwork,
      }
      sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state))
      if (
        (validatorsStore.validatorsForChain(activeChain).validatorData?.validators ?? []).length ===
        0
      ) {
        validatorsStore.loadValidators(activeChain, activeNetwork)
      }
      navigate('/stake/input', {
        state,
      })
      // mixpanel.track(EventName.PageView, {
      //   pageName: PageName.Stake,
      //   pageViewSource: PageName.AssetDetails,
      //   chainName: chain.chainName,
      //   chainId: chain.chainId,
      //   time: Date.now() / 1000,
      // })
    }

    const handleCloseBanner = (e: any) => {
      e.stopPropagation()
      setEarnBannerVisible(false)
      earnBannerShowStore.setShow('false')
    }

    const handleEarnBannerClick = () => {
      if (earnFeatureShowStore.show !== 'false') {
        navigate('/home?openEarnUSDN=true', { replace: true })
      } else {
        navigate('/earn-usdn')
      }
    }

    useEffect(() => {
      async function getEarnYield() {
        try {
          const wallets = await getWallet('noble')
          const address = (await wallets.getAccounts())[0].address
          const res = await getNobleClaimYield(nobleChainInfo?.apis.rest ?? '', address)
          const amount = new BigNumber(res?.claimable_amount)
          if (amount.gt(0)) {
            setClaimAmount(fromSmall(amount.toFixed(0)))
          } else {
            setClaimAmount('0')
          }
        } catch (error) {
          //
        }
      }
      if (denomInfo.chain === 'noble' && denomInfo.coinMinimalDenom === 'uusdn') {
        getEarnYield()
      }
    }, [denomInfo.chain, denomInfo.coinMinimalDenom, getWallet, nobleChainInfo?.apis.rest, txHash])

    if (txHash && denomInfo.chain === 'noble' && denomInfo.coinMinimalDenom === 'uusdn') {
      return (
        <TxPage
          onClose={() => {
            setTxHash(undefined)
            setShowReviewTxSheet(false)
          }}
          txHash={txHash}
          txType={'claim'}
        />
      )
    }

    return (
      <>
        <PageHeader className='absolute'>
          <ArrowLeft
            className='size-9 p-2 cursor-pointer text-muted-foreground hover:text-foreground'
            onClick={() => {
              sessionStorage.removeItem('navigate-assetDetails-state')
              navigate(-1)
            }}
          />
          <Text className='text-[18px] font-bold !leading-6' color='text-monochrome'>
            {capitalize(
              portfolio?.symbol ?? denomInfo?.coinDenom ?? denomInfo?.name ?? cgToken?.symbol,
            )}
          </Text>
          <div className='w-9 h-9' />
        </PageHeader>
        <div className={classNames('relative bg-secondary-50 pt-16')}>
          {denomInfo.chain === 'noble' &&
            denomInfo.coinMinimalDenom === 'uusdc' &&
            earnBannerVisible && (
              <div
                className='bg-secondary-100 p-[14px] pl-5 mb-11 flex items-center cursor-pointer'
                onClick={handleEarnBannerClick}
              >
                <div className='flex items-center gap-3 w-full'>
                  <img src={Images.Logos.USDCLogo} className='w-9 h-9' />
                  <Text
                    className='!inline font-bold'
                    size='md'
                    color='dark:text-white-100 text-black-100'
                  >
                    Earn up to{' '}
                    {
                      <span className='text-green-600 font-bold'>
                        {parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
                          ? new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy)
                              .multipliedBy(100)
                              .toFixed(2) + '%'
                          : '-'}
                        &nbsp;APY
                      </span>
                    }{' '}
                    with USDC
                  </Text>
                </div>
                <X
                  size={18}
                  className='dark:text-gray-700 text-gray-400'
                  onClick={handleCloseBanner}
                />
              </div>
            )}

          {/* chart */}
          <div className='flex flex-col items-center px-6 pt-5 pb-3'>
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
                        'text-green-600 dark:text-green-600': !percentChange || percentChange >= 0,
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

          <div className='flex flex-col gap-5 w-full p-6'>
            {denomInfo.chain !== 'noble' || denomInfo.coinMinimalDenom !== 'uusdn' ? (
              <>
                {activeWallet?.walletType !== WALLETTYPE.WATCH_WALLET ? (
                  <div className='flex gap-9 justify-center w-full'>
                    <ClickableIcon
                      label='Send'
                      icon={UploadIconV2}
                      onClick={() => {
                        const denomKey = getKeyToUseForDenoms(
                          portfolio?.ibcDenom || denomInfo?.coinMinimalDenom || '',
                          chainInfos[(denomInfo?.chain ?? '') as SupportedChain]?.chainId ?? '',
                        )
                        const chainId = chainInfos[activeChain]?.chainId
                        let searchQuery = `assetCoinDenom=${denomKey}&holderChain=${activeChain}`
                        if (chainId) {
                          searchQuery += `&chainId=${chainId}`
                        }
                        navigate(`/send?${searchQuery}`, {
                          state: location.state,
                        })
                      }}
                    />
                    <ClickableIcon
                      label='Receive'
                      icon={ReceiveIcon}
                      onClick={() => query.set('receive', 'true')}
                    />
                    <ClickableIcon
                      label='Swap'
                      icon={SwapIconV2}
                      onClick={() => {
                        let coinMinimalDenom =
                          portfolio?.ibcDenom || denomInfo?.coinMinimalDenom || ''
                        if (coinMinimalDenom?.startsWith('0x')) {
                          coinMinimalDenom = getAddress(coinMinimalDenom)
                        }
                        const denomKey = getKeyToUseForDenoms(
                          coinMinimalDenom,
                          chainInfos[(denomInfo?.chain ?? '') as SupportedChain]?.chainId ?? '',
                        )
                        handleSwapClick(
                          `${LEAPBOARD_SWAP_URL}&destinationChainId=${chainInfos[activeChain].chainId}&destinationAsset=${coinMinimalDenom}`,
                          `/swap?destinationChainId=${chainInfos[activeChain].chainId}&destinationToken=${denomKey}&pageSource=assetDetails`,
                        )
                      }}
                      disabled={isSwapDisabled}
                    />
                    <ClickableIcon
                      label='Stake'
                      icon={DollarIconV2}
                      onClick={() => {
                        if (portfolio?.ibcDenom) {
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
                ) : null}

                <div className='flex flex-col gap-3'>
                  <Text size='sm' color='text-muted-foreground' className='font-bold !leading-5'>
                    Your Balance
                  </Text>
                  <div className='flex bg-secondary-100 border-secondary-200 border rounded-2xl p-4 gap-2'>
                    <div className='relative w-[40px] h-[40px] flex items-center justify-center'>
                      <TokenImageWithFallback
                        assetImg={assetImg}
                        text={denomInfo?.coinDenom}
                        altText={denomInfo?.coinDenom}
                        imageClassName='w-[30px] h-[30px] rounded-full shrink-0'
                        containerClassName='w-[30px] h-[30px] rounded-full shrink-0 !bg-gray-200 dark:!bg-gray-800'
                        textClassName='text-[8.34px] !leading-[11px]'
                      />
                      <img
                        src={chainIcon}
                        onError={imgOnError(defaultIconLogo)}
                        className='w-[15px] h-[15px] absolute bottom-[3px] right-[3px] rounded-full bg-white-100 dark:bg-black-100'
                      />
                    </div>
                    <div className='flex flex-col grow '>
                      <Text size='md' color='text-monochrome' className='font-bold !leading-6'>
                        {denomInfo?.name ?? denomInfo?.coinDenom}
                      </Text>
                      <Text
                        size='xs'
                        color='text-muted-foreground'
                        className='font-medium !leading-4'
                      >
                        {displayChain ?? cgToken?.name}
                      </Text>
                    </div>
                    <div className='flex flex-col items-end justify-between py-[1px]'>
                      <Text size='sm' color='text-monochrome' className='font-bold !leading-5'>
                        {totalHoldingsInUsd
                          ? formatCurrency(new BigNumber(totalHoldingsInUsd), 5)
                          : '-'}
                      </Text>
                      <Text
                        size='xs'
                        color='text-gray-600 dark:text-gray-400 text-right'
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
              </>
            ) : (
              <div className='flex flex-col gap-3'>
                <Text size='sm' color='text-muted-foreground' className='font-bold !leading-5 mt-3'>
                  Your Balance
                </Text>
                <div className='flex flex-col bg-secondary-100 border-secondary-200 border rounded-lg p-4 gap-y-4'>
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
                        src={chainIcon}
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
                            {denomInfo?.name ?? denomInfo?.coinDenom}
                          </Text>
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
                          color='text-gray-600 dark:text-gray-400 text-right'
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
                        navigate('/earn-usdn')
                      }}
                      className='flex flex-row gap-x-2 items-center justify-center h-full w-full p-3 bg-secondary-300 hover:bg-secondary-400 rounded-full'
                    >
                      <Text
                        size='xs'
                        color='text-black-100 dark:text-white-100'
                        className='font-bold'
                      >
                        Deposit
                      </Text>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/earn-usdn?withdraw=true')
                      }}
                      className='flex flex-row gap-x-2 items-center justify-center h-full w-full p-3 bg-secondary-300 hover:bg-secondary-400 rounded-full'
                    >
                      <Text
                        size='xs'
                        color='text-black-100 dark:text-white-100'
                        className='font-bold'
                      >
                        Withdraw
                      </Text>
                    </button>
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
                      className={classNames(
                        'flex flex-row gap-x-2 items-center justify-center h-full w-full p-3 bg-secondary-300 hover:bg-secondary-400 rounded-full',
                      )}
                    >
                      <Text
                        size='xs'
                        color='text-black-100 dark:text-white-100'
                        className='font-bold'
                      >
                        Send
                      </Text>
                    </button>
                  </div>
                </div>
                <div className='flex flex-col gap-y-3 mt-4'>
                  <Text size='sm' color='text-gray-600 dark:text-gray-400' className='font-bold'>
                    Your rewards
                  </Text>
                  <div className='flex flex-col bg-secondary-100 border-secondary-200 border rounded-lg'>
                    <div className='flex py-5 px-6 w-full'>
                      <div className='flex flex-col w-1/2 gap-2'>
                        <Text size='xs' color='dark:text-gray-400 text-gray-600'>
                          Claimable rewards
                        </Text>
                        <Text size='lg' color='text-green-500' className='font-bold'>
                          {formatCurrency(new BigNumber(claimAmount))}
                        </Text>
                      </div>
                    </div>
                    <div className='h-[1px] w-full dark:bg-gray-850 bg-gray-200' />
                    <div className='px-6 py-5'>
                      <button
                        onClick={() => {
                          setShowReviewTxSheet(true)
                        }}
                        className={classNames(
                          'flex flex-row gap-x-2 items-center justify-center h-full w-full p-4 bg-secondary-300 hover:bg-secondary-400 rounded-full cursor-pointer',
                          {
                            '!cursor-not-allowed opacity-75': !new BigNumber(claimAmount).gt(
                              0.00001,
                            ),
                          },
                        )}
                        disabled={!new BigNumber(claimAmount).gt(0.00001)}
                      >
                        <Text
                          size='xs'
                          color='text-black-100 dark:text-white-100'
                          className='font-bold'
                        >
                          Claim rewards
                        </Text>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* details */}
            {!loadingPrice &&
              details &&
              (denomInfo.coinMinimalDenom !== 'uusdn' || denomInfo.chain !== 'noble') && (
                <div className='flex flex-col gap-y-2'>
                  <Text size='sm' color='text-muted-foreground' className='font-bold'>
                    About {denomInfo?.name ?? capitalize(denomInfo?.chain)}
                  </Text>
                  <ReadMoreText
                    textProps={{ size: 'sm', className: 'flex flex-column' }}
                    readMoreColor={'#696969'}
                  >
                    {details}
                  </ReadMoreText>
                </div>
              )}

            {denomInfo.coinMinimalDenom === 'uusdn' && denomInfo.chain === 'noble' ? null : (
              <div className='flex flex-row items-center gap-x-2'>
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='px-3 py-1.5 rounded-[28px] border border-secondary-300'
                  >
                    <div className='flex flex-row items-center gap-x-1'>
                      <Globe size={20} className='text-foreground' />
                      <Text size='xs' color='text-foreground' className='font-medium'>
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
                    className='px-3 py-1.5 rounded-[28px] border border-secondary-300'
                  >
                    <XLogo size={20} className='text-black-100 dark:text-white-100' />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        <ReceiveToken forceChain={portfolio?.tokenBalanceOnChain} />
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
        {showSendToStakeModal && portfolio && (
          <SendToStakeModal
            isVisible={showSendToStakeModal}
            ibcDenom={portfolio}
            onClose={() => setShowSendToStakeModal(false)}
            nativeDenom={activeStakingDenom}
          />
        )}
        {showReviewTxSheet &&
          denomInfo.chain === 'noble' &&
          denomInfo.coinMinimalDenom === 'uusdn' && (
            <ReviewClaimTxSheet
              amount={claimAmount}
              denom={denomInfo}
              isOpen={showReviewTxSheet}
              onClose={() => setShowReviewTxSheet(false)}
              setTxHash={(val: string) => setTxHash(val)}
            />
          )}
      </>
    )
  },
)

export default TokensDetails
