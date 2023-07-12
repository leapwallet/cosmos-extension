import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'

export namespace Colors {
  export const cosmosPrimary = '#754F9C'
  export const juno = '#E18881'
  export const gray900 = '#212121'
  export const gray400 = '#9E9E9E'
  export const gray300 = '#B8B8B8'
  export const gray800 = '#383838'
  export const green600 = '#29A874'

  export const Indigo300 = '#8583EC'
  export const junoPrimary = '#E18881'
  export const osmosisPrimary = '#726FDC'
  export const white100 = '#FFFFFF'

  export const red300 = '#FF707E'
  export const red600 = '#D10014'

  export const yellow500 = '#EDB350'

  export const walletColors = ['#3ACF92', '#3D9EFF', '#8583EC', '#C984EB', '#FF707E', '#FFB33D']

  export function getChainColor(chainName: SupportedChain): string {
    return ChainInfos[chainName]?.theme?.primaryColor ?? cosmosPrimary
  }

  export function getWalletColorAtIndex(index: number | undefined): string {
    return walletColors[index ?? 0 % walletColors.length]
  }
}
