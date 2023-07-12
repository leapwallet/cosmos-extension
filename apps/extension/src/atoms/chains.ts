import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { atom } from 'recoil'

export const chainInfosState = atom({
  key: 'chains',
  default: ChainInfos,
})
