import Text from 'components/text'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import { AggregatedSupportedChain } from 'types/utility'
import { closeSidePanel } from 'utils/closeSidePanel'
import Browser from 'webextension-polyfill'

import { BalanceHeader } from './balance-header'

export const HeroSection = observer(() => {
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const walletAddresses = useGetWalletAddresses()

  const handleConnectEvmWalletClick = useCallback(() => {
    window.open(Browser.runtime.getURL('index.html#/onboardingImport?walletName=evm-ledger'))
    closeSidePanel()
  }, [])

  return (
    <>
      {activeChain !== 'nomic' ? <BalanceHeader /> : null}

      {/* Handle Ledger */}
      {activeChain !== AGGREGATED_CHAIN_KEY ? (
        !walletAddresses?.[0]?.length ? (
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
        ) : null
      ) : null}
    </>
  )
})
