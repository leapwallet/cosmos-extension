import { HIDE_ASSETS } from 'config/storage-keys'
import { useEffect } from 'react'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'
import browser from 'webextension-polyfill'

const hideAssets = atom<boolean>({
  key: 'hideSmallBalance',
  default: false,
})

export function useHideAssets() {
  const hideBalances = useRecoilValue(hideAssets)

  const formatHideBalance = (s: string) => {
    return hideBalances ? '••••••••' : s
  }

  return {
    hideBalances,
    formatHideBalance,
  }
}

export function useSetHideAssets() {
  const setHideSmallBalances = useSetRecoilState(hideAssets)

  return (val: boolean) => {
    setHideSmallBalances(val)
    browser.storage.local.set({ [HIDE_ASSETS]: val })
  }
}

export function useInitHideAssets() {
  const setHideSmallBalances = useSetHideAssets()
  useEffect(() => {
    browser.storage.local.get(HIDE_ASSETS).then((storage) => {
      const val = storage[HIDE_ASSETS]
      setHideSmallBalances(val)
    })
  }, [setHideSmallBalances])
}
