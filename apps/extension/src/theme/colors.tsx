import { ChainInfo } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { isCompassWallet } from 'utils/isCompassWallet'

/* eslint-disable @typescript-eslint/no-namespace */
export namespace Colors {
  export const compassPrimary = '#224874'
  export const compassPrimaryDark = '#0D233D'
  export const compassGradient =
    'linear-gradient(180deg, rgba(34, 72, 116, 0.7) 0%, rgba(34, 72, 116, 0) 100%)'

  export const aggregatePrimary = '#fcb045eb'
  export const aggregateGradient =
    'linear-gradient(180deg, rgba(252, 176, 69, 0.28) 0%, rgba(131, 58, 180, 0.24) 32%, rgba(58, 141, 180, 0.12) 56%, rgba(58, 141, 180, 0) 100%)'

  export const cosmosPrimary = isCompassWallet() ? compassPrimary : '#754F9C'
  export const juno = '#E18881'
  export const gray900 = '#212121'
  export const gray400 = '#9E9E9E'
  export const gray300 = '#B8B8B8'
  export const gray200 = '#D6D6D6'
  export const gray100 = '#E8E8E8'
  export const gray800 = '#383838'
  export const gray950 = '#141414'
  export const green600 = '#29A874'

  export const Indigo300 = '#8583EC'
  export const junoPrimary = '#E18881'
  export const osmosisPrimary = '#726FDC'
  export const white100 = '#FFFFFF'
  export const black100 = '#000000'

  export const red300 = '#FF707E'
  export const red400 = '#FF3D50'
  export const red600 = '#D10014'

  export const orange100 = '#FFEDD1'
  export const orange200 = '#FFDFAD'
  export const orange300 = '#FFC770'
  export const orange500 = '#FF9F0A'
  export const orange600 = '#D17F00'
  export const orange800 = '#704400'
  export const orange900 = '#422800'

  export const blue200 = '#ADD6FF'
  export const blue400 = '#3D9EFF'
  export const blue600 = '#0A84FF'
  export const blue800 = '#003870'
  export const blue900 = '#002142'

  export function getChainColor(
    chainName: SupportedChain,
    activeChainInfo?: {
      theme?: ChainInfo['theme']
    },
  ): string {
    const chainInfo = activeChainInfo ?? ChainInfos[chainName]
    return isCompassWallet() ? compassPrimary : chainInfo?.theme?.primaryColor ?? cosmosPrimary
  }

  export const walletColors = ['#3ACF92', '#3D9EFF', '#8583EC', '#C984EB', '#FF707E', '#FFB33D']

  export function getWalletColorAtIndex(index: number | undefined): string {
    return walletColors[index ?? 0 % walletColors.length]
  }
}
