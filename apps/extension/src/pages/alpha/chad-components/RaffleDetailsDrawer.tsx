import { getLeapapiBaseUrl } from '@leapwallet/cosmos-wallet-hooks'
import { X } from '@phosphor-icons/react'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr'
import axios from 'axios'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { Separator } from 'components/ui/separator'
import { ButtonName, EventName, PageName } from 'config/analytics'
import { VIEWED_RAFFLE_WINS } from 'config/storage-keys'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import { RaffleStatus, useRaffleWins } from 'hooks/useAlphaOpportunities'
import { useRaffleEntry } from 'hooks/useRaffleEntry'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { mixpanelTrack } from 'utils/tracking'
import browser from 'webextension-polyfill'

import { ChadDescription } from '../components/AlphaDescription'
import Tags from '../components/Tags'
import { useChadProvider } from '../context/chad-exclusives-context'
import { endsInUTC } from '../utils'
import {
  IneligibleRaffle,
  NotRaffleWinner,
  RaffleClosed,
  RaffleEntrySkeleton,
  RaffleWinner,
  ResultSoon,
  SubscriptionCountdown,
} from './RaffleEntry'
import { RaffleListingProps } from './RaffleListing'

type RaffleDetailsDrawerProps = {
  isShown: boolean
  onClose: () => void
  raffle: RaffleListingProps | null
}

const now = dayjs()
export default function RaffleDetailsDrawer({
  isShown,
  onClose,
  raffle,
}: RaffleDetailsDrawerProps) {
  const { alphaUser } = useChadProvider()
  usePageView(PageName.ChadExclusivesDetail, isShown, {
    isChad: alphaUser?.isChad ?? false,
    ecosystem: [...new Set(raffle?.ecosystem ?? [])],
    categories: [...new Set(raffle?.categories ?? [])],
  })

  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '')
  const [toast, setToast] = useState('')

  const end = useMemo(() => dayjs(raffle?.endsAt), [raffle?.endsAt])
  const start = useMemo(() => dayjs(raffle?.startsAt), [raffle?.startsAt])

  const [isUpcoming, setIsUpcoming] = useState(start.isAfter(now))
  const [diff, setDiff] = useState(
    raffle?.status === RaffleStatus.COMPLETED ? 0 : end.diff(now, 'second'),
  )

  const isLive = useMemo(
    () =>
      Boolean(
        raffle?.endsAt &&
          diff >= 0 &&
          raffle?.status !== RaffleStatus.COMPLETED &&
          endsInUTC(raffle?.endsAt) !== 'Ended',
      ),
    [diff, raffle?.endsAt, raffle?.status],
  )

  useEffect(() => {
    const updateStates = () => {
      const currentNow = dayjs()
      const isCurrentlyUpcoming = start.isAfter(currentNow)
      const currentDiff =
        raffle?.status === RaffleStatus.COMPLETED ? 0 : end.diff(currentNow, 'second')

      setIsUpcoming(isCurrentlyUpcoming)
      setDiff(currentDiff)
    }

    updateStates()
    const interval = setInterval(updateStates, 1000)
    return () => clearInterval(interval)
  }, [raffle?.status, start, end])

  const {
    hasEntered: raffleEntered,
    isLoading,
    refetch,
  } = useRaffleEntry(raffle?.id, alphaUser?.id)

  const isWinner = useMemo(() => {
    return raffleWins.find((win) => win.id === raffle?.id)
  }, [raffleWins, raffle?.id])

  useEffect(() => {
    if (toast) {
      setTimeout(() => setToast(''), 2000)
    }
  }, [toast])

  // adds winner raffle ID in storage to mark as viewed
  useEffect(() => {
    const markRaffleAsViewed = async () => {
      if (isShown && isWinner && raffle?.id) {
        const result = await browser.storage.local.get(VIEWED_RAFFLE_WINS)
        const viewedRaffles = result[VIEWED_RAFFLE_WINS] || []

        if (!viewedRaffles.includes(raffle.id)) {
          const updatedViewedRaffles = [...viewedRaffles, raffle.id]
          await browser.storage.local.set({ [VIEWED_RAFFLE_WINS]: updatedViewedRaffles })
        }
      }
    }
    markRaffleAsViewed()
  }, [isShown, isWinner, raffle?.id])

  const handleEnterRaffle = useCallback(async () => {
    try {
      const baseUrl = getLeapapiBaseUrl()
      const url = `${baseUrl}/alpha-insights/raffle-entries`
      await axios.post(url, {
        raffleId: raffle?.id,
        userId: alphaUser?.id,
      })
      mixpanelTrack(EventName.ButtonClick, {
        buttonName: ButtonName.ENTER_RAFFLE,
        ButtonPageName: PageName.ChadExclusivesDetail,
        isChad: alphaUser?.isChad ?? false,
      })
      await refetch()
    } catch (err) {
      // gentle catch
    }
  }, [alphaUser?.id, raffle?.id, refetch])

  return (
    <>
      <BottomModal
        fullScreen
        title='Reward Details'
        isOpen={isShown}
        onClose={onClose}
        className='px-6 pt-8 flex flex-col gap-6'
        footerComponent={
          isWinner ? (
            <Button className='w-full'>Claim now</Button>
          ) : raffleEntered ? (
            <Button className='w-full' onClick={handleEnterRaffle} disabled>
              <CheckCircle size={20} weight='bold' />
              You have entered!
            </Button>
          ) : isLive ? (
            <Button className='w-full'>Enter giveaway</Button>
          ) : (
            <Button className='w-full'>View more exclusives</Button>
          )
        }
      >
        <header className='space-y-3'>
          <h1 className='text-center text-xl font-bold'>{raffle?.title}</h1>

          <Tags
            className='justify-center'
            ecosystemFilter={raffle?.ecosystem ?? []}
            categoryFilter={raffle?.categories ?? []}
          />
        </header>

        <img
          src={raffle?.bannerImage ?? `https://placehold.co/40x40?text=${raffle?.secondaryTitle}`}
          className='w-full h-[107px] rounded-lg object-cover'
        />

        <Separator />

        <AnimatePresence mode='wait'>
          {isLoading ? (
            <RaffleEntrySkeleton key='loading' />
          ) : isUpcoming ? (
            <SubscriptionCountdown
              title={'Stay tuned, starting in'}
              key='subscription-countdown'
              endDate={raffle?.startsAt ?? ''}
              onExpire={() => {
                setIsUpcoming(false)
              }}
            />
          ) : !raffleEntered && alphaUser?.isChad && diff > 0 ? (
            <SubscriptionCountdown
              title={'Giveaway ends in'}
              key='subscription-countdown'
              endDate={raffle?.endsAt ?? ''}
              onExpire={() => {
                setDiff(0)
              }}
            />
          ) : raffleEntered && raffle?.status !== RaffleStatus.COMPLETED ? (
            <ResultSoon key='result-soon' />
          ) : isWinner ? (
            <RaffleWinner rewardUnit={raffle?.rewardUnitName} key='raffle-winner' />
          ) : raffleEntered && !isWinner ? (
            <NotRaffleWinner key='not-winner' />
          ) : !alphaUser?.isChad && diff > 0 ? (
            <IneligibleRaffle key='ineligible' />
          ) : diff <= 0 ? (
            <RaffleClosed />
          ) : null}
        </AnimatePresence>

        <Separator />

        {/* Description actions section */}
        {raffle?.description ? <ChadDescription {...raffle} pageName={raffle.pageName} /> : null}
      </BottomModal>

      {/* Toast outside all containers */}
      {isShown && (
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className='absolute bottom-24 left-0 right-0 mx-4 z-[9999] bg-green-600 dark:bg-green-600 rounded-full py-2.5 px-4 flex items-center justify-between shadow-lg'
            >
              <Text size='xs' className='font-bold text-gray-900 dark:text-white-100'>
                {toast}
              </Text>
              <X
                size={12}
                onClick={() => setToast('')}
                className='cursor-pointer text-gray-900 dark:text-white-100 ml-2'
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  )
}
