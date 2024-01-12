import {
  BannerAD,
  NumiaTrackAction,
  postNumiaEvent,
  useActiveWallet,
  useAddress,
  useBannerConfig,
  useChainInfo,
  useGetBannerData,
  useGetNumiaBanner,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import classNames from 'classnames'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import { DISABLE_BANNER_ADS } from 'config/storage-keys'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'

// session storage key for storing the numia banner impression info
const NUMIA_IMPRESSION_INFO = 'numia-impression-info'
// session storage key for storing the mixpanel banner views info
const MIXPANEL_BANNER_VIEWS_INFO = 'mixpanel-banner-views-info'
// seconds
const DEFAULT_AUTO_SCROLL_DURATION = 30
// pixels
const AUTO_SWITCH_LEFT = 352

type BannerADData = BannerAD & {
  logo?: string
}

function getMixpanelBannerId(bannerId: string, campaignId?: number) {
  return bannerId.includes('numia') ? `numia-campaign-${campaignId}` : bannerId
}

function getMixpanelPositionId(bannerId: string, banner?: BannerAD) {
  return bannerId.includes('numia') ? banner?.attributes?.position_id : banner?.position_id
}

function BannerAdCard({
  bannerData,
  chain,
  index,
  onClick,
  onClose,
  handleBtcBannerClick,
}: {
  bannerData: BannerADData
  chain: ChainInfo
  index: number
  // eslint-disable-next-line no-unused-vars
  onClick: (bannerId: string, index: number) => void
  // eslint-disable-next-line no-unused-vars
  onClose: (bannerId: string, index: number) => void
  handleBtcBannerClick: () => void
}) {
  const handleClick = useCallback(() => {
    if (bannerData.id.trim().toLowerCase().includes('nbtc-banner')) {
      handleBtcBannerClick()
    } else {
      window.open(bannerData.redirect_url)
    }

    onClick(bannerData.id, index)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerData, index, onClick])

  return (
    <div className='relative inline-block w-[22rem] overflow-hidden mr-4 snap-center'>
      <button
        className='overflow-hidden rounded-lg w-full items-center flex dark:bg-gray-900 bg-white-100'
        onClick={handleClick}
      >
        {bannerData?.image_url ? (
          <img
            src={bannerData.image_url}
            alt='chain logo'
            className='z-0 right-0 h-[100px] w-full'
          />
        ) : (
          <div className='p-4 flex items-center'>
            <img
              src={bannerData?.logo ?? chain.chainSymbolImageUrl}
              alt='chain logo'
              width='24'
              height='24'
              className='object-contain rounded-full h-10 w-10 mr-2 m-w-10'
              style={{
                border: `8px solid ${chain.theme.primaryColor}`,
              }}
            />
            <div>
              <Text size='xs' color='dark:text-white-100 text-gray-800 text-left'>
                {bannerData.title}
              </Text>
            </div>
          </div>
        )}
      </button>

      <button
        className='absolute top-[4px] right-[4px] bg-gray-500 rounded-full w-[20px] h-[20px] flex cursor-pointer opacity-70'
        onClick={(event) => {
          event.stopPropagation()
          onClose(bannerData.id, index)
        }}
      >
        <span className='material-icons-round text-gray-900 m-auto text-base -mt-[2px]'>close</span>
      </button>
    </div>
  )
}

export default function GlobalBannersAD({
  handleBtcBannerClick,
}: {
  handleBtcBannerClick: () => void
}) {
  const chain = useChainInfo()
  const [disabledBannerAds, setDisableBannerAds] = useState<string[]>([])
  const scrollableContainerRef = useRef<HTMLDivElement>(null)
  const [timeCounter, setTimeCounter] = useState(0)
  const [autoSwitchBanner, setAutoSwitchBanner] = useState(true)
  const timerCountRef = useRef(0)
  const walletAddress = useAddress()
  const activeWallet = useActiveWallet()
  const osmoWalletAddress = activeWallet?.addresses.osmosis
  const cosmosWalletAddress = activeWallet?.addresses.cosmos

  const { data: bannerConfig } = useBannerConfig()

  const { data: numiaBanners, status: numiaStatus } = useGetNumiaBanner(
    osmoWalletAddress ?? '',
    bannerConfig?.extension['position-ids'] ?? [],
  )
  const leapBanners = useGetBannerData(chain?.chainId)

  // this is in seconds
  const autoScrollDuration = useMemo(() => {
    return bannerConfig?.extension?.['auto-scroll-duration'] ?? DEFAULT_AUTO_SCROLL_DURATION
  }, [bannerConfig])

  const bannerAds = useMemo(() => {
    if (numiaStatus !== 'loading') {
      return [...(numiaBanners ?? []), ...(leapBanners ?? [])]
    }

    return []
  }, [leapBanners, numiaBanners, numiaStatus])

  const displayADs = useMemo(() => {
    return bannerAds?.filter((ad) => {
      const date = new Date()
      const startDate = new Date(ad.start_date)
      const endDate = new Date(ad.end_date)
      const isCorrectTime = date >= startDate && date <= endDate
      return !disabledBannerAds?.includes(ad.id) && isCorrectTime
    })
  }, [bannerAds, disabledBannerAds])

  const { activeBannerId, activeBannerData, activeBannerIndex } = useMemo(() => {
    const activeBannerIndex = timeCounter % displayADs.length
    const activeBannerData: BannerAD | undefined = displayADs?.[activeBannerIndex]
    const activeBannerId: string | undefined = activeBannerData?.id

    return {
      activeBannerId,
      activeBannerData,
      activeBannerIndex,
    }
  }, [displayADs, timeCounter])

  useEffect(() => {
    if (!activeBannerId || isNaN(activeBannerIndex)) return

    if (activeBannerData.id !== activeBannerId) return

    const storedMixpanelBannerViewsInfo = sessionStorage.getItem(MIXPANEL_BANNER_VIEWS_INFO)
    const mixpanelBannerViewsInfo = JSON.parse(storedMixpanelBannerViewsInfo ?? '{}')

    if (!mixpanelBannerViewsInfo[walletAddress]?.includes(activeBannerId)) {
      try {
        mixpanel.track(EventName.BannerView, {
          bannerId: getMixpanelBannerId(activeBannerId, activeBannerData.attributes?.campaign_id),
          bannerIndex: activeBannerIndex,
          walletAddress,
          globalWalletAddress: cosmosWalletAddress,
          chainId: chain.chainId,
          chainName: chain.chainName,
          positionId: getMixpanelPositionId(activeBannerId, activeBannerData),
          time: Date.now() / 1000,
        })

        sessionStorage.setItem(
          MIXPANEL_BANNER_VIEWS_INFO,
          JSON.stringify({
            ...mixpanelBannerViewsInfo,
            [walletAddress]: [...(mixpanelBannerViewsInfo[walletAddress] ?? []), activeBannerId],
          }),
        )
      } catch (_) {
        //
      }
    }

    if (activeBannerId.includes('numia')) {
      const storedNumiaImpressionInfo = sessionStorage.getItem(NUMIA_IMPRESSION_INFO)
      const numiaImpressionInfo = JSON.parse(storedNumiaImpressionInfo ?? '{}')

      if (!numiaImpressionInfo[walletAddress]?.includes(activeBannerId)) {
        sessionStorage.setItem(
          NUMIA_IMPRESSION_INFO,
          JSON.stringify({
            ...numiaImpressionInfo,
            [walletAddress]: [...(numiaImpressionInfo[walletAddress] ?? []), activeBannerId],
          }),
        )

        try {
          if (activeBannerData && activeBannerData.attributes && osmoWalletAddress) {
            // call only for a new wallet address in a session
            ;(async function () {
              await postNumiaEvent(
                osmoWalletAddress,
                NumiaTrackAction.VIEWED,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                activeBannerData.attributes!,
              )
            })()
          }
        } catch (_) {
          //
        }
      }
    }
  }, [
    walletAddress,
    activeBannerId,
    activeBannerData,
    activeBannerIndex,
    chain.chainId,
    chain.chainName,
    cosmosWalletAddress,
    osmoWalletAddress,
  ])

  const handleContainerScroll = useCallback(
    (newIndex?: number) => {
      // new index will be from 0 - displayADs.length
      if (newIndex !== undefined) {
        timerCountRef.current = Math.floor(timerCountRef.current / displayADs.length) + newIndex
      } else {
        timerCountRef.current += 1
      }

      scrollableContainerRef.current?.scrollTo({
        top: 0,
        left: AUTO_SWITCH_LEFT * (timerCountRef.current % displayADs.length),
        behavior: 'smooth',
      })

      setTimeCounter(timerCountRef.current)
    },
    [displayADs.length],
  )

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let intervalId: any
    if (scrollableContainerRef.current && displayADs.length > 1 && autoSwitchBanner) {
      intervalId = setInterval(handleContainerScroll, autoScrollDuration * 1000)
    }

    return () => clearInterval(intervalId)
  }, [displayADs.length, handleContainerScroll, autoSwitchBanner, autoScrollDuration])

  useEffect(() => {
    // stop auto-switching when the banner is not visible to the user
    if (!scrollableContainerRef.current) {
      return
    }

    const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
      const isIntersecting = entries[0].isIntersecting
      // isIntersecting - meaning the banner is visible to the user (in the popup-layout area)
      setAutoSwitchBanner(isIntersecting)
    }

    const observer = new IntersectionObserver(intersectionCallback, {
      root: document.querySelector('#popup-layout'),
      rootMargin: '0px',
      threshold: 1.0,
    })

    observer.observe(scrollableContainerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    // stop auto-switching when the user is not on the tab, or has minimised the window or using another app

    const handleVisibilityChanges = () => {
      if (document.visibilityState === 'visible') {
        setAutoSwitchBanner(true)
      } else {
        setAutoSwitchBanner(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChanges)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChanges)
    }
  }, [])

  const handleBannerClose = useCallback(
    async (bannerId: string, bannerIndex: number) => {
      const newDisabledBannerAds = [...disabledBannerAds, bannerId]
      const storedDisabledBannerAds = await Browser.storage.local.get([DISABLE_BANNER_ADS])
      let parsedDisabledAds = {}

      try {
        parsedDisabledAds = JSON.parse(storedDisabledBannerAds[DISABLE_BANNER_ADS] ?? '{}')
      } catch (_) {
        //
      }

      await Browser.storage.local.set({
        [DISABLE_BANNER_ADS]: JSON.stringify({
          ...parsedDisabledAds,
          [cosmosWalletAddress ?? '']: newDisabledBannerAds,
        }),
      })

      try {
        const banner = bannerAds.find((_banner) => _banner.id === bannerId)

        mixpanel.track(EventName.BannerClose, {
          bannerId: getMixpanelBannerId(bannerId, banner?.attributes?.campaign_id),
          bannerIndex,
          walletAddress,
          globalWalletAddress: cosmosWalletAddress,
          chainId: chain.chainId,
          chainName: chain.chainName,
          positionId: getMixpanelPositionId(bannerId, banner),
          time: Date.now() / 1000,
        })
      } catch (_) {
        //
      }

      setDisableBannerAds(newDisabledBannerAds)
    },
    [
      disabledBannerAds,
      bannerAds,
      walletAddress,
      cosmosWalletAddress,
      chain.chainId,
      chain.chainName,
    ],
  )

  const handleBannerClick = useCallback(
    (bannerId: string, bannerIndex: number) => {
      const banner = bannerAds.find((_banner) => _banner.id === bannerId)

      if (bannerId.includes('numia')) {
        try {
          if (banner && osmoWalletAddress) {
            ;(async function () {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              await postNumiaEvent(osmoWalletAddress, NumiaTrackAction.CLICKED, banner.attributes!)
            })()
          }
        } catch (_) {
          //
        }
      }

      try {
        mixpanel.track(EventName.BannerClick, {
          bannerId: getMixpanelBannerId(bannerId, banner?.attributes?.campaign_id),
          bannerIndex,
          walletAddress,
          globalWalletAddress: cosmosWalletAddress,
          chainId: chain.chainId,
          chainName: chain.chainName,
          positionId: getMixpanelPositionId(bannerId, banner),
          time: Date.now() / 1000,
        })
      } catch (_) {
        //
      }
    },
    [
      bannerAds,
      chain.chainId,
      chain.chainName,
      cosmosWalletAddress,
      osmoWalletAddress,
      walletAddress,
    ],
  )

  const handleScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      // if event is user generated, then update the active banner index
      // for this we check the isTrusted property of the event
      if (e.isTrusted && !autoSwitchBanner) {
        const scrollLeft = e.currentTarget.scrollLeft
        const bannerIndex = Math.floor(scrollLeft / AUTO_SWITCH_LEFT)
        timerCountRef.current = bannerIndex
        setTimeCounter(bannerIndex)
      }
    },
    [autoSwitchBanner],
  )

  const handleMouseEnter = useCallback(() => {
    setAutoSwitchBanner(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setAutoSwitchBanner(true)
  }, [])

  useEffect(() => {
    const fn = async () => {
      const disabledBannerAds = await Browser.storage.local.get([DISABLE_BANNER_ADS])
      const parsedDisabledAds = JSON.parse(disabledBannerAds[DISABLE_BANNER_ADS] ?? '{}')

      setDisableBannerAds(parsedDisabledAds[cosmosWalletAddress ?? ''] ?? [])
    }

    // eslint-disable-next-line no-console
    fn().catch(console.error)
  }, [cosmosWalletAddress])

  if (!bannerAds || bannerAds.length === 0 || displayADs.length === 0) return null

  return (
    <div className='relative mb-4'>
      <div
        ref={scrollableContainerRef}
        className='w-[400px] whitespace-nowrap overflow-x-auto overflow-y-hidden text-center pl-4 h-[100px] hide-scrollbar snap-x snap-mandatory'
        onScroll={handleScroll}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {displayADs.map((bannerData, index) => {
          return (
            <BannerAdCard
              key={bannerData.id}
              index={index}
              bannerData={bannerData}
              chain={chain}
              onClick={handleBannerClick}
              onClose={handleBannerClose}
              handleBtcBannerClick={handleBtcBannerClick}
            />
          )
        })}
      </div>

      {displayADs.length > 1 ? (
        <div
          className='absolute bg-gray-50 dark:bg-black-100 p-2 flex gap-1 rounded-2xl left-1/2 -translate-x-2/4 -mt-[10px]'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {displayADs.map((ad, i) => {
            const isActive = activeBannerId === ad.id

            return (
              <span
                role='button'
                key={ad.id}
                className={classNames('h-[6px] rounded-full transition-all cursor-pointer', {
                  'w-[21px] bg-gray-600 dark:bg-white-100': isActive,
                  'w-[6px] bg-gray-300 dark:bg-gray-600': !isActive,
                })}
                onClick={() => handleContainerScroll(i)}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
