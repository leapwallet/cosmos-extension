import {
  currencyDetail,
  getCoingeckoPricesStoreSnapshot,
  getKeyToUseForDenoms,
  LeapWalletApi,
  sortTokenBalances,
  useAutoFetchedCW20Tokens,
  useDenoms,
  useGetTokenBalances,
  useIbcTraceStore,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useSkipAssets } from '@leapwallet/elements-hooks'
import { captureException } from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { SourceChain, SourceToken } from 'types/swap'

import { getSortFnBasedOnWhiteListing } from '../utils'
import { useInitializeCW20TokensForChain } from './useInitializeCW20TokensForChain'
import { QUERY_GET_DESTINATION_ASSETS_SWAP } from './useInvalidateSwapAssetsQueries'

export function useGetDestinationAssets(destinationChain: SourceChain | undefined) {
  const { allAssets, refetchBalances } = useGetTokenBalances(
    (destinationChain?.key ?? '') as SupportedChain,
  )
  const { data: destinationAssets } = useSkipAssets((destinationChain?.chainId ?? '') as string, {
    includeCW20Assets: true,
  })
  const denoms = useDenoms()
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens(destinationChain?.key ?? undefined)
  const combinedDenoms = { ...denoms, ...autoFetchedCW20Tokens }
  const [preferredCurrency] = useUserPreferredCurrency()
  const { ibcTraceData } = useIbcTraceStore()
  const chainInfos = useChainInfos()
  const selectedNetwork = useSelectedNetwork()
  useInitializeCW20TokensForChain(destinationChain)

  return useQuery(
    [
      `${destinationChain?.key}-${QUERY_GET_DESTINATION_ASSETS_SWAP}`,
      destinationAssets,
      preferredCurrency,
      allAssets,
      combinedDenoms,
      destinationChain,
      ibcTraceData,
      refetchBalances,
    ],
    async function () {
      if (destinationAssets && destinationAssets.success && destinationAssets.assets.length > 0) {
        const _destinationAssets: SourceToken[] = []
        const preferredCurrencyPointer = currencyDetail[preferredCurrency].currencyPointer
        const coingeckoPrices = await getCoingeckoPricesStoreSnapshot()
        const needToFetchUsdPriceFor: { [key: string]: string[] } = {}
        const needToFetchIbcSourceChainsFor: { denom: string; chain_id: string }[] = []

        for (const skipAsset of destinationAssets.assets) {
          const token = allAssets.find((asset) =>
            [asset.ibcDenom, asset.coinMinimalDenom].includes(skipAsset.denom.replace('cw20:', '')),
          )

          if (token) {
            _destinationAssets.push({
              ...token,
              skipAsset,
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
                    chain_id: String(destinationChain?.chainId ?? ''),
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

              _destinationAssets.push(asset as SourceToken)
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

        _destinationAssets.forEach((asset) => {
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
            const destinationAsset = _destinationAssets.find(
              (asset) => asset.ibcDenom === ibcAsset.denom,
            )

            if (destinationAsset?.ibcChainInfo) {
              destinationAsset.ibcChainInfo.name = origin_assets[index].asset.origin_chain_id
              destinationAsset.ibcChainInfo.pretty_name = origin_assets[index].asset.origin_chain_id
            }
          })
        } catch (error) {
          captureException(error)
        }
        const autoFetchedTokensList = Object.keys(autoFetchedCW20Tokens)

        return {
          assets: sortTokenBalances(_destinationAssets).sort(
            getSortFnBasedOnWhiteListing(autoFetchedTokensList),
          ) as SourceToken[],
          refetchBalances,
        }
      }

      return { assets: [], refetchBalances }
    },
  )
}
