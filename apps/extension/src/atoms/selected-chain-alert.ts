import { atom } from 'recoil'

export const selectedChainAlertState = atom<boolean>({
  key: 'selected-chain-alert',
  default: true,
})
