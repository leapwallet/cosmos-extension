import { convertObjInQueryParams } from './index'

export const COMPASS_WALLET_CONFIG = {
  onRevCurrency: 'SEI',
  network: 'SEI',
  cryptoList: ['SEI', 'USDC'],
  networkList: ['SEI'],
}

export enum ServiceProviderEnum {
  KADO = 'kado',
}

export enum OriginWalletSourceEnum {
  LEAP = 'leap',
  COMPASS = 'compass',
}

export enum ServiceProviderBaseUrlEnum {
  KADO = 'https://app.kado.money',
}

export type BuyUrlFuncParams = {
  serviceProvider: ServiceProviderEnum
  originWalletSource: OriginWalletSourceEnum
  walletAddress: string
  providerApiKey: string
  activeChain: string
  denom: string
}

export function getBuyUrl({
  serviceProvider,
  originWalletSource,
  walletAddress,
  providerApiKey,
  activeChain,
  denom,
}: BuyUrlFuncParams) {
  let buyUrl = ''

  const LEAP_WALLET_CONFIG = {
    onRevCurrency: denom,
    network: activeChain,
  }

  let config = originWalletSource === OriginWalletSourceEnum.LEAP ? LEAP_WALLET_CONFIG : {}
  config = originWalletSource === OriginWalletSourceEnum.COMPASS ? COMPASS_WALLET_CONFIG : config

  switch (serviceProvider) {
    case ServiceProviderEnum.KADO: {
      const queryParamsObject = {
        apiKey: providerApiKey,
        theme: 'dark',
        product: 'BUY',
        onToAddress: walletAddress,
        ...config,
      }

      const baseUrl = ServiceProviderBaseUrlEnum.KADO
      const queryParams = convertObjInQueryParams(queryParamsObject)
      buyUrl = `${baseUrl}?${queryParams}`
    }
  }

  return buyUrl
}
