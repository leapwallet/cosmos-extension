import { useChainInfo, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore } from '@leapwallet/cosmos-wallet-store'
import { WarningCircle } from '@phosphor-icons/react'
import { AggregatedBalanceLoading } from 'components/aggregated'
import Text from 'components/text'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { motion } from 'framer-motion'
import { useChainPageInfo } from 'hooks'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo } from 'react'
import { AggregatedSupportedChain } from 'types/utility'
import { closeSidePanel } from 'utils/closeSidePanel'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import Browser from 'webextension-polyfill'

import { useHandleInitialAnimation } from '../hooks'
import { TotalBalance } from './GeneralHome'
import { DepositBTCBanner } from './index'

export const HeroSection = observer(
  ({
    handleBtcBannerClick,
    rootBalanceStore,
    isTokenLoading,
  }: {
    handleBtcBannerClick: () => void
    rootBalanceStore: RootBalanceStore
    isTokenLoading: boolean
  }) => {
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const { activeWallet } = useActiveWallet()
    const chain = useChainInfo()
    const chains = useGetChains()
    const { evmBalanceStore } = rootBalanceStore
    const walletAddresses = useGetWalletAddresses()

    const { gradientChainColor } = useChainPageInfo()
    const initialRef = useHandleInitialAnimation(activeChain)
    const disabled = useMemo(() => {
      return (
        activeChain !== AGGREGATED_CHAIN_KEY &&
        activeWallet?.walletType === WALLETTYPE.LEDGER &&
        !isLedgerEnabled(
          activeChain as SupportedChain,
          chain?.bip44.coinType,
          Object.values(chains),
        )
      )
    }, [activeChain, activeWallet?.walletType, chain?.bip44.coinType, chains])

    const handleConnectEvmWalletClick = useCallback(() => {
      window.open(Browser.runtime.getURL('index.html#/onboardEvmLedger'))
      closeSidePanel()
    }, [])

    return (
      <div
        className='w-full flex flex-col items-center justify-center px-7'
        style={{ background: gradientChainColor }}
      >
        <motion.div
          initial={initialRef.current}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeIn' }}
          className='flex flex-col items-center justify-center my-6'
        >
          {activeChain !== 'nomic' ? (
            isTokenLoading ? (
              <AggregatedBalanceLoading />
            ) : (
              <TotalBalance balances={rootBalanceStore} evmBalances={evmBalanceStore} />
            )
          ) : null}

          {/* Handle Ledger */}
          {activeChain !== AGGREGATED_CHAIN_KEY ? (
            <>
              {disabled ? (
                <div className='flex items-center bg-red-300 rounded-2xl py-1 px-4 w-fit self-center mx-auto mt-[12px]'>
                  <WarningCircle size={16} className='text-white-100 mr-[5px]' />
                  <Text size='sm'>Ledger not supported for {chain?.chainName}</Text>
                </div>
              ) : !walletAddresses?.[0]?.length ? (
                <div className='mt-[12px]'>
                  <Text size='md' className='mb-3'>
                    EVM wallets not connected
                  </Text>

                  <div onClick={handleConnectEvmWalletClick}>
                    <Text
                      size='sm'
                      className='font-bold bg-gray-800 rounded-2xl py-1 px-3 w-fit mx-auto cursor-pointer'
                    >
                      Connect EVM wallet
                    </Text>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {activeChain !== AGGREGATED_CHAIN_KEY && (
            <Text size='xs' color='dark:text-gray-200 text-gray-800' className='font-medium mt-1'>
              You are on {chains[activeChain]?.chainName}
            </Text>
          )}

          {activeChain !== AGGREGATED_CHAIN_KEY ? (
            <DepositBTCBanner handleClick={handleBtcBannerClick} />
          ) : null}
        </motion.div>
      </div>
    )
  },
)
