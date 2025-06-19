import {
  NumiaBannerAttribute,
  NumiaTrackAction,
  postNumiaEvent,
  useActiveWallet,
  useAddress,
  useBannerConfig,
  useChainInfo,
  useGetBannerData,
  useGetNumiaBanner,
} from '@leapwallet/cosmos-wallet-hooks'
import { captureException } from '@sentry/react'
import { EventName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { DISABLE_BANNER_ADS } from 'config/storage-keys'
import { AnimatePresence } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AggregatedSupportedChain } from 'types/utility'
import Browser from 'webextension-polyfill'

import { BannerAdCard } from './ad-card'
import { BannerControls } from './controls'
import { useCarousel } from './use-carousel'
import {
  getDisplayAds,
  getMixpanelBannerId,
  getMixpanelPositionId,
  MIXPANEL_BANNER_VIEWS_INFO,
} from './utils'

export const GlobalBannersAD = React.memo(({ show = true }: { show?: boolean }) => {
  const chain = useChainInfo()
  const [disabledBannerAds, setDisableBannerAds] = useState(new Set<string>())
  const walletAddress = useAddress()
  const activeWallet = useActiveWallet()
  const osmoWalletAddress = activeWallet?.addresses.osmosis
  const cosmosWalletAddress = activeWallet?.addresses.cosmos
  const seiWalletAddress = activeWallet?.addresses.seiTestnet2

  const activeChain = useActiveChain() as AggregatedSupportedChain
  const isAggregatedView = activeChain === AGGREGATED_CHAIN_KEY
  const chainId = isAggregatedView ? 'all' : chain?.chainId ?? ''
  const chainName = isAggregatedView ? 'All Chains' : chain?.chainName ?? ''

  const { data: bannerConfig, status: bannerConfigStatus } = useBannerConfig()
  const { leapBanners, isLeapBannersLoading } = useGetBannerData(chain?.chainId)

  const { data: numiaBanners, status: numiaStatus } = useGetNumiaBanner(
    [osmoWalletAddress ?? ''],
    bannerConfig?.extension['position-ids'] ?? [],
    bannerConfigStatus,
  )

  const bannerAds = useMemo(() => {
    if (numiaStatus === 'loading' || isLeapBannersLoading) {
      return []
    }

    return [...(numiaBanners ?? []), ...(leapBanners ?? [])].filter(
      (banner) => banner?.visibleOn === 'ALL' || banner?.visibleOn === 'EXTENSION',
    )
  }, [isLeapBannersLoading, leapBanners, numiaBanners, numiaStatus])

  const displayADs = useMemo(() => {
    return getDisplayAds(bannerAds, Array.from(disabledBannerAds))
  }, [bannerAds, disabledBannerAds])

  const {
    scrollableContainerRef,
    activeBannerIndex,
    handleContainerScroll,
    handleScroll,
    handleMouseEnter,
    handleMouseLeave,
  } = useCarousel(displayADs.length, bannerConfig?.extension?.['auto-scroll-duration'])

  const activeBannerData = displayADs[activeBannerIndex]
  const activeBannerId = activeBannerData?.id

  useEffect(() => {
    if (!activeBannerId || isNaN(activeBannerIndex)) return

    if (activeBannerData?.id !== activeBannerId) return

    const storedMixpanelBannerViewsInfo = sessionStorage.getItem(MIXPANEL_BANNER_VIEWS_INFO)
    const mixpanelBannerViewsInfo = JSON.parse(storedMixpanelBannerViewsInfo ?? '{}')

    if (!mixpanelBannerViewsInfo[walletAddress]?.includes(activeBannerId)) {
      try {
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

  const handleBannerClose = useCallback(
    async (bannerId: string, bannerIndex: number) => {
      const newDisabledBannerAds = new Set(disabledBannerAds)
      newDisabledBannerAds.add(bannerId)

      const storedDisabledBannerAds = await Browser.storage.local.get([DISABLE_BANNER_ADS])
      const addressToUse = seiWalletAddress
      let parsedDisabledAds = {}

      try {
        parsedDisabledAds = JSON.parse(storedDisabledBannerAds[DISABLE_BANNER_ADS] ?? '{}')
      } catch (_) {
        //
      }

      await Browser.storage.local.set({
        [DISABLE_BANNER_ADS]: JSON.stringify({
          ...parsedDisabledAds,
          [addressToUse ?? '']: Array.from(newDisabledBannerAds),
        }),
      })

      setDisableBannerAds(newDisabledBannerAds)
    },
    [disabledBannerAds, seiWalletAddress],
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
    },
    [bannerAds, osmoWalletAddress],
  )

  useEffect(() => {
    const fn = async () => {
      const disabledBannerAds = await Browser.storage.local.get([DISABLE_BANNER_ADS])
      const parsedDisabledAds = JSON.parse(disabledBannerAds[DISABLE_BANNER_ADS] ?? '{}')
      const addressToUse = seiWalletAddress

      setDisableBannerAds(new Set(parsedDisabledAds[addressToUse ?? ''] ?? []))
    }

    // eslint-disable-next-line no-console
    fn().catch(console.error)
  }, [cosmosWalletAddress, seiWalletAddress])

  return (
    <GlobalBannersWrapper items={displayADs.length} show={show}>
      <AnimatePresence mode='wait'>
        {displayADs.length > 0 ? (
          <div
            className={
              'flex flex-col items-center justify-center w-full overflow-visible mb-5 transition-all duration-150 ease-out origin-top'
            }
          >
            <div
              className='flex items-center overflow-hidden px-4 snap-x snap-mandatory gap-2 w-full h-full'
              ref={scrollableContainerRef}
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
                    activeIndex={activeBannerIndex}
                  />
                )
              })}
            </div>
            {displayADs.length > 1 && (
              <BannerControls
                activeBannerIndex={activeBannerIndex}
                activeBannerId={activeBannerId}
                totalItems={displayADs.length}
                handleContainerScroll={handleContainerScroll}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
              />
            )}
          </div>
        ) : null}
      </AnimatePresence>
    </GlobalBannersWrapper>
  )
})

GlobalBannersAD.displayName = 'GlobalBannersAD'

const GlobalBannersWrapper = observer(
  (props: { items: number; show: boolean; children: React.ReactNode }) => {
    const show = props.items > 0 && props.show

    return (
      <div
        className='w-full overflow-hidden transition-all h-0 will-change-auto duration-300 ease-in-out'
        style={{
          height: show ? (props.items === 1 ? '84px' : '105px') : '0px', // 84px without controls
        }}
      >
        {props.children}
      </div>
    )
  },
)
