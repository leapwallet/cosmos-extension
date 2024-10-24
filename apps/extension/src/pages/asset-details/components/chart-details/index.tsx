import {
  currencyDetail,
  formatPercentAmount,
  formatTokenAmount,
  getKeyToUseForDenoms,
  LeapWalletApi,
  sliceWord,
  Token,
  useActiveStakingDenom,
  useAssetDetails,
  useFeatureFlags,
  useformatCurrency,
  useSelectedNetwork,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { chainIdToChain, SupportedChain, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import {
  ChainTagsStore,
  ClaimRewardsStore,
  DelegationsStore,
  DenomsStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { useSkipAssets } from '@leapwallet/elements-hooks'
import { useAllSkipAssets } from '@leapwallet/elements-hooks'
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import {
  ArrowsLeftRight,
  CurrencyDollar,
  DownloadSimple,
  Plus,
  UploadSimple,
} from '@phosphor-icons/react'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import ClickableIcon from 'components/clickable-icons'
import PopupLayout from 'components/layout/popup-layout'
import ReadMoreText from 'components/read-more-text'
import ReceiveToken from 'components/Receive'
import { useHardCodedActions } from 'components/search-modal'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { differenceInDays } from 'date-fns'
import { useChainPageInfo } from 'hooks'
import useGetTopCGTokens from 'hooks/explore/useGetTopCGTokens'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useKadoAssets } from 'hooks/useGetKadoDetails'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import StakeSelectSheet from 'pages/stake-v2/components/StakeSelectSheet'
import React, { useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { imgOnError } from 'utils/imgOnError'
import { capitalize } from 'utils/strings'

import ChartSkeleton from '../chart-skeleton/ChartSkeleton'
import { TokensChart } from './token-chart'

type TokenCTAsProps = {
  isSwapDisabled: boolean
  isStakeDisabled: boolean
  onReceiveClick: () => void
  onSendClick: () => void
  onSwapClick: () => void
  onBuyClick: () => void
  onStakeClick: () => void
  isBuyDisabled: boolean
  isSendDisabled?: boolean
}

function TokenCTAs({
  onReceiveClick,
  onSendClick,
  onSwapClick,
  onStakeClick,
  isSwapDisabled,
  isBuyDisabled,
  isSendDisabled,
  isStakeDisabled,
  onBuyClick,
}: TokenCTAsProps) {
  return (
    <div className='flex w-full flex-row items-center justify-between px-[16px]'>
      <ClickableIcon
        label='Buy'
        icon={<Plus size={20} />}
        disabled={isBuyDisabled}
        onClick={onBuyClick}
      />

      <ClickableIcon label='Deposit' icon={<DownloadSimple size={20} />} onClick={onReceiveClick} />

      <ClickableIcon
        label='Send'
        icon={<UploadSimple size={20} />}
        onClick={onSendClick}
        disabled={isSendDisabled}
      />

      <ClickableIcon
        label='Swap'
        icon={<ArrowsLeftRight size={20} />}
        disabled={isSwapDisabled}
        onClick={onSwapClick}
      />

      {
        <ClickableIcon
          label='Stake'
          icon={<CurrencyDollar size={20} />}
          onClick={onStakeClick}
          disabled={isStakeDisabled}
        />
      }
    </div>
  )
}

type TokenDetailsProps = {
  denomsStore: DenomsStore
  rootDenomsStore: RootDenomsStore
  chainTagsStore: ChainTagsStore
}

const useAllSkipAssetsParams = {
  includeCW20Assets: true,
  includeNoMetadataAssets: false,
}

const TokensDetails = observer(
  ({ denomsStore, rootDenomsStore, chainTagsStore }: TokenDetailsProps) => {
    const assetType = undefined
    const chainInfos = useChainInfos()
    const _activeChain = useActiveChain()
    const assetsId = useQuery().get('assetName') ?? undefined
    const tokenChain = useQuery().get('tokenChain') ?? undefined
    const { data: kadoSupportedAssets = [] } = useKadoAssets()
    const [isBuySupported, setIsBuySupported] = useState(false)
    const navigate = useNavigate()
    const { data: cgTokens = [] } = useGetTopCGTokens()
    const { data: featureFlags } = useFeatureFlags()

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

    const { data: addSkipAssets } = useAllSkipAssets(useAllSkipAssetsParams)

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
        !!skipAssets?.find((skipAsset) =>
          [assetsId, portfolio?.ibcDenom, portfolio?.coinMinimalDenom].includes(
            skipAsset.denom.replace(/(cw20:|erc20\/)/g, ''),
          ),
        )
      )
    }, [assetsId, portfolio?.coinMinimalDenom, portfolio?.ibcDenom, skipAssets])

    const [showChainSelector, setShowChainSelector] = useState(false)
    const [showReceiveSheet, setShowReceiveSheet] = useState(false)
    const [showStakeSelectSheet, setShowStakeSelectSheet] = useState(false)

    const [formatCurrency] = useformatCurrency()
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
    } = useAssetDetails({
      denoms: denomsStore.denoms,
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

    const { price, details, priceChange } = {
      price: info?.price,
      details: info?.details,
      priceChange: info?.priceChange,
    } ?? {
      price: cgToken?.current_price ?? undefined,
      details: undefined,
      priceChange: cgToken?.price_change_percentage_24h ?? undefined,
      marketCap: cgToken?.market_cap ?? undefined,
    }

    const portfolioPercentChange = portfolio?.percentChange ?? priceChange
    const { chartData, minMax } = chartsData ?? { chartData: undefined, minMax: undefined }
    const totalHoldingsInUsd = portfolio?.usdValue
    const filteredChartDays = ChartDays
    const displayChain = chainInfos[tokenChain as SupportedChain]?.chainName ?? tokenChain

    const dontShowSelectChain = useDontShowSelectChain()
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
      activeChain,
      activeNetwork,
    )

    useEffect(() => {
      if (kadoSupportedAssets.length > 0 && portfolio) {
        const supportedAsset = kadoSupportedAssets.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) =>
            item.symbol === portfolio.symbol &&
            chainIdToChain[item.officialChainId] === portfolio.chain,
        )
        if (supportedAsset) {
          setIsBuySupported(true)
        }
      }
    }, [portfolio, kadoSupportedAssets])

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
              title={<Text size='lg'>Asset details</Text>}
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
                        src={denomInfo?.icon ?? cgToken?.image ?? defaultIconLogo}
                        onError={imgOnError(defaultIconLogo)}
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
                            {price ? formatCurrency(new BigNumber(price), 5) : '-'}
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
                                chainInfos[denomInfo?.chain as SupportedChain]?.theme
                                  ?.primaryColor ?? '#70B7FF'
                              }
                              chartData={chartData}
                              loadingCharts={chartsLoading}
                              price={price}
                              minMax={minMax}
                              key={selectedDays}
                            />
                          }
                          {price && (
                            <div className='flex w-full max-w-full flex-row justify-around gap-[4px] rounded-full overflow-scroll hide-scrollbar border border-gray-100 dark:border-gray-900'>
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
                  <div
                    className={classNames('flex w-full flex-row justify-between px-[16px]', {
                      'items-start': totalHoldingsInUsd,
                      'items-center': !totalHoldingsInUsd,
                    })}
                  >
                    <div className='text-sm font-bold !leading-[24px] text-gray-500 dark:text-gray-500'>
                      Token Balance
                    </div>
                    <div className='flex flex-row gap-1 items-center max-w-[200px] flex-wrap justify-end'>
                      {totalHoldingsInUsd ? (
                        <div className='text-md font-bold !leading-[24px] text-black-100 dark:text-white-100'>
                          {formatCurrency(new BigNumber(totalHoldingsInUsd), 5)}
                        </div>
                      ) : null}

                      <div className='text-sm font-medium !leading-[16px] text-gray-500 dark:text-gray-500'>
                        {totalHoldingsInUsd ? `(` : ''}
                        {formatTokenAmount(portfolio?.amount?.toString() ?? '', '', 5)}{' '}
                        {sliceWord(denomInfo?.coinDenom ?? portfolio?.symbol, 5, 4)}
                        {totalHoldingsInUsd ? `)` : ''}
                      </div>
                    </div>
                  </div>

                  <div className='opacity-0'>
                    <CardDivider />
                  </div>

                  <TokenCTAs
                    onBuyClick={() => {
                      navigate(`/buy?pageSource=${PageName.AssetDetails}`, { state: portfolio })
                    }}
                    isBuyDisabled={!isBuySupported}
                    onSendClick={() => {
                      navigate('/send', { state: location.state })
                    }}
                    onStakeClick={() => {
                      setShowStakeSelectSheet(true)
                    }}
                    isStakeDisabled={
                      activeStakingDenom?.coinDenom !== denomInfo?.coinDenom ||
                      !!chainInfos[activeChain].evmOnlyChain
                    }
                    onReceiveClick={() => {
                      setShowReceiveSheet(true)
                    }}
                    isSwapDisabled={
                      !skipSupportsToken || featureFlags?.all_chains?.swap === 'disabled'
                    }
                    onSwapClick={() => {
                      const denomKey = getKeyToUseForDenoms(
                        denomInfo?.coinMinimalDenom ?? '',
                        chainInfos[(denomInfo?.chain ?? '') as SupportedChain].chainId,
                      )
                      handleSwapClick(
                        `https://swapfast.app/?sourceChainId=${chainInfos[activeChain].chainId}&sourceAsset=${denomInfo?.coinMinimalDenom}`,
                        `/swap?sourceChainId=${chainInfos[activeChain].chainId}&sourceToken=${denomKey}&pageSource=assetDetails`,
                      )
                    }}
                  />
                </div>
              </div>

              {/* <DefiList tokenName={denomInfo?.name ?? portfolio?.symbol} /> */}

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
          tokenBalanceOnChain={portfolio?.tokenBalanceOnChain}
          onCloseHandler={() => {
            setShowReceiveSheet(false)
          }}
        />
        <StakeSelectSheet
          isVisible={showStakeSelectSheet}
          title='Stake'
          onClose={() => setShowStakeSelectSheet(false)}
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
      </div>
    )
  },
)

export default TokensDetails
