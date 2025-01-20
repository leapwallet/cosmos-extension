import { formatPercentAmount } from '@leapwallet/cosmos-wallet-hooks'
import { getErc20TokenDetails } from '@leapwallet/cosmos-wallet-sdk'
import {
  CompassTokenTagsStore,
  DenomsStore,
  MarketDataStore,
} from '@leapwallet/cosmos-wallet-store'
import {
  ArrowLeft,
  ArrowsLeftRight,
  Circle,
  MagnifyingGlass,
  Question,
  X,
} from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import TokenCardSkeleton from 'components/Skeletons/TokenCardSkeleton'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import Fuse from 'fuse.js'
import { useDefaultTokenLogo } from 'hooks'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import { TabType } from 'pages/swaps-v2/components/SelectDestinationSheet'
import { useSwapContext } from 'pages/swaps-v2/context'
import { MergedAsset } from 'pages/swaps-v2/hooks'
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { compassSeiEvmConfigStore } from 'stores/balance-store'
import { Token } from 'types/bank'
import { SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

const Header = forwardRef(
  (
    {
      searchQuery,
      setSearchQuery,
    }: {
      searchQuery: string
      setSearchQuery: (val: string) => void
    },
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const navigate = useNavigate()
    return (
      <div className='relative h-[78px] w-[400px] overflow-hidden flex items-center justify-between py-4 px-6 gap-x-2'>
        <ArrowLeft
          onClick={() => navigate('/home')}
          className='h-[46px] w-[46px] cursor-pointer text-center text-black-100 dark:text-white-100 p-3.5 rounded-full bg-gray-100 dark:bg-gray-900'
        />
        <div className='flex-1 flex h-full bg-gray-100 dark:bg-gray-900 rounded-[22px] py-3 px-4'>
          <input
            type='text'
            value={searchQuery}
            placeholder='Search for a token'
            className={classNames(
              'flex flex-grow font-medium text-base text-gray-600 dark:text-gray-400 outline-none bg-white-0',
            )}
            onChange={(e) => setSearchQuery(e.target?.value)}
            ref={ref}
          />

          {searchQuery.length > 0 ? (
            <X
              onClick={() => setSearchQuery('')}
              size={18}
              className='cursor-pointer text-center text-black-100 dark:text-white-100'
            />
          ) : (
            <MagnifyingGlass size={18} className='text-black-100 dark:text-white-100' />
          )}
        </div>
      </div>
    )
  },
)

Header.displayName = 'Header'

const TokenCard = observer(
  ({ token, marketDataStore }: { token: SourceToken; marketDataStore: MarketDataStore }) => {
    const defaultTokenLogo = useDefaultTokenLogo()
    const navigate = useNavigate()
    const [formatCurrency] = useFormatCurrency()
    const marketData = marketDataStore.data

    const marketDataForToken = useMemo(() => {
      let key = token.coinGeckoId ?? token.skipAsset?.coingeckoId ?? token.coinMinimalDenom
      if (marketData?.[key]) {
        return marketData[key]
      }
      key = token.coinMinimalDenom
      if (marketData?.[key]) {
        return marketData[key]
      }
      key = `${token.skipAsset?.chainId}-${token.coinMinimalDenom}`
      if (marketData?.[key]) {
        return marketData[key]
      }
      if (!token?.skipAsset?.evmTokenContract) {
        return undefined
      }
      key = `${token.skipAsset?.chainId}-${token.skipAsset?.evmTokenContract}`
      return marketData?.[key] ?? marketData?.[key?.toLowerCase()]
    }, [marketData, token])

    const onTokenSelect = useCallback(() => {
      const asset: Token = token
      sessionStorage.setItem('navigate-assetDetails-state', JSON.stringify(asset))
      let chain = token.chain ?? token.skipAsset?.originChainId
      if (chain === String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID)) {
        chain = 'seiTestnet2'
      }
      navigate(
        `/assetDetails?assetName=${(
          token.skipAsset?.originDenom ?? token.coinMinimalDenom
        )?.replace(/(cw20:|erc20\/)/g, '')}&tokenChain=${chain}&pageSource=${PageName.Search}`,
      )
    }, [navigate, token])

    const onSwapClick = useCallback(
      (event) => {
        navigate(
          `/swap?destinationToken=${
            token.skipAsset.denom ?? token.skipAsset.evmTokenContract
          }&destinationChainId=${token.skipAsset.chainId}&pageSource=search`,
        )
        event.stopPropagation()
      },
      [navigate, token.skipAsset.chainId, token.skipAsset.denom, token.skipAsset.evmTokenContract],
    )

    const usdPrice = useMemo(() => {
      return marketDataForToken?.current_price ?? token?.usdPrice
    }, [marketDataForToken, token?.usdPrice])

    return (
      <div className='flex items-center gap-x-3 py-3 cursor-pointer' onClick={onTokenSelect}>
        <img
          src={token.img ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
          height={40}
          width={40}
          className='rounded-full'
        />
        <div className='flex flex-col flex-grow'>
          <Text size='sm' className='font-bold text-black-100 dark:text-white-100'>
            {token.symbol ?? token.name}
          </Text>
          <div className='flex gap-x-2 items-center'>
            {!!usdPrice && new BigNumber(usdPrice ?? '').gt(0) && (
              <Text size='xs' className='font-medium text-gray-800 dark:text-gray-200'>
                {formatCurrency(new BigNumber(usdPrice), true, 10)}
              </Text>
            )}
            {marketDataForToken?.price_change_percentage_24h ? (
              <>
                <Circle size={6} weight='fill' className='text-gray-400' />
                <div
                  className={classNames('text-xs font-medium !leading-[18px]', {
                    'text-green-500 dark:text-green-500':
                      marketDataForToken?.price_change_percentage_24h >= 0,
                    'text-red-600 dark:text-red-400':
                      marketDataForToken?.price_change_percentage_24h < 0,
                  })}
                >
                  {marketDataForToken.price_change_percentage_24h > 0 ? '+' : ''}
                  {formatPercentAmount(
                    new BigNumber(marketDataForToken?.price_change_percentage_24h).toString(),
                    2,
                  )}
                  %
                </div>
              </>
            ) : null}
          </div>
        </div>
        <ArrowsLeftRight
          size={32}
          onClick={onSwapClick}
          className='text-black-100 dark:text-white-100 rounded-full p-2 bg-gray-100 dark:bg-gray-850 cursor-pointer'
        />
      </div>
    )
  },
)

const TokenList = ({
  tokens,
  header,
  marketDataStore,
}: {
  tokens: SourceToken[]
  header: string
  marketDataStore: MarketDataStore
}) => {
  return (
    <div className='flex flex-col'>
      <Text size='md' color='text-gray-600 dark:text-gray-400'>
        {header}
      </Text>
      {tokens.map((token, index) => {
        return (
          <>
            <TokenCard
              key={token.coinMinimalDenom}
              token={token}
              marketDataStore={marketDataStore}
            />
            {index !== tokens.length - 1 && (
              <div className='border-b w-full border-gray-100 dark:border-gray-850' />
            )}
          </>
        )
      })}
    </div>
  )
}

export const SearchPage = observer(
  ({
    compassTokenTagsStore,
    marketDataStore,
  }: {
    compassTokenTagsStore: CompassTokenTagsStore
    denomsStore: DenomsStore
    marketDataStore: MarketDataStore
  }) => {
    const { destinationAssets, loadingDestinationAssets } = useSwapContext()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTab, setSelectedTab] = useState(TabType.All)
    const inputRef = useRef<HTMLInputElement>(null)

    const trendingTokens = useMemo(() => {
      if (searchQuery.length !== 0) return []
      return destinationAssets.filter((token) => {
        let tag = compassTokenTagsStore.compassTokenTags[token.coinMinimalDenom]
        if (!tag && token.skipAsset.evmTokenContract) {
          tag = compassTokenTagsStore.compassTokenTags[token.skipAsset.evmTokenContract]
        }
        if (tag) {
          return tag.includes('Trending')
        }
        return false
      })
    }, [compassTokenTagsStore.compassTokenTags, destinationAssets, searchQuery.length])

    const tabTokens = useMemo(() => {
      if (selectedTab === TabType.All && searchQuery.length !== 0) return destinationAssets

      return destinationAssets.filter((token) => {
        let tag = compassTokenTagsStore.compassTokenTags[token.coinMinimalDenom]
        if (!tag && token.skipAsset.evmTokenContract) {
          tag = compassTokenTagsStore.compassTokenTags[token.skipAsset.evmTokenContract]
        }
        if (tag) {
          return tag.includes(selectedTab)
        }
        return false
      })
    }, [compassTokenTagsStore.compassTokenTags, destinationAssets, searchQuery.length, selectedTab])

    const simpleFuse = useMemo(() => {
      const keys = ['symbol', 'name']
      const fuseOptions = {
        keys,
        threshold: 0.3,
        ignoreLocation: true,
      }
      return new Fuse(destinationAssets, fuseOptions)
    }, [destinationAssets])

    const extendedFuse = useMemo(() => {
      const keys = ['symbol', 'name', 'coinMinimalDenom', 'ibcDenom', 'skipAsset.evmTokenContract']
      const fuseOptions = {
        keys,
        threshold: 0.3,
        ignoreLocation: true,
      }
      return new Fuse(destinationAssets, fuseOptions)
    }, [destinationAssets])

    const filteredTokens = useMemo(() => {
      if (searchQuery.length === 0) {
        return tabTokens
      }
      let fuse = simpleFuse
      if (searchQuery.length >= 8) {
        fuse = extendedFuse
      }
      const searchResult = fuse.search(searchQuery)
      return searchResult.map((result) => result.item)
    }, [searchQuery, simpleFuse, tabTokens, extendedFuse])

    const { data: nonSupportedERC20Token } = useQuery(
      ['erc20-token-details', searchQuery],
      async (): Promise<SourceToken | undefined> => {
        try {
          const token = await getErc20TokenDetails(
            searchQuery,
            compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_EVM_RPC_URL,
            compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID,
          )
          const denomInfo = {
            name: token.name,
            coinDenom: token.symbol,
            coinDecimals: token.decimals,
            coinMinimalDenom: searchQuery,
            icon: '',
            chain: 'seiTestnet2',
            coinGeckoId: '',
          }
          const mergedAsset: MergedAsset = {
            evmTokenContract: searchQuery,
            evmChainId: String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID),
            chainId: compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_COSMOS_CHAIN_ID,
            denom: searchQuery,
            originDenom: searchQuery,
            originChainId: compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_COSMOS_CHAIN_ID,
            symbol: denomInfo.coinDenom,
            logoUri: denomInfo.icon,
            trace: '',
            decimals: denomInfo.coinDecimals,
            coingeckoId: denomInfo.coinGeckoId,
            isCw20: false,
            name: denomInfo.name ?? denomInfo.coinDenom,
            tokenContract: searchQuery,
          }
          return {
            skipAsset: mergedAsset,
            symbol: denomInfo.coinDenom,
            coinMinimalDenom: searchQuery,
            amount: '0',
            coinGeckoId: '',
            img: '',
            chain: 'seiTestnet2',
            tokenBalanceOnChain: 'seiTestnet2',
            name: denomInfo.name ?? denomInfo.coinDenom,
            coinDecimals: denomInfo.coinDecimals,
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error fetching non supported ERC20 token details', error)
          return undefined
        }
      },
      {
        enabled:
          searchQuery.length >= 8 && searchQuery.startsWith('0x') && filteredTokens.length === 0,
      },
    )

    const handleResetClick = useCallback(() => {
      inputRef.current?.focus()
      setSearchQuery('')
      setSelectedTab(TabType.All)
    }, [])

    useEffect(() => {
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }, [])

    return (
      <div className='relative w-full overflow-clip panel-height'>
        <PopupLayout
          header={
            <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} ref={inputRef} />
          }
        >
          <div className='flex flex-col gap-y-2 py-4 px-6'>
            {loadingDestinationAssets ? (
              <div>
                {[...Array(5)].map((_, index) => (
                  <>
                    <TokenCardSkeleton key={index} />
                    {index !== 4 && (
                      <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                    )}
                  </>
                ))}
              </div>
            ) : (
              <div
                className='flex flex-col gap-y-2 relative'
                style={{
                  height: isSidePanel() ? window.innerHeight - 110 : 490,
                  overflowY: 'scroll',
                }}
              >
                {searchQuery.length === 0 && (
                  <>
                    <div className='flex gap-x-2 pb-4 sticky z-[2] top-0 bg-gray-50 dark:bg-black-100'>
                      {(Object.keys(TabType) as Array<keyof typeof TabType>).map((key) => {
                        const tab = TabType[key]
                        return (
                          <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`${
                              selectedTab === tab
                                ? 'text-black-100 dark:text-white-100 border-black-100 dark:border-white-100'
                                : 'text-gray-800 dark:text-gray-200 border-transparent'
                            } font-medium text-xs h-[36px] px-3 rounded-full bg-gray-100 dark:bg-gray-900 border`}
                          >
                            {tab}
                          </button>
                        )
                      })}
                    </div>
                    {/* Trending tokens */}
                    {selectedTab === TabType.All && trendingTokens.length > 0 && (
                      <TokenList
                        header='Trending'
                        tokens={trendingTokens}
                        marketDataStore={marketDataStore}
                      />
                    )}
                  </>
                )}
                {filteredTokens.length > 0 || !!nonSupportedERC20Token ? (
                  <TokenList
                    header='Tokens'
                    tokens={
                      filteredTokens.length > 0
                        ? filteredTokens
                        : nonSupportedERC20Token
                        ? [nonSupportedERC20Token]
                        : []
                    }
                    marketDataStore={marketDataStore}
                  />
                ) : (
                  <div className='py-[88px] w-full flex-col flex  justify-center items-center gap-4'>
                    <Question size={40} className='!leading-[40px] dark:text-white-100' />
                    <div className='flex flex-col justify-start items-center w-full gap-1'>
                      <div className='text-md text-center font-bold !leading-[21.5px] dark:text-white-100'>
                        No tokens found for &apos;{searchQuery}&apos;
                      </div>
                      <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400'>
                        Try searching for a different term or token address
                      </div>
                    </div>
                  </div>
                )}
                <div
                  onClick={handleResetClick}
                  className='flex bg-gray-100 dark:bg-gray-850 items-center justify-between rounded-xl px-5 py-3 mt-auto cursor-pointer'
                >
                  <div className='flex flex-col '>
                    <Text
                      size='xs'
                      className='font-bold'
                      color='text-black-100 dark:text-white-100'
                    >
                      Can&apos;t find your token?
                    </Text>
                    <Text
                      size='xs'
                      className='font-medium'
                      color='text-gray-600 dark:text-gray-400'
                    >
                      Search using token address
                    </Text>
                  </div>
                  <MagnifyingGlass size={24} className='text-black-100 dark:text-white-100' />
                </div>
              </div>
            )}
          </div>
        </PopupLayout>
      </div>
    )
  },
)
