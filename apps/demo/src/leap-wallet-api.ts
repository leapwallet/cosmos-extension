/* eslint-disable @typescript-eslint/no-namespace */
import {
  CosmosBlockchain,
  CosmosTxRequest,
  CosmosTxType,
  Currency,
  LeapApi,
  MarketCapsResponse,
  MarketChartPrice,
  MarketPercentageChangesResponse,
  MarketPricesResponse,
  Platform,
} from '@leapwallet/cosmos-wallet-hooks/dist/connectors'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { format } from 'date-fns'
import { useMemo } from 'react'

import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useCurrentNetwork } from '~/hooks/settings/use-current-network'
import { useAddress } from '~/hooks/wallet/use-address'

export namespace LeapWalletApi {
  const leapApi = new LeapApi('https://api.leapwallet.io')

  const platforms: Record<string, Platform> = {
    cosmoshub: Platform.CosmosHub,
    cosmos: Platform.CosmosHub, // Keep this
    osmosis: Platform.Osmosis,
    secret: Platform.Secret,
    juno: Platform.Juno,
    stargaze: Platform.Stargaze,
    agoric: Platform.Agoric,
    terra: Platform.Terra,
    kava: Platform.Kava,
    injective: Platform.Injective,
    evmos: Platform.Evmos,
    akash: Platform.Akash,
    irisnet: Platform.IrisNet,
    persistence: Platform.Persistence,
    starname: Platform.Starname,
    sommelier: Platform.Sommelier,
    comdex: Platform.Comdex,
    umee: Platform.Umee,
    sifchain: Platform.Sifchain,
    kujira: Platform.Kujira,
    bitsong: Platform.BitSong,
    sentinel: Platform.Sentinel,
    shentu: Platform.Shentu,
    bandchain: Platform.Band,
    bostrom: Platform.Bostrom,
    cerberus: Platform.Cerberus,
    cheqd: Platform.Cheqd,
    chihuahua: Platform.Chihuahua,
    decentr: Platform.Decentr,
    desmos: Platform.Desmos,
    dig: Platform.Dig,
    emoney: Platform.EMoney,
    assetmantle: Platform.AssetMantle,
    bitcanna: Platform.BitCanna,
    crescent: Platform.Crescent,
    canto: Platform.Canto,
  }

  export type LogInfo = {
    readonly txHash: string
    readonly txType: CosmosTxType
  }

  export type OperateCosmosTx = (info: LogInfo) => Promise<void>

  /** @returns Prices of `tokens` in `Currency`. */
  export async function operateMarketPrices(
    tokens: string[],
    chain: SupportedChain,
    currencySelected?: Currency,
  ): Promise<MarketPricesResponse> {
    try {
      if (!platforms[chain]) {
        throw new Error()
      }
      return await leapApi.getMarketPrices({
        platform: platforms[chain],
        tokens: tokens,
        currency: currencySelected,
      })
    } catch (_) {
      return {}
    }
  }

  export async function operateMarketPercentChanges(tokens: string[], chain: SupportedChain) {
    try {
      if (platforms[chain]) {
        return await leapApi.getMarketPercentageChanges({ platform: platforms[chain], tokens })
      } else {
        return {}
      }
    } catch (_) {
      return {}
    }
  }

  export async function getAssetDetails(
    token: string,
    chain: SupportedChain,
    preferredCurrency: Currency,
  ): Promise<{
    details: string
    price: number
    priceChange: number
    marketCap: number
  }> {
    if (!platforms[chain]) {
      throw new Error()
    }

    const details = await leapApi.getMarketDescription({
      platform: platforms[chain],
      token: token,
    })
    const priceRes: MarketPricesResponse = await operateMarketPrices(
      [token],
      chain,
      preferredCurrency,
    )
    const priceChangeRes: MarketPercentageChangesResponse = await operateMarketPercentChanges(
      [token],
      chain,
    )
    const marketCapRes: MarketCapsResponse = await leapApi.getMarketCaps({
      platform: platforms[chain],
      tokens: [token],
      currency: preferredCurrency,
    })

    const price = Object.values(priceRes)[0]
    const priceChange = Object.values(priceChangeRes)[0]
    const marketCap = Object.values(marketCapRes)[0]

    return {
      details: details ?? '',
      price,
      priceChange,
      marketCap,
    }
  }

  export async function getMarketChart(
    token: string,
    chain: SupportedChain,
    days: number,
    currency: Currency,
  ): Promise<{ data: MarketChartPrice[]; minMax: MarketChartPrice[] }> {
    if (!platforms[chain]) {
      throw new Error()
    }
    const data = await leapApi.getMarketChart({
      platform: platforms[chain],
      token: token,
      days: days,
      currency: currency,
    })

    const minMax = data.reduce((acc: MarketChartPrice[], val) => {
      acc[0] = acc[0] === undefined || val.price < acc[0].price ? val : acc[0]
      acc[1] = acc[1] === undefined || val.price > acc[1].price ? val : acc[1]
      return acc
    }, [])

    return {
      data: data.map((v) => {
        const date = new Date(v.date)
        return {
          timestamp: v.date,
          date: format(date, 'H:mma MMM do, yy'),
          smoothedPrice: v.smoothedPrice,
          price: v.smoothedPrice - minMax[0].price, //v.price - minMax[0].price,
        }
      }),
      minMax,
    }
  }

  // eslint-disable-next-line no-inner-declarations
  function getCosmosNetwork(activeChain: SupportedChain) {
    const blockchains: Record<SupportedChain, CosmosBlockchain> = {
      akash: CosmosBlockchain.Akash,
      assetmantle: CosmosBlockchain.AssetMantle,
      axelar: CosmosBlockchain.Axelar,
      comdex: CosmosBlockchain.Comdex,
      crescent: CosmosBlockchain.Cresent,
      cryptoorg: CosmosBlockchain.CryptoOrgChain,
      emoney: CosmosBlockchain.EMoney,
      irisnet: CosmosBlockchain.IrisNet,
      juno: CosmosBlockchain.Juno,
      osmosis: CosmosBlockchain.Osmosis,
      persistence: CosmosBlockchain.Persistence,
      secret: CosmosBlockchain.Secret,
      sifchain: CosmosBlockchain.Sifchain,
      sommelier: CosmosBlockchain.Sommelier,
      stargaze: CosmosBlockchain.Stargaze,
      starname: CosmosBlockchain.Starname,
      umee: CosmosBlockchain.Umee,
      cosmos: CosmosBlockchain.CosmosHub,
      injective: CosmosBlockchain.Injective,
      kujira: CosmosBlockchain.Kujira,
      sei: CosmosBlockchain.Sei,
      mars: CosmosBlockchain.CosmosHub,
      stride: CosmosBlockchain.Stride,
      agoric: CosmosBlockchain.Agoric,
      cheqd: CosmosBlockchain.Cheqd,
      likecoin: CosmosBlockchain.LikeCoin,
      gravitybridge: CosmosBlockchain.GravityBridge,
      chihuahua: CosmosBlockchain.Chihuahua,
      fetchhub: CosmosBlockchain.FetchHub,
      teritori: CosmosBlockchain.Teritori,
      desmos: CosmosBlockchain.Desmos,
      jackal: CosmosBlockchain.Jackal,
      bitsong: CosmosBlockchain.BitSong,
      evmos: CosmosBlockchain.Evmos,
      bitcanna: CosmosBlockchain.Bitcanna,
      canto: CosmosBlockchain.Canto,
      decentr: CosmosBlockchain.Decentr,
    }
    return blockchains[activeChain]
  }

  export function useOperateCosmosTx(): OperateCosmosTx {
    const activeChain = useActiveChain()
    const address = useAddress()
    const selectedNetwork = useCurrentNetwork()

    return useMemo(() => {
      return async ({ txHash, txType }) => {
        const logReq = {
          txHash,
          blockchain: getCosmosNetwork(activeChain),
          isMainnet: selectedNetwork === 'mainnet',
          wallet: address,
          walletAddress: address,
          type: txType,
        } as CosmosTxRequest
        try {
          await leapApi.operateCosmosTx(logReq)
        } catch (err) {
          console.error(err)
        }
      }
    }, [activeChain, address, selectedNetwork])
  }
}
