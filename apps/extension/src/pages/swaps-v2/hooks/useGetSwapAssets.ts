import {
  currencyDetail,
  getKeyToUseForDenoms,
  LeapWalletApi,
  sortTokenBalances,
  Token,
  useIbcTraceStore,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { useNonNativeCustomChains } from 'hooks'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { MergedAsset } from './useAssets'

export function useGetSwapAssets(
  combinedDenoms: DenomsRecord,
  coingeckoPrices: Record<string, number> | null,
  allAssets: Array<Token>,
  allAssetsLoading: boolean,
  swapChain: SourceChain | undefined,
  addMergedAssets?: { [key: string]: MergedAsset[] },
  filterBalanceTokens = false,
  isChainAbstractionView?: boolean,
  chainsToShow?: SourceChain[],
) {
  const chainInfos = useChainInfos()
  const customChains = useNonNativeCustomChains()

  const mergedAssets = useMemo(() => {
    if (isChainAbstractionView && addMergedAssets) {
      if (chainsToShow && chainsToShow.length > 0) {
        const chainIdsSupported = chainsToShow.map((chain) => chain.chainId)
        return Object.keys(addMergedAssets)
          .filter((chainId) => chainIdsSupported.includes(chainId))
          .map((chainId) => addMergedAssets[chainId])
          .flat()
      }
      return Object.values(addMergedAssets).flat()
    }
    return addMergedAssets?.[swapChain?.chainId ?? '']
  }, [isChainAbstractionView, addMergedAssets, swapChain?.chainId, chainsToShow])

  const assetsMap = useMemo(() => {
    if (!allAssetsLoading && allAssets && allAssets.length > 0) {
      const chainsData = { ...customChains, ...chainInfos }
      return allAssets.reduce((acc, asset) => {
        if (!asset.tokenBalanceOnChain) return acc
        const denom = asset.ibcDenom || asset.coinMinimalDenom
        const chainId = chainsData[asset.tokenBalanceOnChain].chainId
        acc[`${denom}-${chainId}`] = asset
        return acc
      }, {} as { [key: string]: Token })
    }
    return {}
  }, [allAssetsLoading, allAssets, customChains, chainInfos])

  const [preferredCurrency] = useUserPreferredCurrency()
  const { ibcTraceData } = useIbcTraceStore()
  const selectedNetwork = useSelectedNetwork()

  const isQueryEnabled = useMemo(() => {
    return !!swapChain && !!mergedAssets?.length && !allAssetsLoading
  }, [swapChain, mergedAssets?.length, allAssetsLoading])

  return useQuery(
    [
      `swap-assets`,
      mergedAssets,
      preferredCurrency,
      assetsMap,
      combinedDenoms,
      ibcTraceData,
      filterBalanceTokens,
      coingeckoPrices,
    ],
    async function () {
      if (mergedAssets && mergedAssets.length > 0) {
        const _swapAssets: SourceToken[] = []
        const preferredCurrencyPointer = currencyDetail[preferredCurrency].currencyPointer
        const needToFetchUsdPriceFor: { [key: string]: string[] } = {}
        //const needToFetchIbcSourceChainsFor: { denom: string; chain_id: string }[] = []

        for (const mergedAsset of mergedAssets) {
          let formattedMergedAssetDenom = mergedAsset.denom.replace(
            /(cw20:|erc20\/)/g,
            '',
          ) as string

          if (formattedMergedAssetDenom === 'ethereum-native') {
            formattedMergedAssetDenom = 'wei'
          }
          let token =
            assetsMap[`${formattedMergedAssetDenom}-${mergedAsset.chainId}`] ||
            assetsMap[`${formattedMergedAssetDenom.toLowerCase()}-${mergedAsset.chainId}`]

          if (!token && mergedAsset.evmTokenContract) {
            token =
              assetsMap[`${mergedAsset.evmTokenContract}-${mergedAsset.chainId}`] ||
              assetsMap[`${mergedAsset.evmTokenContract.toLowerCase()}-${mergedAsset.chainId}`]
          }

          if (token) {
            const decimals = mergedAsset.decimals ?? token.coinDecimals
            const _mergedAsset: MergedAsset = {
              ...mergedAsset,
              coingeckoId: token.coinGeckoId ?? mergedAsset.coingeckoId,
              isCw20: mergedAsset.isCw20,
            }

            let denomInfo
            if (mergedAsset.evmTokenContract) {
              denomInfo = combinedDenoms[mergedAsset.evmTokenContract]
            }
            if (!denomInfo) {
              denomInfo = combinedDenoms[mergedAsset.originDenom]
            }
            const updatedMergedAsset: MergedAsset = decimals
              ? {
                  ..._mergedAsset,
                  decimals,
                }
              : _mergedAsset

            _swapAssets.push({
              ...token,
              skipAsset: updatedMergedAsset,
              img: token?.img || denomInfo?.icon || mergedAsset.logoUri || '',
              coinGeckoId:
                token?.coinGeckoId || denomInfo?.coinGeckoId || mergedAsset.coingeckoId || '',
            })
          }
          if (!token && !filterBalanceTokens) {
            const _baseDenom = getKeyToUseForDenoms(
              mergedAsset.originDenom,
              mergedAsset.originChainId,
            )
            let denomInfo
            if (mergedAsset.evmTokenContract) {
              denomInfo = combinedDenoms[mergedAsset.evmTokenContract]
            }
            if (!denomInfo) {
              denomInfo = combinedDenoms[_baseDenom]
            }

            if (denomInfo) {
              if (denomInfo?.coinDecimals === undefined) {
                throw new Error(`coinDecimals is undefined for ${denomInfo?.coinDenom}`)
              }

              let usdPrice: number | undefined

              if (denomInfo) {
                const _chainId =
                  selectedNetwork === 'mainnet'
                    ? chainInfos[denomInfo.chain as SupportedChain]?.chainId
                    : chainInfos[denomInfo.chain as SupportedChain]?.testnetChainId
                const alternatePriceKey = `${_chainId}-${denomInfo.coinMinimalDenom}`
                const alternateEvmPriceKey = `${_chainId}-${mergedAsset.evmTokenContract}`

                if (coingeckoPrices) {
                  if (coingeckoPrices[denomInfo.coinGeckoId]) {
                    usdPrice = coingeckoPrices[denomInfo.coinGeckoId]
                  }
                  if (!usdPrice) {
                    usdPrice =
                      coingeckoPrices[alternatePriceKey] ||
                      coingeckoPrices[alternatePriceKey.toLowerCase()]
                  }
                  if (!usdPrice && mergedAsset.evmTokenContract) {
                    usdPrice =
                      coingeckoPrices[alternateEvmPriceKey] ||
                      coingeckoPrices[alternateEvmPriceKey.toLowerCase()]
                  }
                }
                if (!usdPrice && denomInfo.coinGeckoId) {
                  if (needToFetchUsdPriceFor[denomInfo.chain]) {
                    needToFetchUsdPriceFor[denomInfo.chain].push(denomInfo.coinGeckoId)
                  } else {
                    needToFetchUsdPriceFor[denomInfo.chain] = [denomInfo.coinGeckoId]
                  }
                }
              }
              if (!mergedAsset.decimals) {
                mergedAsset.decimals = denomInfo?.coinDecimals
              }
              let asset: SourceToken = {
                skipAsset: mergedAsset,
                name: denomInfo?.name,
                amount: '0',
                symbol: denomInfo?.coinDenom ?? '',
                coinMinimalDenom: denomInfo?.coinMinimalDenom ?? '',
                img: denomInfo?.icon ?? mergedAsset.logoUri ?? '',
                usdValue: '',
                usdPrice: usdPrice ? String(usdPrice) : '0',
                coinDecimals: denomInfo?.coinDecimals ?? 6,
                coinGeckoId: denomInfo?.coinGeckoId ?? mergedAsset.coingeckoId ?? '',
                chain: denomInfo?.chain,
              }

              if (mergedAsset.denom.includes('ibc/')) {
                const trace = ibcTraceData[mergedAsset.denom]
                let ibcChainInfo = {
                  pretty_name: 'transfer',
                  icon: '',
                  channelId: mergedAsset?.denom?.split('/')[1] ?? '',
                  name: 'transfer',
                }

                if (trace) {
                  ibcChainInfo = {
                    pretty_name: trace?.originChainId,
                    icon: '',
                    name: trace?.originChainId,
                    channelId: trace.channelId,
                  }
                } else {
                  ibcChainInfo = {
                    pretty_name: mergedAsset.originChainId,
                    icon: '',
                    name: mergedAsset.originChainId,
                    channelId: mergedAsset?.denom?.split('/')[1] ?? '',
                  }
                }

                asset = {
                  ...asset,
                  ibcDenom: mergedAsset.denom,
                  ibcChainInfo,
                }
              } else {
                asset = {
                  ...asset,
                  ibcDenom: '',
                }
              }

              _swapAssets.push(asset as SourceToken)
            } else {
              let usdPrice: number | undefined
              const key = getKeyToUseForDenoms(mergedAsset.originDenom, mergedAsset.originChainId)
              const alternatePriceKey = `${mergedAsset.originChainId}-${key}`
              const alternateEvmPriceKey = `${mergedAsset.originChainId}-${mergedAsset.evmTokenContract}`

              if (coingeckoPrices) {
                if (mergedAsset.coingeckoId && coingeckoPrices[mergedAsset.coingeckoId]) {
                  usdPrice = coingeckoPrices[mergedAsset.coingeckoId]
                }
                if (!usdPrice) {
                  usdPrice =
                    coingeckoPrices[alternatePriceKey] ||
                    coingeckoPrices[alternatePriceKey.toLowerCase()]
                }
                if (!usdPrice && mergedAsset.evmTokenContract) {
                  usdPrice =
                    coingeckoPrices[alternateEvmPriceKey] ||
                    coingeckoPrices[alternateEvmPriceKey.toLowerCase()]
                }
              }
              const asset: SourceToken = {
                skipAsset: mergedAsset,
                name: mergedAsset.name ?? '',
                amount: '0',
                symbol: mergedAsset.symbol,
                coinMinimalDenom: mergedAsset.originDenom,
                img: mergedAsset.logoUri,
                usdValue: '',
                usdPrice: usdPrice ? String(usdPrice) : '0',
                coinDecimals: mergedAsset.decimals,
                coinGeckoId: mergedAsset?.coingeckoId ?? '',
                chain: Object.values(chainInfos).find(
                  (chain) => chain.chainId === mergedAsset.originChainId,
                )?.key as SupportedChain,
              }

              _swapAssets.push(asset)
            }
          }
        }

        const platformTokenAddresses = Object.entries(needToFetchUsdPriceFor).map(
          ([key, value]) => ({
            platform: key as SupportedChain,
            tokenAddresses: value,
          }),
        )

        LeapWalletApi.operateMarketPricesV2(platformTokenAddresses, preferredCurrencyPointer).then(
          (marketPrices) => {
            _swapAssets.forEach((asset) => {
              if (asset.coinGeckoId) {
                for (const marketPrice of Object.values(marketPrices)) {
                  if (marketPrice[asset.coinGeckoId]) {
                    asset.usdPrice = String(marketPrice[asset.coinGeckoId])
                    break
                  }
                }
              }
            })
          },
        )

        const sortedTokens = sortTokenBalances(_swapAssets) as SourceToken[]
        return {
          assets: sortedTokens as SourceToken[],
        }
      }

      return {
        assets: [],
      }
    },
    {
      enabled: isQueryEnabled,
    },
  )
}
