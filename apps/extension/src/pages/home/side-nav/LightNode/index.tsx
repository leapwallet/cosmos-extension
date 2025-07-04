import { useAddressStore, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { checkMintEligibility, getNFTBalance, NFTMetadata } from '@leapwallet/cosmos-wallet-sdk'
import { Key } from '@leapwallet/leap-keychain'
import { GearSix } from '@phosphor-icons/react'
import { LoaderAnimation } from 'components/loader/Loader'
import BottomModal, { BottomModalClose } from 'components/new-bottom-modal'
import { AnimatePresence, motion } from 'framer-motion'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useCallback, useEffect, useState } from 'react'
import semver from 'semver'
import { balanceStore, evmBalanceStore } from 'stores/balance-store'
import { lightNodeStore } from 'stores/light-node-store'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'
import { slideVariants } from 'utils/motion-variants/global-layout-motions'
import browser from 'webextension-polyfill'

import LightNodeHeader from './components/Header'
import LightNode from './LightNode'
import LumisNFT from './LumisNFT'

const lightNodeTabs = ['Light Node', 'Lumi NFT'] as const
type LightNodeTab = typeof lightNodeTabs[number]

const LightNodePage = ({
  isVisible,
  goBack,
}: {
  isVisible: boolean
  goBack: (toHome?: boolean) => void
}) => {
  const [activeTab, setActiveTab] = useState<LightNodeTab>('Light Node')
  const [showLightNodeSettings, setShowLightNodeSettings] = useState(false)
  const [isEligible, setIsEligible] = useState(false)
  const [loading, setLoading] = useState(false)
  const { activeWallet } = useActiveWallet()
  const [metadata, setMetadata] = useState<NFTMetadata>()
  const { data: featureFlags } = useFeatureFlags()
  const { primaryAddress } = useAddressStore()
  const [mintedWallet, setMintedWallet] = useState<Key<string> | null>(null)
  const version = browser.runtime.getManifest().version
  const isFeatureFlagEnabled =
    featureFlags?.lightNodeNFT?.extension === 'active' ||
    semver.satisfies(version, featureFlags?.lightNodeNFT?.extension_v2 || '=0.0.1')
  const showBanner = isFeatureFlagEnabled && !loading && isEligible

  const handleTabChange = (tab: LightNodeTab) => {
    setActiveTab(tab)
  }

  const checkNFTBalance = useCallback(async () => {
    const wallets = await Wallet.getAllWallets()
    for (const wallet of Object.values(wallets)) {
      const balance = await getNFTBalance(wallet.addresses?.forma ?? '')
      if (balance.hasNFT) {
        setMintedWallet(wallet)
        if (balance.metadata) {
          setMetadata(balance.metadata)
        }
        return true
      }
    }
    return false
  }, [])

  const checkEligibility = useCallback(async () => {
    if (primaryAddress) {
      const isEligible = await checkMintEligibility(primaryAddress)
      setIsEligible(isEligible)
    }
  }, [primaryAddress])

  const fetcher = useCallback(async () => {
    if (!activeWallet?.addresses.forma) return
    setLoading(true)
    const balance = await getNFTBalance(activeWallet?.addresses.forma ?? '')
    if (!balance.hasNFT) {
      const isMinted = await checkNFTBalance()
      if (!isMinted) {
        checkEligibility()
      }
    }
    if (balance.metadata) {
      setMetadata(balance.metadata)
    }
    setLoading(false)
  }, [activeWallet?.addresses.forma, checkEligibility, checkNFTBalance])

  useEffect(() => {
    fetcher()
  }, [fetcher])

  useEffect(() => {
    if (lightNodeStore.isLightNodeRunning) {
      setTimeout(() => {
        checkEligibility()
      }, 3000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkEligibility, lightNodeStore.isLightNodeRunning])

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={goBack}
      className='p-0 h-full flex flex-col'
      title={<LightNodeHeader />}
      actionButton={<BottomModalClose />}
      secondaryActionButton={
        showLightNodeSettings && (
          <button
            onClick={() => setShowLightNodeSettings(true)}
            className='p-3 text-muted-foreground hover:text-foreground transition-colors'
          >
            <GearSix size={18} />
          </button>
        )
      }
    >
      <header className='sticky top-0 z-10 bg-secondary-50'>
        {isFeatureFlagEnabled && (
          <div className='flex w-full border-b border-border-bottom relative -mt-px'>
            {lightNodeTabs.map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-3 text-center font-bold text-sm transition-colors duration-200 ${
                  tab !== activeTab && 'text-muted-foreground'
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ))}
            <div
              className='rounded-full absolute -bottom-0.5 h-1 bg-green-600 transition-all duration-300'
              style={{
                left: activeTab === 'Light Node' ? '12.5%' : '62.5%',
                width: '25%',
              }}
            />
          </div>
        )}
      </header>

      <AnimatePresence mode='wait' initial={false}>
        {activeTab === 'Light Node' ? (
          <motion.div
            key={'light-node'}
            initial='exit'
            animate='animate'
            exit='exit'
            variants={slideVariants}
            transition={transition150}
            className='flex-1'
          >
            <LightNode
              goBack={goBack}
              showLightNodeSettings={showLightNodeSettings}
              setShowLightNodeSettings={setShowLightNodeSettings}
              setActiveTab={setActiveTab}
              showBanner={showBanner}
              balanceStore={balanceStore}
            />
          </motion.div>
        ) : loading ? (
          <motion.div
            key={'loading'}
            initial='hidden'
            animate='visible'
            exit='hidden'
            variants={opacityFadeInOut}
            transition={transition150}
            className='flex justify-center items-center h-[calc(100%-116px)]'
          >
            <LoaderAnimation color='text-green-600' className='h-20 w-20' />
          </motion.div>
        ) : (
          <motion.div
            key={'lumis-nft'}
            initial='enter'
            animate='animate'
            exit='enter'
            variants={slideVariants}
            transition={transition150}
          >
            <LumisNFT
              isEligible={isEligible}
              nftData={metadata}
              fetcher={fetcher}
              evmBalanceStore={evmBalanceStore}
              mintedWallet={mintedWallet}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </BottomModal>
  )
}

export default LightNodePage
