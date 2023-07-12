import { Activity } from '@leapwallet/cosmos-wallet-hooks'
import { useCallback } from 'react'
import { atom, selector, useRecoilValue, useSetRecoilState } from 'recoil'

import { wallet1, wallet2 } from '../wallet/data'
import { activeWalletIdAtom } from './../wallet/use-wallet'
import { activity1 } from './data'
import generateActivity, { generateActivityParams } from './generate-activity'

type ActivityRecord = Record<string, Activity[]>

// activity is per wallet
// for all the chains, show a common activity tab
export const activityRecordAtom = atom<ActivityRecord>({
  key: 'activity',
  default: {
    [wallet1.id]: activity1,
    [wallet2.id]: activity1,
  },
})

export const walletActivitySelector = selector<Activity[]>({
  key: 'current-wallet-activity',
  get: ({ get }) => {
    const activeWalletId = get(activeWalletIdAtom)
    const activityRecord = get(activityRecordAtom)
    return activityRecord[activeWalletId]
  },
  set: ({ get, set }, newValue: Activity[]) => {
    const activeWalletId = get(activeWalletIdAtom)

    set(activityRecordAtom, (value: ActivityRecord) => ({
      ...value,
      [activeWalletId]: newValue,
    }))
  },
})

export const useWalletActivity = () => {
  return useRecoilValue(walletActivitySelector)
}

export const useAddActivity = () => {
  const setActivity = useSetRecoilState(walletActivitySelector)

  const addActivity = useCallback(
    (activityInfo: generateActivityParams) => {
      setActivity((prevActivity) => [generateActivity(activityInfo), ...prevActivity])
    },
    [setActivity],
  )

  return addActivity
}
