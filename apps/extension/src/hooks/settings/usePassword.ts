import { useCallback, useState } from 'react'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'
import browser from 'webextension-polyfill'

import { AUTO_LOCK_TIME } from '../../config/storage-keys'

const DEFAULT_AUTO_LOCK_TIME = 1440

export const TimerLockPeriod: Record<string, number> = {
  '15 min': 15,
  '60 min': 60,
  '24 hrs': 1440,
  'Never auto-lock': 14400,
}

export const TimerLockPeriodRev: Record<number, string> = {
  15: '15 min',
  60: '60 min',
  1440: '24 hrs',
  14400: 'Never auto-lock',
}

const passwordState = atom<string | undefined | null>({
  key: 'password',
  default: undefined,
})

export function usePassword(): string | undefined | null {
  return useRecoilValue(passwordState)
}

export function useSetLastActiveTime() {
  return async () => {
    const timestamp = Date.now()
    await browser.storage.local.set({
      lastActiveTime: timestamp,
    })
  }
}

export function useSetPassword() {
  const setPassword = useSetRecoilState(passwordState)
  return useCallback(
    async (password: string | undefined | null) => {
      setPassword(password)
    },
    [setPassword],
  )
}

const autoLockTimeAtom = atom<number>({
  key: AUTO_LOCK_TIME,
  default: DEFAULT_AUTO_LOCK_TIME,
})

export function storeLockTimer(time: number): void {
  browser.storage.local.set({
    [AUTO_LOCK_TIME]: time,
  })
}

export function useLockTimer() {
  const lockTime = useRecoilValue(autoLockTimeAtom)
  const setLockTime = useSetRecoilState(autoLockTimeAtom)
  const [shouldAutoLock] = useState<boolean>()

  const setTimer = (time: string) => {
    setLockTime(TimerLockPeriod[time])
    storeLockTimer(TimerLockPeriod[time])
  }
  return { setTimer, lockTime, shouldAutoLock }
}
