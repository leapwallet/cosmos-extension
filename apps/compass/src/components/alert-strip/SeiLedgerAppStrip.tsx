import { WALLETTYPE } from '@leapwallet/leap-keychain'
import { Info, X } from '@phosphor-icons/react'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { closeSidePanel } from 'utils/closeSidePanel'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

import { AlertStrip } from './AlertStrip'

export const SeiLedgerAppStrip = () => {
  const [show, setShow] = useState(true)
  const navigate = useNavigate()
  const { activeWallet } = useActiveWallet()

  const goToImportSeiLedger = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const views = browser.extension.getViews({ type: 'popup' })
    if (views.length === 0 && !isSidePanel()) {
      navigate('/onboardingImport?walletName=ledger&app=sei')
    } else {
      window.open('index.html#/onboardingImport?walletName=ledger&app=sei')
      closeSidePanel()
    }
  }

  if (!show) {
    return null
  }
  const isNonLedgerWallet = activeWallet?.walletType !== WALLETTYPE.LEDGER
  if (isNonLedgerWallet) {
    return null
  }

  if (activeWallet?.walletType === WALLETTYPE.LEDGER && activeWallet.app) {
    return null
  }

  return (
    <AlertStrip
      alwaysShow
      className='bg-[#0A84FF]'
      message={
        <div className='flex items-center justify-between gap-1'>
          <Info size={14} />
          <Text size='sm'>Import using </Text>
          <a href='#' onClick={goToImportSeiLedger} className='underline'>
            SEI app
          </a>
          <Text>to make EVM transactions</Text>
          <button
            title='hide'
            className='dark:text-gray-400 text-gray-600 absolute right-4'
            onClick={() => setShow(false)}
          >
            <X size={14} />
          </button>
        </div>
      }
    />
  )
}
