import {
  currencyDetail,
  formatPercentAmount,
  formatTokenAmount,
  getKeyToUseForDenoms,
  sliceWord,
  Token,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { getErc20TokenDetails } from '@leapwallet/cosmos-wallet-sdk'
import { CompassTokenTagsStore, MarketDataStore } from '@leapwallet/cosmos-wallet-store'
import { CheckCircle, Copy, Info, MagnifyingGlass, Question } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import Fuse from 'fuse.js'
import { useDefaultTokenLogo } from 'hooks'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { compassSeiEvmConfigStore } from 'stores/balance-store'
import { SourceToken } from 'types/swap'
import { UserClipboard } from 'utils/clipboard'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

import { MergedAsset } from '../hooks'
import { TokenCardSkeleton } from './TokenCard'

export enum TabType {
  All = 'All',
  Top = 'Top',
  Meme = 'Meme',
  Stablecoins = 'Stablecoins',
}

type SelectTokenSheetProps = {
  isOpen: boolean
  destinationAssets: SourceToken[]
  destinationToken: SourceToken | null
  onClose: () => void
  onTokenSelect: (token: SourceToken) => void
  loadingTokens: boolean
  compassTokenTagsStore: CompassTokenTagsStore
  marketDataStore: MarketDataStore
}

const TokenCard = observer(
  ({
    token,
    onTokenSelect,
    selectedToken,
    marketDataStore,
  }: {
    token: SourceToken
    selectedToken: SourceToken | null
    onTokenSelect: (token: SourceToken) => void
    marketDataStore: MarketDataStore
  }) => {
    const [showTooltip, setShowTooltip] = useState(false)
    const [formatCurrency] = useFormatCurrency()
    const [preferredCurrency] = useUserPreferredCurrency()
    const defaultTokenLogo = useDefaultTokenLogo()
    const [copied, setCopied] = useState(false)
    const navigate = useNavigate()
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

    const isSelected = useMemo(() => {
      let _isSelected =
        getKeyToUseForDenoms(token.skipAsset.denom, token.skipAsset.originChainId) ===
        getKeyToUseForDenoms(
          selectedToken?.skipAsset?.denom ?? '',
          selectedToken?.skipAsset?.originChainId ?? '',
        )

      if (token.ibcDenom !== undefined && selectedToken?.ibcDenom !== undefined) {
        _isSelected = _isSelected && token.ibcDenom === selectedToken.ibcDenom
      }
      return _isSelected
    }, [selectedToken, token])

    const handleMouseEnter = useCallback(() => {
      setShowTooltip(true)
    }, [])
    const handleMouseLeave = useCallback(() => {
      setShowTooltip(false)
    }, [])

    const handleCopyClick = useCallback(() => {
      UserClipboard.copyText(
        token.skipAsset?.evmTokenContract ?? token.skipAsset.tokenContract ?? '',
      )
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }, [token.skipAsset?.evmTokenContract, token.skipAsset?.tokenContract])

    const handleMoreDetailsClick = useCallback(() => {
      const asset: Token = token
      sessionStorage.setItem('navigate-assetDetails-state', JSON.stringify(asset))
      let chain = token.chain ?? token.skipAsset?.originChainId
      if (chain === String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID)) {
        chain = 'seiTestnet2'
      }
      navigate(
        `/assetDetails?assetName=${(
          token.skipAsset?.originDenom ??
          token.coinMinimalDenom ??
          ''
        )?.replace(/(cw20:|erc20\/)/g, '')}&tokenChain=${chain}&pageSource=${PageName.SwapsStart}`,
      )
    }, [token, navigate])

    const usdPrice = useMemo(() => {
      return marketDataForToken?.current_price ?? token?.usdPrice
    }, [marketDataForToken, token?.usdPrice])

    const usdValue = useMemo(() => {
      if (token.usdValue) {
        return token.usdValue
      }
      return usdPrice ? new BigNumber(usdPrice).multipliedBy(token.amount).toString() : ''
    }, [usdPrice, token.amount, token.usdValue])

    return (
      <div className='relative'>
        <div
          className={classNames('flex items-center gap-x-3 py-3 cursor-pointer', {
            'opacity-20': isSelected,
          })}
          onClick={() => onTokenSelect(token)}
        >
          <img
            src={token.img ?? defaultTokenLogo}
            onError={imgOnError(defaultTokenLogo)}
            height={40}
            width={40}
            className='rounded-full'
          />
          <Text size='md' className='font-bold text-black-100 dark:text-white-100 flex-grow'>
            {token.symbol ?? token.name}
          </Text>
          <div className='flex items-center gap-x-2.5'>
            <div className='flex flex-col items-end gap-y-0.5'>
              {!!usdValue && new BigNumber(usdValue).gt(0) && (
                <Text size='sm' className='font-bold' color='text-black-100 dark:text-white-100'>
                  {formatCurrency(new BigNumber(usdValue))}
                </Text>
              )}
              {parseFloat(token.amount) > 0 && (
                <Text size='xs' className='font-medium' color='text-gray-600 dark:text-gray-400'>
                  {formatTokenAmount(
                    token.amount,
                    sliceWord(token.symbol, 4, 4),
                    3,
                    currencyDetail[preferredCurrency].locale,
                  )}
                </Text>
              )}
            </div>
            <Info
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              size={12}
              className='text-gray-600 dark:text-gray-400'
            />
          </div>
        </div>
        {showTooltip && (
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className='px-3 absolute right-2 -top-1/2 z-10'
          >
            <div className='flex flex-col py-2 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg gap-y-2 h-[120px] w-[220px]'>
              <div className='flex justify-between'>
                <Text size='sm' className='font-medium' color='text-gray-800 dark:text-gray-200'>
                  Price
                </Text>
                <Text size='sm' className='font-medium' color='text-gray-800 dark:text-gray-200'>
                  {usdPrice ? (
                    <Text
                      size='sm'
                      className='font-medium'
                      color='text-gray-800 dark:text-gray-200'
                    >
                      {formatCurrency(new BigNumber(usdPrice), false, 6)}
                    </Text>
                  ) : (
                    <Text
                      size='sm'
                      className='font-medium'
                      color='text-gray-800 dark:text-gray-200'
                    >
                      -
                    </Text>
                  )}
                </Text>
              </div>
              <div className='flex justify-between'>
                <Text size='sm' className='font-medium' color='text-gray-800 dark:text-gray-200'>
                  1D
                </Text>
                {marketDataForToken?.price_change_percentage_24h ? (
                  <div
                    className={classNames('text-sm font-medium !leading-[18px]', {
                      'text-green-500 dark:text-green-500':
                        marketDataForToken.price_change_percentage_24h >= 0,
                      'text-red-600 dark:text-red-400':
                        marketDataForToken.price_change_percentage_24h < 0,
                    })}
                  >
                    {marketDataForToken.price_change_percentage_24h > 0 ? '+' : ''}
                    {formatPercentAmount(
                      new BigNumber(marketDataForToken.price_change_percentage_24h).toString(),
                      2,
                    )}
                    %
                  </div>
                ) : (
                  <Text size='sm' className='font-medium' color='text-gray-800 dark:text-gray-200'>
                    -
                  </Text>
                )}
              </div>
              <div className='flex justify-between'>
                <Text size='sm' className='font-medium' color='text-gray-800 dark:text-gray-200'>
                  Contract
                </Text>
                <div className='flex items-center gap-x-1'>
                  <Text size='sm' className='font-medium' color='text-gray-800 dark:text-gray-200'>
                    {sliceWord(token.skipAsset.tokenContract, 3, 3)}
                  </Text>
                  {copied ? (
                    <CheckCircle size={18} weight='fill' className='text-green-600' />
                  ) : (
                    <Copy
                      onClick={handleCopyClick}
                      size={16}
                      className='text-gray-800 dark:text-gray-200 cursor-pointer'
                    />
                  )}
                </div>
              </div>
              <div className='flex justify-between'>
                <Text size='sm' className='font-medium' color='text-gray-800 dark:text-gray-200'>
                  More Details
                </Text>
                <div onClick={handleMoreDetailsClick}>
                  <Text size='sm' className='font-medium cursor-pointer' color='text-green-600'>
                    Click here
                  </Text>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  },
)

const TokenList = observer(
  ({
    header,
    tokens,
    onTokenSelect,
    selectedToken,
    marketDataStore,
  }: {
    header: string
    tokens: SourceToken[]
    onTokenSelect: (token: SourceToken) => void
    selectedToken: SourceToken | null
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
                onTokenSelect={onTokenSelect}
                selectedToken={selectedToken}
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
  },
)

export const SelectDestinationSheet = observer(
  ({
    isOpen,
    onClose,
    destinationAssets,
    destinationToken,
    loadingTokens,
    onTokenSelect,
    compassTokenTagsStore,
    marketDataStore,
  }: SelectTokenSheetProps) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTab, setSelectedTab] = useState<TabType>(TabType.All)
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
      setSearchQuery('')
      setSelectedTab(TabType.All)
      inputRef.current?.focus()
    }, [])

    useEffect(() => {
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }, [])

    useEffect(() => {
      if (isOpen) {
        setSearchQuery('')
      }
    }, [isOpen])

    return (
      <BottomModal
        title='Select Token'
        onClose={onClose}
        isOpen={true}
        contentClassName='!bg-white-100 dark:!bg-gray-950 !overflow-hidden'
        className='!px-6 !pt-6 !pb-0'
      >
        <div className='flex flex-col gap-y-4 h-full'>
          <div className='rounded-2xl w-full flex gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 focus-within:border-green-600 border border-transparent mb-2'>
            <input
              placeholder={'Search a token by name or address'}
              className='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={inputRef}
            />

            {searchQuery.length === 0 ? (
              <img className='h-5 w-5 mt-0.5' src={Images.Misc.SearchWhiteIcon} />
            ) : (
              <img
                className='cursor-pointer h-4 w-4 mt-1'
                src={Images.Misc.CrossFilled}
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
          {loadingTokens ? (
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
              className='flex flex-col gap-y-2 pb-4 relative'
              style={{
                height: (isSidePanel() ? window.innerHeight : 600) - 200,
                overflowY: 'scroll',
              }}
            >
              {/* tabs */}
              {searchQuery.length === 0 && (
                <>
                  <div className='flex gap-x-2 pb-4 sticky z-[2] top-0 bg-white-100 dark:bg-gray-950'>
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
                          } font-medium text-xs h-[36px] px-3 rounded-full bg-gray-50 dark:bg-gray-900 border`}
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
                      onTokenSelect={onTokenSelect}
                      selectedToken={destinationToken}
                      marketDataStore={marketDataStore}
                    />
                  )}
                </>
              )}
              {/* All tokens */}
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
                  onTokenSelect={onTokenSelect}
                  selectedToken={destinationToken}
                  marketDataStore={marketDataStore}
                />
              ) : (
                <div className='py-[80px] w-full flex-col flex  justify-center items-center gap-4'>
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
                <div className='flex flex-col'>
                  <Text size='xs' className='font-bold' color='text-black-100 dark:text-white-100'>
                    Can&apos;t find your token?
                  </Text>
                  <Text size='xs' className='font-medium' color='text-gray-600 dark:text-gray-400'>
                    Search using token address
                  </Text>
                </div>
                <MagnifyingGlass size={24} className='text-black-100 dark:text-white-100' />
              </div>
            </div>
          )}
        </div>
      </BottomModal>
    )
  },
)
