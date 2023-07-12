import BigNumber from 'bignumber.js'
import { SMALL_BALANCES_HIDDEN } from 'config/storage-keys'
import { useCallback, useEffect } from 'react'
import { atom, useRecoilState, useSetRecoilState } from 'recoil'
import browser from 'webextension-polyfill'

const areSmallBalancesHiddenAtom = atom<boolean>({
  key: SMALL_BALANCES_HIDDEN,
  default: false,
})

export function testIsSmallBalance(amt: BigNumber.Value) {
  const value = new BigNumber(amt)
  if (value.isNaN()) {
    return false
  }
  return value.isLessThan(1)
}

export function useHideSmallBalances() {
  const [areSmallBalancesHidden, setAreSmallBalancesHidden] = useRecoilState(
    areSmallBalancesHiddenAtom,
  )

  const setHidden = useCallback(
    (val: boolean) => {
      setAreSmallBalancesHidden(val)
      browser.storage.local.set({ [SMALL_BALANCES_HIDDEN]: val })
    },
    [setAreSmallBalancesHidden],
  )

  return [areSmallBalancesHidden, setHidden] as const
}

export function useInitHideSmallBalances() {
  const setAreSmallBalancesHidden = useSetRecoilState(areSmallBalancesHiddenAtom)

  useEffect(() => {
    browser.storage.local.get(SMALL_BALANCES_HIDDEN).then((storage) => {
      const val = storage[SMALL_BALANCES_HIDDEN]
      setAreSmallBalancesHidden(val)
    })
  }, [setAreSmallBalancesHidden])
}
