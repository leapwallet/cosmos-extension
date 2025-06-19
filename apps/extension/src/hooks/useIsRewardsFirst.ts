import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { LEAP_CHAD_FIRST_VISIT } from 'config/storage-keys'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

export const useIsRewardsFirst = () => {
  const activeWallet = useActiveWallet()
  const [isRewardsFirst, setIsRewardsFirstVisit] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      const cosmosAddress = activeWallet?.addresses?.cosmos ?? ''
      const key = `${LEAP_CHAD_FIRST_VISIT}-${cosmosAddress}`

      const data = await browser.storage.local.get(key)
      const isFirstVisit = data[key]

      setIsRewardsFirstVisit(typeof isFirstVisit === 'boolean' ? isFirstVisit : true)
    }
    initialize()
  }, [activeWallet?.addresses?.cosmos])

  const markAsVisited = () => {
    browser.storage.local.set({
      [`${LEAP_CHAD_FIRST_VISIT}-${activeWallet?.addresses?.cosmos}`]: false,
    })
    setIsRewardsFirstVisit(false)
  }

  return { isRewardsFirst, markAsVisited }
}
