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
import { SkipSupportedAsset, useAllSkipAssets } from '@leapwallet/elements-hooks'
import { captureException } from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { getSortFnBasedOnWhiteListing } from '../utils'

const useAllSkipAssetsParams = {
  includeCW20Assets: true,
  includeNoMetadataAssets: false,
}

export function useGetSwapAssets(
  denoms: DenomsRecord,
  allAssets: Array<Token>,
  allAssetsLoading: boolean,
  swapChain: SourceChain | undefined,
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore,
) {
  const { data: addSkipAssets } = useAllSkipAssets(useAllSkipAssetsParams)

  const skipAssets = useMemo(() => {
    return addSkipAssets?.[swapChain?.chainId ?? '']
  }, [addSkipAssets, swapChain])

  const autoFetchedCW20Tokens = autoFetchedCW20DenomsStore.getAutoFetchedCW20DenomsForChain(
    (swapChain?.chainId ?? '') as SupportedChain,
  )
  const combinedDenoms = useMemo(() => {
    return { ...denoms, ...autoFetchedCW20Tokens }
  }, [denoms, autoFetchedCW20Tokens])

  const [preferredCurrency] = useUserPreferredCurrency()
  const { ibcTraceData } = useIbcTraceStore()
  const chainInfos = useChainInfos()
  const selectedNetwork = useSelectedNetwork()

  const isQueryEnabled = useMemo(() => {
    return !!swapChain && !!skipAssets?.length && !allAssetsLoading
  }, [swapChain, skipAssets?.length, allAssetsLoading])

  return useQuery(
    [
      `${swapChain?.key}-swap-assets`,
      skipAssets,
      preferredCurrency,
      allAssets,
      combinedDenoms,
      swapChain,
      ibcTraceData,
    ],
    async function () {
      if (swapChain && skipAssets && skipAssets.length > 0) {
        const _swapAssets: SourceToken[] = []
        const preferredCurrencyPointer = currencyDetail[preferredCurrency].currencyPointer
        const coingeckoPrices = await getCoingeckoPricesStoreSnapshot()
        const needToFetchUsdPriceFor: { [key: string]: string[] } = {}
        const needToFetchIbcSourceChainsFor: { denom: string; chain_id: string }[] = []

        for (const skipAsset of skipAssets) {
          const token = allAssets.find((asset) =>
            [asset.ibcDenom, asset.coinMinimalDenom].includes(skipAsset.denom.replace('cw20:', '')),
          )

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
          } else {
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

              const decimals = skipAsset.decimals || denomInfo.coinDecimals
              const updatedSkipAsset = decimals ? { ...skipAsset, decimals } : skipAsset
              let asset = {
                skipAsset: updatedSkipAsset,
                name: denomInfo?.name,
                amount: '0',
                symbol: denomInfo?.coinDenom ?? '',
                coinMinimalDenom: denomInfo?.coinMinimalDenom ?? '',
                img: denomInfo?.icon ?? '',
                usdValue: '',
                usdPrice,
                coinDecimals: denomInfo?.coinDecimals ?? 6,
                coinGeckoId: denomInfo?.coinGeckoId ?? '',
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
                  needToFetchIbcSourceChainsFor.push({
                    denom: skipAsset.denom,
                    chain_id: String(swapChain?.chainId ?? ''),
                  })
                }

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
            }
          }
        }

        const platformTokenAddresses = Object.entries(needToFetchUsdPriceFor).map(
          ([key, value]) => ({
            platform: key as SupportedChain,
            tokenAddresses: value,
          }),
        )

        const marketPrices = await LeapWalletApi.operateMarketPricesV2(
          platformTokenAddresses,
          preferredCurrencyPointer,
        )

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

        try {
          const {
            data: { origin_assets },
          } = await axios.post('https://api.skip.money/v1/fungible/ibc_origin_assets', {
            assets: needToFetchIbcSourceChainsFor,
          })

          needToFetchIbcSourceChainsFor.forEach((ibcAsset, index) => {
            const destinationAsset = _swapAssets.find((asset) => asset.ibcDenom === ibcAsset.denom)

            if (destinationAsset?.ibcChainInfo) {
              destinationAsset.ibcChainInfo.name = origin_assets[index].asset.origin_chain_id
              destinationAsset.ibcChainInfo.pretty_name = origin_assets[index].asset.origin_chain_id
            }
          })
        } catch (error) {
          captureException(error)
        }
        const autoFetchedTokensList = Object.keys(autoFetchedCW20Tokens)

        const nativeDenoms = Object.keys(chainInfos[swapChain.key]?.nativeDenoms ?? {})

        return {
          assets: sortTokenBalances(_swapAssets).sort(
            getSortFnBasedOnWhiteListing(autoFetchedTokensList, nativeDenoms),
          ) as SourceToken[],
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
