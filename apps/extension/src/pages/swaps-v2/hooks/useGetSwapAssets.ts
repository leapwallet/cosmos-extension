import {
  currencyDetail,
  getCoingeckoPricesStoreSnapshot,
  getKeyToUseForDenoms,
  LeapWalletApi,
  sortTokenBalances,
  Token,
  useIbcTraceStore,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AutoFetchedCW20DenomsStore } from '@leapwallet/cosmos-wallet-store'
import { SkipSupportedAsset } from '@leapwallet/elements-hooks'
// import { captureException } from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
// import axios from 'axios'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { getSortFnBasedOnWhiteListing } from '../utils'

export function useGetSwapAssets(
  denoms: DenomsRecord,
  allAssets: Array<Token>,
  allAssetsLoading: boolean,
  swapChain: SourceChain | undefined,
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore,
  addSkipAssets?: { [key: string]: SkipSupportedAsset[] },
  filterBalanceTokens = false,
  isChainAbstractionView?: boolean,
  chainsToShow?: SourceChain[],
) {
  const chainInfos = useChainInfos()

  const skipAssets = useMemo(() => {
    if (isChainAbstractionView && addSkipAssets) {
      if (chainsToShow && chainsToShow.length > 0) {
        const chainIdsSupported = chainsToShow.map((chain) => chain.chainId)
        return Object.keys(addSkipAssets)
          .filter((chainId) => chainIdsSupported.includes(chainId))
          .map((chainId) => addSkipAssets[chainId])
          .flat()
      }
      return Object.values(addSkipAssets).flat()
    }
    return addSkipAssets?.[swapChain?.chainId ?? '']
  }, [isChainAbstractionView, addSkipAssets, swapChain?.chainId, chainsToShow])

  const assetsMap = useMemo(() => {
    if (!allAssetsLoading && allAssets && allAssets.length > 0) {
      return allAssets.reduce((acc, asset) => {
        if (!asset.tokenBalanceOnChain) return acc
        const denom = asset.ibcDenom || asset.coinMinimalDenom
        const chainId = chainInfos[asset.tokenBalanceOnChain].chainId
        acc[`${denom}-${chainId}`] = asset
        return acc
      }, {} as { [key: string]: Token })
    }
    return {}
  }, [allAssets, chainInfos, allAssetsLoading])

  const combinedDenoms = useMemo(() => {
    return denoms
  }, [denoms])

  const [preferredCurrency] = useUserPreferredCurrency()
  const { ibcTraceData } = useIbcTraceStore()
  const selectedNetwork = useSelectedNetwork()

  const isQueryEnabled = useMemo(() => {
    return !!swapChain && !!skipAssets?.length && !allAssetsLoading
  }, [swapChain, skipAssets?.length, allAssetsLoading])

  return useQuery(
    [
      `swap-assets`,
      skipAssets,
      preferredCurrency,
      assetsMap,
      combinedDenoms,
      ibcTraceData,
      filterBalanceTokens,
    ],
    async function () {
      if (skipAssets && skipAssets.length > 0) {
        const _swapAssets: SourceToken[] = []
        const preferredCurrencyPointer = currencyDetail[preferredCurrency].currencyPointer
        const coingeckoPrices = await getCoingeckoPricesStoreSnapshot()
        const needToFetchUsdPriceFor: { [key: string]: string[] } = {}
        //const needToFetchIbcSourceChainsFor: { denom: string; chain_id: string }[] = []

        for (const skipAsset of skipAssets) {
          const formattedSkipAssetDenom = skipAsset.denom.replace(/(cw20:|erc20\/)/g, '') as string
          const token = assetsMap[`${formattedSkipAssetDenom}-${skipAsset.chainId}`]

          if (token) {
            const decimals = skipAsset.decimals || token.coinDecimals
            const _skipAsset: SkipSupportedAsset = {
              ...skipAsset,
              coingeckoId: token.coinGeckoId ?? skipAsset.coingeckoId,
              isCw20: skipAsset.isCw20,
            }
            const updatedSkipAsset: SkipSupportedAsset = decimals
              ? {
                  ..._skipAsset,
                  decimals,
                }
              : _skipAsset
            _swapAssets.push({
              ...token,
              skipAsset: updatedSkipAsset,
            })
          }
          if (!token && !filterBalanceTokens) {
            const _baseDenom = getKeyToUseForDenoms(skipAsset.originDenom, skipAsset.originChainId)
            const denomInfo = combinedDenoms[_baseDenom]

            if (denomInfo) {
              if (denomInfo?.coinDecimals === undefined) {
                throw new Error(`coinDecimals is undefined for ${denomInfo?.coinDenom}`)
              }

              let usdPrice = '0'

              if (denomInfo) {
                const _chainId =
                  selectedNetwork === 'mainnet'
                    ? chainInfos[denomInfo.chain as SupportedChain]?.chainId
                    : chainInfos[denomInfo.chain as SupportedChain]?.testnetChainId
                const alternatePriceKey = `${_chainId}-${denomInfo.coinMinimalDenom}`

                if (
                  coingeckoPrices[preferredCurrencyPointer] &&
                  (coingeckoPrices[preferredCurrencyPointer][denomInfo.coinGeckoId] ||
                    coingeckoPrices[preferredCurrencyPointer][alternatePriceKey])
                ) {
                  if (coingeckoPrices[preferredCurrencyPointer][denomInfo.coinGeckoId]) {
                    usdPrice = String(
                      coingeckoPrices[preferredCurrencyPointer][denomInfo.coinGeckoId],
                    )
                  } else {
                    usdPrice = String(coingeckoPrices[preferredCurrencyPointer][alternatePriceKey])
                  }
                } else if (denomInfo.coinGeckoId) {
                  if (needToFetchUsdPriceFor[denomInfo.chain]) {
                    needToFetchUsdPriceFor[denomInfo.chain].push(denomInfo.coinGeckoId)
                  } else {
                    needToFetchUsdPriceFor[denomInfo.chain] = [denomInfo.coinGeckoId]
                  }
                }
              }
              if (!skipAsset.decimals) {
                skipAsset.decimals = denomInfo?.coinDecimals
              }
              let asset = {
                skipAsset,
                name: denomInfo?.name,
                amount: '0',
                symbol: denomInfo?.coinDenom ?? '',
                coinMinimalDenom: denomInfo?.coinMinimalDenom ?? '',
                img: denomInfo?.icon ?? '',
                usdValue: '',
                usdPrice,
                coinDecimals: denomInfo?.coinDecimals ?? 6,
                coinGeckoId: denomInfo?.coinGeckoId ?? '',
                chain: denomInfo?.chain,
              } as SourceToken

              if (skipAsset.denom.includes('ibc/')) {
                const trace = ibcTraceData[skipAsset.denom]
                let ibcChainInfo = {
                  pretty_name: 'transfer',
                  icon: '',
                  channelId: skipAsset?.denom?.split('/')[1] ?? '',
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
                    pretty_name: skipAsset.originChainId,
                    icon: '',
                    name: skipAsset.originChainId,
                    channelId: skipAsset?.denom?.split('/')[1] ?? '',
                  }
                }
                // else {
                //   needToFetchIbcSourceChainsFor.push({
                //     denom: skipAsset.denom,
                //     chain_id: String(swapChain?.chainId ?? ''),
                //   })
                // }

                asset = {
                  ...asset,
                  ibcDenom: skipAsset.denom,
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
              const asset = {
                skipAsset,
                name: skipAsset.name,
                amount: '0',
                symbol: skipAsset.symbol,
                coinMinimalDenom: skipAsset.originDenom,
                img: skipAsset.logoUri,
                usdValue: '',
                usdPrice: '',
                decimals: skipAsset.decimals,
                coinGeckoId: skipAsset?.coingeckoId ?? '',
                chain: Object.values(chainInfos).find(
                  (chain) => chain.chainId === skipAsset.originChainId,
                )?.key as SupportedChain,
              } as SourceToken

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

        /* no need to explicitly fetch ibc source chain info, if trace is available it will be available in the asset list */

        // try {
        //   const {
        //     data: { origin_assets },
        //   } = await axios.post('https://api.skip.money/v1/fungible/ibc_origin_assets', {
        //     assets: needToFetchIbcSourceChainsFor,
        //   })

        //   needToFetchIbcSourceChainsFor.forEach((ibcAsset, index) => {
        //     const destinationAsset = _swapAssets.find((asset) => asset.ibcDenom === ibcAsset.denom)

        //     if (destinationAsset?.ibcChainInfo) {
        //       destinationAsset.ibcChainInfo.name = origin_assets[index].asset.origin_chain_id
        //       destinationAsset.ibcChainInfo.pretty_name = origin_assets[index].asset.origin_chain_id
        //     }
        //   })
        // } catch (error) {
        //   captureException(error)
        // }

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
