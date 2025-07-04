import { PasswordStore } from '@leapwallet/cosmos-wallet-store'
import { AUTO_LOCK_TIME } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'
import browser from 'webextension-polyfill'

export const passwordStore = new PasswordStore()

const DEFAULT_AUTO_LOCK_TIME = 1440

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
    this.init()
  }

  async init() {
    const time = await browser.storage.local.get(AUTO_LOCK_TIME)
    if (time) {
      this.time = time[AUTO_LOCK_TIME]
    }
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
