import { makeAutoObservable } from 'mobx'
import browser from 'webextension-polyfill'

import { AUTO_LOCK_TIME } from '../config/storage-keys'

const DEFAULT_AUTO_LOCK_TIME = 1440

export class PasswordStore {
  password?: Uint8Array | null

  constructor() {
    makeAutoObservable(this)
  }

  setPassword(password: Uint8Array | undefined | null) {
    this.password = password
  }
}

export const passwordStore = new PasswordStore()

export const TimerLockPeriod = {
  '15 min': 15,
  '60 min': 60,
  '24 hrs': 1440,
  'Never auto-lock': 14400,
} as const

export type TimerLockPeriodKey = keyof typeof TimerLockPeriod

export const TimerLockPeriodRev = {
  15: '15 min',
  60: '60 min',
  1440: '24 hrs',
  14400: 'Never auto-lock',
} as const

export type TimerLockPeriodRevKey = keyof typeof TimerLockPeriodRev

export class AutoLockTimeStore {
  time: TimerLockPeriodRevKey = DEFAULT_AUTO_LOCK_TIME

  constructor() {
    makeAutoObservable(this)
  }

  setLockTime(time: TimerLockPeriodKey) {
    const newTime = TimerLockPeriod[time]
    this.time = newTime
    browser.storage.local.set({
      [AUTO_LOCK_TIME]: newTime,
    })
  }

  setLastActiveTime = () => {
    const timestamp = Date.now()
    return browser.storage.local.set({
      lastActiveTime: timestamp,
    })
  }
}

export const autoLockTimeStore = new AutoLockTimeStore()
