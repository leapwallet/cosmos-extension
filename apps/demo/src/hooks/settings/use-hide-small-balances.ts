import { useEffect } from 'react'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'

import { AppConfig } from '~/config'

const hideSmallBalanceState = atom<boolean>({
  key: 'hideSmallBalance',
  default: false,
})

export function useHideSmallBalances() {
  return useRecoilValue(hideSmallBalanceState)
}

export function useSetHideSmallBalances() {
  const setHideSmallBalances = useSetRecoilState(hideSmallBalanceState)

  return (val: boolean) => {
    setHideSmallBalances(val)
    localStorage.setItem(AppConfig.STORAGE_KEYS.HIDE_SMALL_BALANCES, val.toString())
  }
}

export function useInitHideSmallBalance() {
  const setHideSmallBalances = useSetHideSmallBalances()

  useEffect(() => {
    const shouldHide = localStorage.getItem(AppConfig.STORAGE_KEYS.HIDE_SMALL_BALANCES)
    if (typeof shouldHide === 'string') {
      setHideSmallBalances(shouldHide === 'true')
    } else {
      localStorage.setItem(AppConfig.STORAGE_KEYS.HIDE_SMALL_BALANCES, 'true')
    }
  }, [setHideSmallBalances])
}
