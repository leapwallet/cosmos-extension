import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { VIEWED_RAFFLE_WINS } from 'config/storage-keys'
import { useRaffleWins } from 'hooks/useAlphaOpportunities'
import { useAlphaUser } from 'hooks/useAlphaUser'
import { useIsRewardsFirst } from 'hooks/useIsRewardsFirst'
import { useQueryParams } from 'hooks/useQuery'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { queryParams } from 'utils/query-params'
import browser from 'webextension-polyfill'

import { AlertStrip } from './AlertStrip'
import { TestnetAlertStrip } from './TestnetAlertStrip'
/**
 * shows the most recent raffle win alert in strip
 */
const RaffleAndTestnetAlertStrip = React.memo(() => {
  const activeWallet = useActiveWallet()
  const { alphaUser, isAlphaUserLoading } = useAlphaUser(activeWallet?.addresses?.cosmos ?? '')
  const navigate = useNavigate()
  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '')
  const { isRewardsFirst, markAsVisited } = useIsRewardsFirst()
  const params = useQueryParams()
  const [isVisible, setIsVisible] = useState(false)
  const [viewedRaffles, setViewedRaffles] = useState<string[]>([])

  useEffect(() => {
    const initializeViewedRaffles = async () => {
      const result = await browser.storage.local.get(VIEWED_RAFFLE_WINS)
      let viewed = result[VIEWED_RAFFLE_WINS] || []

      if (raffleWins.length > 0) {
        const unviewedWins = raffleWins.filter((win) => !viewed.includes(win.id))
        if (unviewedWins.length > 1) {
          // Get all win IDs except the most recent one
          const olderWinIds = unviewedWins.slice(1).map((win) => win.id)
          viewed = [...viewed, ...olderWinIds]
          await browser.storage.local.set({ [VIEWED_RAFFLE_WINS]: viewed })
        }
        setIsVisible(unviewedWins.length > 0)
      }

      setViewedRaffles(viewed)
    }
    initializeViewedRaffles()
  }, [raffleWins])

  useEffect(() => {
    if (!alphaUser?.isChad || !isRewardsFirst) {
      return
    }

    params.set(queryParams.chadEligibility, 'true')
    markAsVisited()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAlphaUserLoading, isRewardsFirst])

  const latestWin = useMemo(() => {
    if (!raffleWins?.length) return null
    return raffleWins.find((win) => !viewedRaffles.includes(win.id))
  }, [raffleWins, viewedRaffles])

  if (!latestWin || !isVisible) {
    return <TestnetAlertStrip />
  }

  const handleClick = async () => {
    const updatedViewedRaffles = [...viewedRaffles, latestWin.id]
    await browser.storage.local.set({ [VIEWED_RAFFLE_WINS]: updatedViewedRaffles })
    setViewedRaffles(updatedViewedRaffles)
    navigate(`/alpha?page=exclusive&listingId=${latestWin.id}`)
  }

  const handleClose = async () => {
    const updatedViewedRaffles = [...viewedRaffles, latestWin.id]
    await browser.storage.local.set({ [VIEWED_RAFFLE_WINS]: updatedViewedRaffles })
    setViewedRaffles(updatedViewedRaffles)
    setIsVisible(false)
  }

  return (
    <AlertStrip
      message={`You've won a Raffle 🎉, check now`}
      bgColor='#10B981'
      alwaysShow={true}
      onClick={handleClick}
      showCloseButton={true}
      onClose={handleClose}
    />
  )
})

RaffleAndTestnetAlertStrip.displayName = 'RaffleAndTestnetAlertStrip'
export { RaffleAndTestnetAlertStrip }
