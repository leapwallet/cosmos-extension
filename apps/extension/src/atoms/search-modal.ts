import { atom } from 'recoil'

export const searchModalState = atom<boolean>({
  key: 'searchModalState',
  default: false,
})

export const searchModalActiveOptionState = atom<{
  active: number
  lowLimit: number
  highLimit: number
}>({
  key: 'searchModalActiveOptionState',
  default: { active: 0, lowLimit: 0, highLimit: 0 },
})

export const searchModalEnteredOptionState = atom<number | null>({
  key: 'searchModalEnteredOptionState',
  default: null,
})

export const showSideNavFromSearchModalState = atom<boolean>({
  key: 'showSideNavFromSearchModalState',
  default: false,
})
