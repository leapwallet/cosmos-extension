import { useActiveWallet, useChainInfo, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { type Icon, Path, ShoppingBag, Wallet } from '@phosphor-icons/react'
import { ArrowsLeftRight } from '@phosphor-icons/react/dist/ssr'
import { captureException } from '@sentry/react'
import { useHardCodedActions } from 'components/search-modal'
import Text from 'components/text'
import { ButtonName, ButtonType, EventName, PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY, LEAPBOARD_SWAP_URL, LEAPBOARD_URL } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useAddress } from 'hooks/wallet/useAddress'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AggregatedSupportedChain } from 'types/utility'
import { UserClipboard } from 'utils/clipboard'
import { trim } from 'utils/strings'

import FundsSheet from './FundSheet'

export type FundBannerData = {
  icon: Icon
  title: string
  content: string
  textColor: string
  onClick: () => void
  hide?: boolean
}

export interface FundBannersProps {
  handleCopyClick: () => void
}

const FundBanners = React.memo(() => {
  const address = useAddress()
  const activeWallet = useActiveWallet()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const { data: featureFlags } = useFeatureFlags()
  const chain = useChainInfo()
  const { handleSwapClick, handleBuyClick } = useHardCodedActions()
  const [showCopyAddress, setShowCopyAddress] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const token = chain?.denom?.toUpperCase()
  const isAggregatedView = useMemo(() => activeChain === AGGREGATED_CHAIN_KEY, [activeChain])
  const swapPath = `/swap?sourceChainId=${
    chain?.chainId === 'cosmoshub-4' ? 'osmosis-1' : 'cosmoshub-4'
  }&destinationChainId=${chain?.chainId}&pageSource=${PageName.ZeroState}`
  const chainId = isAggregatedView ? 'all' : chain?.chainId ?? ''
  const chainName = isAggregatedView ? 'All Chains' : chain?.chainName ?? ''

  useEffect(() => {
    if (showCopyAddress) {
      setTimeout(() => {
        setShowCopyAddress(false)
      }, 2000)
    }
  }, [showCopyAddress])

  const transactUrl = useMemo(() => {
    return `${LEAPBOARD_SWAP_URL}${isAggregatedView ? '' : `&destinationChainId=${chain?.chainId}`}`
  }, [chain?.chainId, isAggregatedView])

  const trackCTAEvent = useCallback(
    (buttonName: string, redirectURL?: string) => {
      try {
        mixpanel.track(EventName.ButtonClick, {
          buttonType: ButtonType.ADD_FUNDS,
          buttonName,
          redirectURL,
          time: Date.now() / 1000,
          chainId,
          chainName,
        })
      } catch (e) {
        captureException(e)
      }
    },
    [chainId, chainName],
  )

  const bannerData: FundBannerData[] = useMemo(
    () =>
      [
        {
          icon: Wallet,
          title: 'Receive / Deposit',
          content: isAggregatedView
            ? 'Copy wallet address to deposit Cosmos tokens'
            : `Copy your wallet address to deposit ${token}`,
          textColor: '#FFC770',
          onClick: () => {
            if (isAggregatedView) {
              return
            }

            if (!activeWallet) return
            UserClipboard.copyText(address)

            setShowCopyAddress(true)
            trackCTAEvent(ButtonName.RECEIVE_ASSETS)
          },
        },
        {
          icon: ArrowsLeftRight,
          title: 'Swap from Cosmos tokens',
          content: `Swap into ${token} from 300+ other tokens`,
          textColor: '#70B7FF',
          onClick: () => {
            handleSwapClick(transactUrl, swapPath)
            trackCTAEvent(
              ButtonName.IBC_SWAP,
              featureFlags?.all_chains?.swap === 'redirect' ? transactUrl : swapPath,
            )
          },
          hide: isAggregatedView,
        },
        {
          icon: ShoppingBag,
          title: 'On-ramp from fiat',
          content: `Buy ${isAggregatedView ? 'Cosmos tokens' : token} using USD, EUR, GBP & others`,
          textColor: '#F47CCE',
          onClick: () => {
            handleBuyClick()
            trackCTAEvent(ButtonName.BUY, '/buy')
          },
        },
        {
          icon: Path,
          title: 'Bridge from EVMs, Solana',
          content: 'Swap & bridge tokens from other ecosystems',
          textColor: '#3ACF92',
          onClick: () => {
            window.open(transactUrl, '_blank')
            trackCTAEvent(ButtonName.BRIDGE, transactUrl)
          },
        },
      ].filter((d) => !d?.hide),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeWallet,
      address,
      chain?.bip44?.coinType,
      chain?.key,
      trackCTAEvent,
      transactUrl,
      isAggregatedView,
      token,
    ],
  )

  const modalTitle = isAggregatedView
    ? 'Get started'
    : `Get started on ${trim(chain?.chainName, 14)}`

  return (
    <>
      <div className='flex flex-col w-[352px] bg-white-100 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl p-6 mt-1'>
        <div className='flex mb-4 justify-between'>
          <div className='flex'>
            {bannerData.map((d: FundBannerData, index: number) => (
              <div
                key={index}
                className='flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 w-9 h-9 rounded-3xl ml-[-4px]'
              >
                <div className='!h-5 !w-5' style={{ color: d.textColor }}>
                  <d.icon size={20} />
                </div>
              </div>
            ))}
          </div>
          <button
            className='bg-gray-100 dark:bg-gray-850 rounded-[32px] px-6 py-2 text-sm font-bold text-black-100 dark:text-white-100'
            onClick={() => setIsModalOpen(true)}
          >
            Start
          </button>
        </div>
        <Text className='font-bold mb-2'>Nothing here, yet...</Text>
        <Text size='xs' color='text-gray-600 dark:text-gray-400' className='font-medium'>
          The interchain is more fun with some tokens!
          <br />
          Use Leap&apos;s in-wallet options to get started.
        </Text>
      </div>
      <FundsSheet
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bannerData={bannerData}
        showCopyAddress={showCopyAddress}
        modalTitle={modalTitle}
      />
    </>
  )
})

FundBanners.displayName = 'FundBanners'
export { FundBanners }
