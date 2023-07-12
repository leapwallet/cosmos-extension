import { atom, selector, useRecoilValue, useSetRecoilState } from 'recoil'

import { CustomWallet as CWal, wallet1, wallet2 } from './data'

export type CustomWallet = CWal

type WalletsAtomType = Record<string, CustomWallet>

export const activeWalletIdAtom = atom<string>({
  key: 'active-wallet-id',
  default: wallet1.id,
})

export const walletsAtom = atom<WalletsAtomType>({
  key: 'active-wallets-list',
  default: {
    [wallet1.id]: wallet1,
    [wallet2.id]: wallet2,
  },
})

export const useWallets = () => {
  return useRecoilValue(walletsAtom)
}

export const activeWalletSelector = selector<CustomWallet>({
  key: 'active-wallet',
  get: ({ get }) => {
    const wallets = get(walletsAtom)
    const activeWalletId = get(activeWalletIdAtom)
    return wallets[activeWalletId]
  },
  set: ({ set }, newValue: CustomWallet) => {
    set(walletsAtom, (value) => ({
      ...value,
      [newValue.id]: newValue,
    }))
  },
})

export const useActiveWallet = (): CustomWallet => {
  return useRecoilValue(activeWalletSelector)
}

export const useActiveWalletId = () => {
  return useRecoilValue(activeWalletIdAtom)
}

export const useSetActiveWalletId = () => {
  return useSetRecoilState(activeWalletIdAtom)
}
