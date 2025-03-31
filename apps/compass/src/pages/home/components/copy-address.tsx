import { sliceAddress, useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { WALLETTYPE } from '@leapwallet/leap-keychain'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useQuery from 'hooks/useQuery'
import { CopyIcon } from 'icons/copy-icon'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'

export const CopyAddress = observer(() => {
  const navigate = useNavigate()
  const query = useQuery()
  const activeChain = useActiveChain()
  const activeWallet = useActiveWallet()

  const address = useMemo(() => {
    if (!activeWallet) {
      return ''
    }

    if (activeWallet.walletType === WALLETTYPE.LEDGER) {
      return activeWallet?.addresses?.[activeChain]
    }

    return (
      pubKeyToEvmAddressToShow(activeWallet.pubKeys?.[activeChain], true) ||
      activeWallet?.addresses?.[activeChain]
    )
  }, [activeChain, activeWallet])

  useEffect(() => {
    if (query.get('openLinkAddress')) {
      navigate('/home')
      globalSheetsStore.setCopyAddressSheetOpen(true)
    }
  }, [navigate, query])

  if (!address) {
    return null
  }

  return (
    <button
      className='text-xs font-medium text-secondary-800 flex items-center gap-x-1 py-2 px-4 rounded-full bg-secondary-100 hover:bg-secondary-200 transition-colors relative font-DMMono'
      onClick={() => globalSheetsStore.setCopyAddressSheetOpen(true)}
    >
      {sliceAddress(address)}
      <CopyIcon />
    </button>
  )
})
