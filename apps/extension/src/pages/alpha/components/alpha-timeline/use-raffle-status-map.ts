import { useCallback, useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

const RAFFLE_STATUS_KEY = 'RAFFLE_STATUS_MAP'

export type RaffleVisibilityStatus = 'hidden' | 'completed'
type RaffleStatusMap = Record<string, RaffleVisibilityStatus>

const getRaffleStatusMap = async (): Promise<RaffleStatusMap> => {
  try {
    const { [RAFFLE_STATUS_KEY]: stored } = await browser.storage.local.get(RAFFLE_STATUS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    await browser.storage.local.remove(RAFFLE_STATUS_KEY)
    return {}
  }
}

const setRaffleStatus = async (id: string, status: RaffleVisibilityStatus) => {
  const map = await getRaffleStatusMap()
  map[id] = status
  await browser.storage.local.set({ [RAFFLE_STATUS_KEY]: JSON.stringify(map) })
}

export const useRaffleStatusMap = () => {
  const [raffleStatusMap, setRaffleStatusMap] = useState<Record<string, RaffleVisibilityStatus>>({})

  useEffect(() => {
    getRaffleStatusMap().then(setRaffleStatusMap)
  }, [])

  const updateRaffleStatus = useCallback(async (id: string, status: RaffleVisibilityStatus) => {
    await setRaffleStatus(id, status)
    setRaffleStatusMap((prev) => ({ ...prev, [id]: status }))
  }, [])

  return { raffleStatusMap, updateRaffleStatus }
}
