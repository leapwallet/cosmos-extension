import {
  useAddressStore,
  useFeatureFlags,
  useLuminaTxClientStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { BalanceStore } from '@leapwallet/cosmos-wallet-store'
import { CheckCircle } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import { Button } from 'components/ui/button'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import { motion } from 'framer-motion'
import { Images } from 'images'
import loadingAnimation from 'lottie-files/light-node-loading.json'
import Lottie from 'lottie-react'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { clientIdStore } from 'stores/client-id-store'
import { lightNodeStore } from 'stores/light-node-store'
import browser from 'webextension-polyfill'

import BasicAccordion from './components/BaseAccordion'
import LightNodeDetails from './components/LightNodeDetails'
import LightNodeSyncProgress from './components/LightNodeSyncProgress'
import LightNodeSettings from './components/Settings'
import { LightNodeBanner } from './LumisNFT'

const ToggleCard = ({
  title,
  isEnabled,
  onClick,
}: {
  title: string
  isEnabled: boolean
  onClick: (val: boolean) => void
}) => {
  return (
    <div
      className={classNames(
        'flex justify-between items-center p-4 bg-white-100 dark:bg-gray-900 cursor-pointer rounded-xl',
      )}
    >
      <div className={'flex-1 text-xs font-medium text-black-100 dark:text-white-100'}>{title}</div>
      <input
        type='checkbox'
        id='toggle-switch3'
        checked={isEnabled}
        onChange={({ target }) => onClick(target.checked)}
        className='flex-2 h-7 w-[50px] appearance-none rounded-full cursor-pointer bg-gray-600/30 transition duration-200 checked:bg-green-600 relative'
      />
    </div>
  )
}

const LoadingAnimation = () => {
  const initialRef = useRef<Record<string, never | number>>({ opacity: 0, y: 50 })
  useEffect(() => {
    const timeoutMilliSecond = 1000
    const timeoutId = setTimeout(() => {
      initialRef.current = {}
    }, timeoutMilliSecond)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <motion.div
      initial={initialRef.current}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeIn' }}
      className='flex flex-col items-center gap-2'
    >
      <Lottie
        loop={true}
        autoplay={true}
        animationData={loadingAnimation}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
      />
      <span className='font-bold'>Connecting to Celestia network...</span>
    </motion.div>
  )
}

const LightNode = ({
  goBack,
  showLightNodeSettings,
  setShowLightNodeSettings,
  setActiveTab,
  showBanner,
  balanceStore,
}: {
  goBack: (toHome?: boolean) => void
  showLightNodeSettings: boolean
  setShowLightNodeSettings: (show: boolean) => void
  setActiveTab: React.Dispatch<React.SetStateAction<'Light Node' | 'Lumi NFT'>>
  showBanner: boolean
  balanceStore: BalanceStore
}) => {
  const { primaryAddress } = useAddressStore()
  const [showAnimation, setShowAnimation] = useState(false)
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false)
  const handleAccordionClick = () => {
    setShowMoreDetails(!showMoreDetails)
  }
  const { data: featureFlags } = useFeatureFlags()

  const { setForceLuminaTxClient } = useLuminaTxClientStore()

  const enableLuminaTxClient = (v: boolean) => {
    setForceLuminaTxClient(v)
    balanceStore.setUseCelestiaBalanceStore(v)
  }

  const toggleSampling = () => {
    if (lightNodeStore.isLightNodeRunning) {
      lightNodeStore.stopNode(primaryAddress, clientIdStore.clientId)
      enableLuminaTxClient(false)
    } else {
      setShowAnimation(true)
      lightNodeStore.startNode(primaryAddress, clientIdStore.clientId).then(() => {
        browser.runtime.sendMessage({
          type: 'capture-light-node-stats',
          payload: {},
        })
      })
    }

    lightNodeStore.setLightNodeRunning(!lightNodeStore.isLightNodeRunning)

    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonName: lightNodeStore.isLightNodeRunning
          ? ButtonName.SYNC_STOP
          : ButtonName.SYNC_START,
        buttonType: ButtonType.CELESTIA_LIGHT_NODE,
        uuid: clientIdStore.clientId,
      })
    } catch (error) {
      captureException(error)
    }
  }

  const navigateToHome = () => {
    goBack(true)
  }

  const initialRef = useRef<Record<string, never | number>>({ opacity: 0, y: 50 })

  useEffect(() => {
    const timeoutMilliSecond = 1000
    const timeoutId = setTimeout(() => {
      initialRef.current = {}
    }, timeoutMilliSecond)

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (showAnimation) {
      setTimeout(() => {
        setShowAnimation(false)
      }, 3000)
    }
  }, [showAnimation])

  const handleShare = async () => {
    const tweetText =
      featureFlags?.light_node?.tweetText ??
      `I just used @leap_wallet to run @CelestiaOrg light node ✨\n\nModularity & data availability now scaled by you & me.\n\nCome & take it\nleapwallet.io/download`
    const shareUrl =
      featureFlags?.light_node?.tweetImageUrl ?? `https://assets.leapwallet.io/light-node-share.png`
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText,
    )}&url=${encodeURIComponent(shareUrl)}`

    // Open Twitter compose window
    window.open(twitterShareUrl.toString(), '_blank')
  }

  const handleClearStorage = async () => {
    setShowLightNodeSettings(false)
    lightNodeStore.clearLastSyncedInfo()
  }

  return (
    <>
      <div className='p-6 flex flex-col gap-5 w-full h-full'>
        {showAnimation ? (
          <LoadingAnimation />
        ) : (
          <>
            {showBanner && (
              <div className='cursor-pointer' onClick={() => setActiveTab('Lumi NFT')}>
                <LightNodeBanner
                  title={
                    lightNodeStore.isLightNodeRunning
                      ? 'You can mint your exclusive Lumi NFT now!'
                      : `${
                          !lightNodeStore.lastSyncedInfo?.lastSyncedHeader ? 'Run a' : 'Resume your'
                        } Light node to unlock your exclusive Lumi NFT`
                  }
                />
              </div>
            )}

            {lightNodeStore.isLightNodeRunning ? (
              <>
                <LightNodeSyncProgress
                  network='Mainnet'
                  syncedPercentage={lightNodeStore.syncedPercentage}
                  isLightNodeRunning={lightNodeStore.isLightNodeRunning}
                  latestHeader={lightNodeStore.latestHeader ?? undefined}
                  blockTime={lightNodeStore.blockTime}
                  onShareClick={handleShare}
                />

                <ToggleCard
                  title='Use Light Node to fetch Celestia balances & broadcast transactions'
                  isEnabled={balanceStore.useCelestiaBalanceStore}
                  onClick={(v) => enableLuminaTxClient(v)}
                />
                <BasicAccordion
                  title='More Details'
                  toggleAccordion={handleAccordionClick}
                  isExpanded={showMoreDetails}
                >
                  <LightNodeDetails
                    latestHeader={lightNodeStore.latestHeader}
                    events={lightNodeStore.visualData}
                    syncedPercentage={lightNodeStore.syncedPercentage}
                  />
                </BasicAccordion>
                {lightNodeStore.syncedPercentage === 100 && (
                  <div className='flex gap-1 items-center justify-center'>
                    <CheckCircle className='w-5 h-5 text-accent-success-200' weight='fill' />
                    <span className='text-sm font-mediumn'>
                      You&apos;re in sync with the most recent block
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                {!lightNodeStore.lastSyncedInfo?.lastSyncedHeader ? (
                  <>
                    <img src={Images.Misc.LightNodeBanner} alt='light-node-banner' />
                    <div className='flex flex-col gap-3'>
                      <span className='font-bold text-mdl'>Run your Celestia Light Node</span>
                      <span className='text-sm text-muted-foreground'>
                        Help secure Celestia and stay connected to verified data by running a
                        Celestia light node. Don&apos;t trust, verify.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <LightNodeSyncProgress
                      network='Mainnet'
                      syncedPercentage={lightNodeStore.lastSyncedInfo?.syncedPercentage}
                      isLightNodeRunning={lightNodeStore.isLightNodeRunning}
                      onShareClick={handleShare}
                      blockTime={lightNodeStore.blockTime}
                    />
                    <span className='text-sm text-muted-foreground'>
                      Your light node is currently paused. Resume verification to help secure
                      Celestia and stay connected to verified data by running your Celestia light
                      node.
                    </span>
                  </>
                )}
              </>
            )}

            <footer className='mt-auto bg-secondary-100 -m-6 py-6 px-5 sticky bottom-0 !max-w-none'>
              {lightNodeStore.isLightNodeRunning ? (
                <div className='flex justify-between gap-2 [&>button]:flex-1'>
                  <Button variant={'secondary'} onClick={toggleSampling}>
                    Stop Verifying
                  </Button>

                  <Button onClick={navigateToHome}>Home</Button>
                </div>
              ) : (
                <Button className='w-full' onClick={toggleSampling}>
                  {!lightNodeStore.lastSyncedInfo?.lastSyncedHeader
                    ? 'Start Verifying'
                    : 'Resume Verifying'}
                </Button>
              )}
            </footer>
          </>
        )}
      </div>

      <LightNodeSettings
        isVisible={showLightNodeSettings}
        handleClearStorage={handleClearStorage}
        onCloseHandler={() => setShowLightNodeSettings(false)}
      />
    </>
  )
}

export default observer(LightNode)
