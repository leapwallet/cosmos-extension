import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore } from '@leapwallet/cosmos-wallet-store'
import RewardStrip from 'components/alert-strip/RewardStrip'
import { motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { activeChainStore } from 'stores/active-chain-store'
import { chainInfoStore } from 'stores/chain-infos-store'

import { useHandleInitialAnimation } from '../hooks'
import { GlobalBannersAD, HomeButtons } from './index'

export const ButtonsAndBanners = observer(
  ({
    handleBtcBannerClick,
    rootBalanceStore,
    isTokenLoading,
    setShowReceiveSheet,
    setShowMantraFaucetResp,
  }: {
    handleBtcBannerClick: () => void
    rootBalanceStore: RootBalanceStore
    isTokenLoading: boolean
    setShowReceiveSheet: (show: boolean) => void
    setShowMantraFaucetResp: (resp: string) => void
  }) => {
    const activeChain = useActiveChain()
    const initialRef = useHandleInitialAnimation(activeChain)
    return (
      <motion.div
        initial={initialRef.current}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: 'easeIn' }}
        className='w-full flex flex-col items-center justify-center'
      >
        <div className='px-7 w-full'>
          <HomeButtons setShowReceiveSheet={() => setShowReceiveSheet(true)} />
        </div>
        {chainInfoStore.chainInfos[activeChain as SupportedChain]?.chainId ===
          'mantra-hongbai-1' && (
          <RewardStrip
            activeChainStore={activeChainStore}
            chainInfosStore={chainInfoStore}
            rootBalanceStore={rootBalanceStore}
            setShowMantraFaucetResp={setShowMantraFaucetResp}
          />
        )}
        {!isTokenLoading && <GlobalBannersAD handleBtcBannerClick={handleBtcBannerClick} />}
      </motion.div>
    )
  },
)
