import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { atom } from 'recoil'

export const deleteChain = atom<ChainInfo | null>({
  key: 'delete-chain',
  default: null,
})
