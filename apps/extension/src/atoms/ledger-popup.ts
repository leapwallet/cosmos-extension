import { atom } from 'recoil'

export const ledgerPopupState = atom<boolean>({
  key: 'ledgerPopupState',
  default: false,
})
