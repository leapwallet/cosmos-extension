import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import { Button } from 'components/ui/button'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { WalletIcon } from 'icons/wallet-icon'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { closeSidePanel } from 'utils/closeSidePanel'
import { getLedgerEnabledEvmChainsKey } from 'utils/getLedgerEnabledEvmChains'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

export function WalletNotConnected({ visible }: { visible: boolean }) {
  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const chains = useGetChains()

  const ledgerEnabledEvmChainsKeys = useMemo(() => {
    return getLedgerEnabledEvmChainsKey(Object.values(chains))
  }, [chains])

  const ledgerApp = useMemo(() => {
    return ledgerEnabledEvmChainsKeys.includes(activeChain) ? 'EVM' : 'Cosmos'
  }, [activeChain, ledgerEnabledEvmChainsKeys])

  return (
    <div
      className={classNames('h-[calc(100%-128px)] p-6', {
        hidden: !visible,
      })}
    >
      <div className='flex flex-col h-full justify-center items-center rounded-2xl bg-secondary-100'>
        <div className='text-center gap-3 flex flex-col justify-end items-center px-6'>
          <div className='bg-secondary-200 h-16 w-16 rounded-full p-3 flex items-center justify-center'>
            <WalletIcon className='text-foreground' size={24} />
          </div>
          <div className='text-center gap-3 flex flex-col justify-end items-center'>
            <div className='!leading-[24px] font-bold text-foreground text-[18px]'>
              Wallet not connected
            </div>
            <div className='!leading-[16px] text-xs text-secondary-800'>
              You need to import Ledger using {ledgerApp} app to use this chain.
            </div>
          </div>
        </div>
        <Button
          className='w-[260px] h-[44px] text-sm !leading-[20px] text-foreground mt-8'
          onClick={() => {
            const views = Browser.extension.getViews({ type: 'popup' })
            if (views.length === 0 && !isSidePanel()) {
              navigate(`/importLedger?app=${ledgerApp}`)
            } else {
              window.open(Browser.runtime.getURL(`index.html#/importLedger?app=${ledgerApp}`))
              closeSidePanel()
            }
          }}
        >
          Connect {ledgerApp} wallet
        </Button>
      </div>
    </div>
  )
}
