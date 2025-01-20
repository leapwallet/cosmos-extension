import { useAddressStore, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { CheckCircle } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import { ButtonName, ButtonType, EventName, PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import { Images } from 'images'
import loadingAnimation from 'lottie-files/light-node-loading.json'
import Lottie from 'lottie-react'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { clientIdStore } from 'stores/client-id-store'
import { lightNodeStore } from 'stores/light-node-store'
import { Colors } from 'theme/colors'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

import Text from '../../../../components/text'
import BasicAccordion from './components/BaseAccordion'
import LightNodeHeader from './components/Header'
import LightNodeDetails from './components/LightNodeDetails'
import LightNodeSyncProgress from './components/LightNodeSyncProgress'
import LightNodeSettings from './components/Settings'

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
      <Text size='md' className='font-bold'>
        Connecting to Celestia network...
      </Text>
    </motion.div>
  )
}

const LightNode = ({ goBack }: { goBack: (toHome?: boolean) => void }) => {
  const { primaryAddress } = useAddressStore()
  const [showLightNodeSettings, setShowLightNodeSettings] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false)
  const handleAccordionClick = () => {
    setShowMoreDetails(!showMoreDetails)
  }

  const { data: featureFlags } = useFeatureFlags()

  const toggleSampling = () => {
    if (lightNodeStore.isLightNodeRunning) {
      lightNodeStore.stopNode(primaryAddress, clientIdStore.clientId)
    } else {
      lightNodeStore.startNode()
      setShowAnimation(true)
      browser.runtime.sendMessage({
        type: 'capture-light-node-stats',
        payload: {},
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

  usePageView(PageName.CelestiaLightNode, true, {
    uuid: clientIdStore.clientId,
  })

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
  const clearIndexedDB = async () => {
    const databases = await indexedDB.databases()
    databases.forEach((element) => {
      if (element.name?.includes('celestia')) {
        indexedDB.deleteDatabase(element.name)
      }
    })
  }
  const handleClearStorage = async () => {
    setShowLightNodeSettings(false)
    lightNodeStore.clearLastSyncedInfo()
    await clearIndexedDB()
  }

  return (
    <div
      className={classNames('panel-height panel-width enclosing-panel', {
        'pb-5': !isSidePanel(),
      })}
    >
      <PopupLayout
        className='relative'
        header={
          <LightNodeHeader
            onBack={() => goBack()}
            showSettings={
              !lightNodeStore.isLightNodeRunning &&
              !!lightNodeStore.lastSyncedInfo?.lastSyncedHeader
            }
            onSettings={() => setShowLightNodeSettings(true)}
          />
        }
      >
        <div className='p-6'>
          {showAnimation ? (
            <LoadingAnimation />
          ) : (
            <div className='flex flex-col gap-3 w-full mb-16'>
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
                      <CheckCircle className='w-5 h-5 text-green-600' weight='fill' />
                      <Text size='sm' color={'dark:text-gray-400 text-black-300'}>
                        You&apos;re in sync with the most recent block
                      </Text>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {!lightNodeStore.lastSyncedInfo?.lastSyncedHeader ? (
                    <>
                      <img src={Images.Misc.LightNodeBanner} alt='light-node-banner' />
                      <Text
                        size='md'
                        color={'dark:text-gray-200 text-black-100'}
                        className='font-bold text-left'
                      >
                        Run your Celestia Light Node
                      </Text>
                      <Text size='sm' color={'dark:text-gray-400 text-black-300'}>
                        Support a decentralized network and stay connected to verified data by
                        keeping the Celestia light node on. Don&apos;t trust, verify
                      </Text>
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
                      <Text size='sm' color={'dark:text-gray-400 text-black-300'}>
                        Your light node is currently paused. Support a decentralized network and
                        stay connected to verified data by keeping the Celestia light node on.
                        Don&apos;t trust, verify.
                      </Text>
                    </>
                  )}
                </>
              )}

              <section className='fixed right-0 bottom-0 left-0 px-6 pb-6 pt-4 dark:bg-black-100 bg-gray-50'>
                {lightNodeStore.isLightNodeRunning ? (
                  <div className='flex justify-between gap-2'>
                    <Buttons.Generic
                      color={Colors.gray900}
                      size='normal'
                      className='w-full !text-white-100'
                      title={'Stop Verifying'}
                      onClick={toggleSampling}
                    >
                      Stop Verifying
                    </Buttons.Generic>

                    <Buttons.Generic
                      color={Colors.green600}
                      size='normal'
                      className='w-full'
                      title={'Go Home'}
                      onClick={navigateToHome}
                    >
                      Home
                    </Buttons.Generic>
                  </div>
                ) : (
                  <Buttons.Generic
                    color={Colors.green600}
                    size='normal'
                    className='w-full'
                    title={'Start Verifying'}
                    onClick={toggleSampling}
                  >
                    {!lightNodeStore.lastSyncedInfo?.lastSyncedHeader
                      ? 'Start Verifying'
                      : 'Resume Verifying'}
                  </Buttons.Generic>
                )}
              </section>
            </div>
          )}
        </div>
      </PopupLayout>
      <LightNodeSettings
        isVisible={showLightNodeSettings}
        handleClearStorage={handleClearStorage}
        onCloseHandler={() => setShowLightNodeSettings(false)}
      />
    </div>
  )
}

export default observer(LightNode)
