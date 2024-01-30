import {
  currencyDetail,
  getCoingeckoPricesStoreSnapshot,
  LeapWalletApi,
  sortTokenBalances,
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
import { SourceChain, SourceToken } from 'types/swap'

export function useGetDestinationAssets(destinationChain: SourceChain | undefined) {
  const { allAssets } = useGetTokenBalances((destinationChain?.key ?? '') as SupportedChain)
  const { data: destinationAssets } = useSkipAssets((destinationChain?.chainId ?? '') as string)
  const [preferredCurrency] = useUserPreferredCurrency()
  const denoms = useDenoms()
  const { ibcTraceData } = useIbcTraceStore()

  return useQuery(
    [
      'get-destination-assets-swap',
      destinationAssets,
      preferredCurrency,
      allAssets,
      denoms,
      destinationChain,
      ibcTraceData,
    ],
    async function () {
      if (destinationAssets && destinationAssets.success && destinationAssets.assets.length > 0) {
        const _destinationAssets: SourceToken[] = []
        const coingeckoPrices = await getCoingeckoPricesStoreSnapshot()
        const needToFetchUsdPriceFor: { [key: string]: string[] } = {}
        const needToFetchIbcSourceChainsFor: { denom: string; chain_id: string }[] = []

        for (const skipAsset of destinationAssets.assets) {
          const token = allAssets.find((asset) =>
            [asset.ibcDenom, asset.coinMinimalDenom].includes(skipAsset.denom),
          )

          if (token) {
            _destinationAssets.push({
              ...token,
              skipAsset,
            })
          } else {
            const denomInfo = denoms[skipAsset.originDenom]

            if (denomInfo) {
              if (denomInfo?.coinDecimals === undefined) {
                throw new Error(`coinDecimals is undefined for ${denomInfo?.coinDenom}`)
              }

              let usdPrice = '0'

              if (denomInfo?.coinGeckoId) {
                if (coingeckoPrices[denomInfo.coinGeckoId]) {
                  usdPrice = String(coingeckoPrices[denomInfo.coinGeckoId])
                } else {
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
                  channelId: skipAsset?.denomTracePath?.split('/')[1] ?? '',
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
          currencyDetail[preferredCurrency].currencyPointer,
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

        return sortTokenBalances(_destinationAssets) as SourceToken[]
      }

      return []
    },
  )
}
