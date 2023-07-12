import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { atom } from 'recoil'

import { AppConfig } from '~/config'

export const TimerLockPeriod: Record<string, number> = {
  '15 min': 15,
  '60 min': 60,
  '24 hrs': 1440,
  'Nerver auto-lock': -1,
}

export const TimerLockPeriodRev: Record<number, string> = {
  15: '15 min',
  60: '60 min',
  1440: '24 hrs',
  '-1': 'Never auto-lock',
}

export function storeLockTimer(time: number): void {
  localStorage.setItem(AppConfig.STORAGE_KEYS.LOCK_TIME, time.toString())
}

export function useLockTimer() {
  const [lockTime, setLockTime] = useState<number>()
  const [shouldAutoLock, setshouldAutoLock] = useState<boolean>()

  const setTimer = (time: string) => {
    setLockTime(TimerLockPeriod[time])
    storeLockTimer(TimerLockPeriod[time])
  }

  return { setTimer, lockTime, shouldAutoLock }
}

export const lockTimeAtom = atom<SupportedChain>({
  key: 'lock-time',
  default: 'cosmos',
})

export const useLockTime = () => {
  return useRecoilValue(lockTimeAtom)
}

export const useSetLockTime = () => {
  return useSetRecoilState(lockTimeAtom)
}
