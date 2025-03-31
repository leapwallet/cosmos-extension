import {
  BannerAD,
  NumiaBannerAttribute,
  NumiaTrackAction,
  postNumiaEvent,
  useActiveWallet,
  useAddress,
  useBannerConfig,
  useChainId,
  useChainInfo,
  useCustomChains,
  useGetBannerData,
  useGetNumiaBanner,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import { GlobalBannersLoading } from 'components/Skeletons'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { DISABLE_BANNER_ADS } from 'config/storage-keys'
import { useActiveChain, useSetActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AggregatedSupportedChain } from 'types/utility'
import { isCompassWallet } from 'utils/isCompassWallet'
import { uiErrorTags } from 'utils/sentry'
import Browser from 'webextension-polyfill'

import AddFromChainStore from '../AddFromChainStore'

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

function getDisplayAds(bannerAds: BannerAD[], disabledBannerAds: string[] | null) {
  return bannerAds.filter((ad) => {
    const date = new Date()
    const startDate = new Date(ad.start_date)
    const endDate = new Date(ad.end_date)
    const isCorrectTime = date >= startDate && date <= endDate
    return disabledBannerAds !== null ? !disabledBannerAds.includes(ad.id) && isCorrectTime : false
  })
}

const BannerAdCard = observer(
  ({
    bannerData,
    chain,
    index,
    onClick,
    onClose,
    handleBtcBannerClick,
    handleAddChainClick,
    handleSwitchChainClick,
    isActive,
  }: {
    bannerData: BannerADData
    chain: ChainInfo
    index: number
    // eslint-disable-next-line no-unused-vars
    onClick: (bannerId: string, index: number) => void
    // eslint-disable-next-line no-unused-vars
    onClose: (bannerId: string, index: number) => void
    handleBtcBannerClick: () => void
    handleAddChainClick: (chain: string) => void
    handleSwitchChainClick: (chain: string) => void
    isActive: boolean
  }) => {
    const navigate = useNavigate()

    const handleClick = useCallback(() => {
      if (bannerData.id.trim().toLowerCase().includes('nbtc-banner')) {
        handleBtcBannerClick()
      } else if (bannerData.banner_type === 'redirect-interanlly') {
        const bannerId = getMixpanelBannerId(bannerData?.id, bannerData.attributes?.campaign_id)
        let redirectUrl = bannerData.redirect_url
        if (redirectUrl.includes('?')) {
          redirectUrl = `${redirectUrl}&bannerId=${bannerId}`
        } else {
          redirectUrl = `${redirectUrl}?bannerId=${bannerId}`
        }
        navigate(redirectUrl)
      } else if (bannerData.banner_type === 'add-chain') {
        handleAddChainClick(bannerData.redirect_url)
      } else if (bannerData.banner_type === 'switch-chain') {
        handleSwitchChainClick(bannerData.redirect_url)
      } else {
        if (bannerData?.redirect_url && bannerData?.redirect_url !== '#') {
          window.open(bannerData.redirect_url)
        }
      }

      onClick(bannerData.id, index)

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bannerData, index, onClick])

    return (
      <div
        className={`relative inline-block w-[22rem] overflow-hidden snap-center transform transition-transform ease-out duration-300 ${
          isActive ? 'scale-100' : 'scale-x-[93%] scale-y-[88%]'
        }`}
      >
        <button
          className='overflow-hidden rounded-lg w-full items-center flex dark:bg-gray-900 bg-white-100 aspect-[11/2]'
          onClick={handleClick}
        >
          {bannerData?.image_url ? (
            <img
              src={bannerData.image_url}
              alt='chain logo'
              className='z-0 right-0 h-[64px] w-full'
            />
          ) : (
            <div className='p-4 flex items-center'>
              <img
                src={bannerData?.logo ?? chain?.chainSymbolImageUrl}
                alt='chain logo'
                width='24'
                height='24'
                className='object-contain rounded-full h-10 w-10 mr-2 m-w-10'
                style={{
                  border: `8px solid ${chain?.theme.primaryColor}`,
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
          className='absolute top-[4px] right-[4px] bg-gray-800 rounded-full w-[16px] h-[16px] flex cursor-pointer'
          onClick={(event) => {
            event.stopPropagation()
            onClose(bannerData.id, index)
          }}
        >
          <X size={12} className='text-gray-100 m-auto' />
        </button>
      </div>
    )
  },
)

const GlobalBannersAD = React.memo(
  ({ handleBtcBannerClick }: { handleBtcBannerClick: () => void }) => {
    const chain = useChainInfo()
    const _chainId = useChainId()
    const [disabledBannerAds, setDisableBannerAds] = useState<string[] | null>(null)
    const scrollableContainerRef = useRef<HTMLDivElement>(null)
    const [timeCounter, setTimeCounter] = useState(0)
    const [autoSwitchBanner, setAutoSwitchBanner] = useState(true)
    const timerCountRef = useRef(0)
    const walletAddress = useAddress()
    const activeWallet = useActiveWallet()
    const osmoWalletAddress = activeWallet?.addresses.osmosis
    const cosmosWalletAddress = activeWallet?.addresses.cosmos
    const seiWalletAddress = activeWallet?.addresses.seiTestnet2

    const customChains = useCustomChains()
    const setActiveChain = useSetActiveChain()
    const chainInfos = useChainInfos()
    const [newChain, setNewChain] = useState<string | null>(null)

    const activeChain = useActiveChain() as AggregatedSupportedChain
    const isAggregatedView = activeChain === AGGREGATED_CHAIN_KEY
    const chainId = isAggregatedView ? 'all' : _chainId ?? ''
    const chainName = isAggregatedView ? 'All Chains' : chain?.chainName ?? ''

    const { data: bannerConfig, status: bannerConfigStatus } = useBannerConfig()
    const { leapBanners, isLeapBannersLoading } = useGetBannerData(_chainId ?? '')

    const { data: numiaBanners, status: numiaStatus } = useGetNumiaBanner(
      osmoWalletAddress ?? '',
      bannerConfig?.extension['position-ids'] ?? [],
      bannerConfigStatus,
    )

    // this is in seconds
    const autoScrollDuration = useMemo(() => {
      return bannerConfig?.extension?.['auto-scroll-duration'] ?? DEFAULT_AUTO_SCROLL_DURATION
    }, [bannerConfig])

    const showBannersLoading = useMemo(() => {
      const validLeapBanners = getDisplayAds(leapBanners ?? [], disabledBannerAds)

      if (validLeapBanners.length > 0 && (numiaStatus === 'loading' || isLeapBannersLoading)) {
        return true
      }

      return false
    }, [disabledBannerAds, isLeapBannersLoading, leapBanners, numiaStatus])

    const bannerAds = useMemo(() => {
      if (numiaStatus === 'loading' || isLeapBannersLoading) {
        return []
      }

      return [...(numiaBanners ?? []), ...(leapBanners ?? [])].filter(
        (banner) => banner?.visibleOn === 'ALL' || banner?.visibleOn === 'EXTENSION',
      )
    }, [isLeapBannersLoading, leapBanners, numiaBanners, numiaStatus])

    const displayADs = useMemo(() => {
      return getDisplayAds(bannerAds, disabledBannerAds)
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

      if (activeBannerData?.id !== activeBannerId) return

      const storedMixpanelBannerViewsInfo = sessionStorage.getItem(MIXPANEL_BANNER_VIEWS_INFO)
      const mixpanelBannerViewsInfo = JSON.parse(storedMixpanelBannerViewsInfo ?? '{}')

      if (!mixpanelBannerViewsInfo[walletAddress]?.includes(activeBannerId)) {
        try {
          if (!isCompassWallet()) {
            mixpanel.track(EventName.BannerView, {
              bannerId: getMixpanelBannerId(
                activeBannerId,
                activeBannerData.attributes?.campaign_id,
              ),
              bannerIndex: activeBannerIndex,
              chainId,
              chainName,
              positionId: getMixpanelPositionId(activeBannerId, activeBannerData),
              time: Date.now() / 1000,
            })
          }

          sessionStorage.setItem(
            MIXPANEL_BANNER_VIEWS_INFO,
            JSON.stringify({
              ...mixpanelBannerViewsInfo,
              [walletAddress]: [...(mixpanelBannerViewsInfo[walletAddress] ?? []), activeBannerId],
            }),
          )
        } catch (e) {
          captureException(e)
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
      cosmosWalletAddress,
      osmoWalletAddress,
      chainId,
      chainName,
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
        const newDisabledBannerAds = [...(disabledBannerAds as string[]), bannerId]
        const storedDisabledBannerAds = await Browser.storage.local.get([DISABLE_BANNER_ADS])
        const addressToUse = isCompassWallet() ? seiWalletAddress : cosmosWalletAddress
        let parsedDisabledAds = {}

        try {
          parsedDisabledAds = JSON.parse(storedDisabledBannerAds[DISABLE_BANNER_ADS] ?? '{}')
        } catch (_) {
          //
        }

        await Browser.storage.local.set({
          [DISABLE_BANNER_ADS]: JSON.stringify({
            ...parsedDisabledAds,
            [addressToUse ?? '']: newDisabledBannerAds,
          }),
        })

        if (!isCompassWallet()) {
          try {
            const banner = bannerAds.find((_banner) => _banner.id === bannerId)

            mixpanel.track(EventName.BannerClose, {
              bannerId: getMixpanelBannerId(bannerId, banner?.attributes?.campaign_id),
              bannerIndex,
              chainId,
              chainName,
              positionId: getMixpanelPositionId(bannerId, banner),
              time: Date.now() / 1000,
            })
          } catch (_) {
            //
          }

          setDisableBannerAds(newDisabledBannerAds)
        }
      },
      [disabledBannerAds, seiWalletAddress, cosmosWalletAddress, bannerAds, chainId, chainName],
    )

    const handleBannerClick = useCallback(
      (bannerId: string, bannerIndex: number) => {
        const banner = bannerAds.find((_banner) => _banner.id === bannerId)

        if (bannerId.includes('numia')) {
          try {
            if (banner && osmoWalletAddress) {
              ;(async function () {
                await postNumiaEvent(
                  osmoWalletAddress,
                  NumiaTrackAction.CLICKED,
                  banner.attributes as NumiaBannerAttribute,
                )
              })()
            }
          } catch (_) {
            //
          }
        }

        if (!isCompassWallet()) {
          try {
            mixpanel.track(EventName.BannerClick, {
              bannerId: getMixpanelBannerId(bannerId, banner?.attributes?.campaign_id),
              bannerIndex,
              chainId,
              chainName,
              positionId: getMixpanelPositionId(bannerId, banner),
              time: Date.now() / 1000,
            })
          } catch (e) {
            captureException(e)
          }
        }
      },
      [bannerAds, chainId, chainName, osmoWalletAddress],
    )

    const handleScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        // if event is user generated, then update the active banner index
        // for this we check the isTrusted property of the event
        if (e.isTrusted && !autoSwitchBanner) {
          const scrollLeft = e.currentTarget.scrollLeft
          const bannerIndex = Math.round(scrollLeft / AUTO_SWITCH_LEFT)
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
        const addressToUse = isCompassWallet() ? seiWalletAddress : cosmosWalletAddress

        setDisableBannerAds(parsedDisabledAds[addressToUse ?? ''] ?? [])
      }

      // eslint-disable-next-line no-console
      fn().catch(console.error)
    }, [cosmosWalletAddress, seiWalletAddress])

    const handleAddChainClick = useCallback(
      (chain: string) => {
        const item = customChains.find((customChain) => customChain.chainRegistryPath === chain)
        let chainKey
        for (const [key, chainInfo] of Object.entries(chainInfos)) {
          if (
            chainInfo.chainRegistryPath === item?.chainRegistryPath ||
            chainInfo.key === item?.chainRegistryPath
          ) {
            chainKey = key
            break
          }
        }
        if (chainKey) {
          setActiveChain(chainKey as AggregatedSupportedChain, item)
        } else if (item) {
          setNewChain(item.chainName)
        } else {
          captureException(`${chain} chain not found when clicked on banners`, {
            tags: uiErrorTags,
          })
        }
      },
      [chainInfos, customChains, setActiveChain],
    )

    const handleSwitchChainClick = useCallback(
      (chainRegistryPath: string) => {
        let chainKey
        for (const [key, chainInfo] of Object.entries(chainInfos)) {
          if (
            chainInfo.chainRegistryPath === chainRegistryPath ||
            chainInfo.key === chainRegistryPath
          ) {
            chainKey = key
            break
          }
        }
        if (chainKey) {
          setActiveChain(chainKey as AggregatedSupportedChain)
        } else {
          captureException(`${chainRegistryPath} chain not found when clicked on banners`, {
            tags: uiErrorTags,
          })
        }
      },
      [chainInfos, setActiveChain],
    )

    const handleLeftArrowClick = useCallback(() => {
      handleContainerScroll(activeBannerIndex - 1)
    }, [activeBannerIndex, handleContainerScroll])

    const handleRightArrowClick = useCallback(() => {
      handleContainerScroll(activeBannerIndex + 1)
    }, [activeBannerIndex, handleContainerScroll])

    if (!bannerAds || bannerAds.length === 0 || displayADs.length === 0) {
      if (!showBannersLoading) {
        return null
      }
    }

    return (
      <div className='flex flex-col items-center justify-center gap-1 mb-4'>
        <div
          ref={scrollableContainerRef}
          className='w-[400px] whitespace-nowrap overflow-x-auto overflow-y-hidden text-center px-7 h-16 hide-scrollbar snap-x snap-mandatory'
          onScroll={handleScroll}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showBannersLoading ? <GlobalBannersLoading /> : null}
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
                handleAddChainClick={handleAddChainClick}
                handleSwitchChainClick={handleSwitchChainClick}
                isActive={activeBannerIndex === index}
              />
            )
          })}
        </div>

        {displayADs.length > 1 ? (
          <div className='flex w-[352px] items-center justify-between'>
            <ArrowLeft
              size={17}
              onClick={handleLeftArrowClick}
              className={`text-gray-600 dark:text-gray-400 hover:text-black-100 hover:dark:text-white-100 cursor-pointer ${
                activeBannerIndex === 0 ? 'invisible' : ''
              }`}
            />

            <div
              className='flex gap-1'
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {displayADs.map((ad, i) => {
                const isActive = activeBannerId === ad.id

                return (
                  <span
                    role='button'
                    key={ad.id}
                    className={classNames('h-[5px] rounded-full transition-all cursor-pointer', {
                      'w-[20px] bg-black-100 dark:bg-white-100': isActive,
                      'w-[5px] bg-gray-500 dark:bg-gray-400': !isActive,
                    })}
                    onClick={() => handleContainerScroll(i)}
                  />
                )
              })}
            </div>
            <ArrowRight
              size={17}
              onClick={handleRightArrowClick}
              className={`text-gray-600 dark:text-gray-400 hover:text-black-100 hover:dark:text-white-100 cursor-pointer ${
                activeBannerIndex === displayADs.length - 1 ? 'invisible' : ''
              }`}
            />
          </div>
        ) : null}

        <AddFromChainStore
          isVisible={!!newChain}
          onClose={() => setNewChain(null)}
          newAddChain={customChains.find((d) => d.chainName === newChain) as ChainInfo}
        />
      </div>
    )
  },
)

GlobalBannersAD.displayName = 'GlobalBannersAD'
export { GlobalBannersAD }
