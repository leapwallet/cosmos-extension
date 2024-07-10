import { atom } from 'recoil'

export const lastAccessedWalletState = atom<string | undefined>({
  key: 'last-accessed-wallet',
  default: undefined,
})
