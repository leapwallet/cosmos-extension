import {
  sliceAddress,
  useActiveChain,
  useAddress,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { showSideNavFromSearchModalState } from 'atoms/search-modal'
import { chainsWithSwapSupport } from 'config/constants'
import { useAuth } from 'context/auth-context'
import { useHideAssets, useSetHideAssets } from 'hooks/settings/useHideAssets'
import { useChainInfos } from 'hooks/useChainInfos'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { UserClipboard } from 'utils/clipboard'
import Browser from 'webextension-polyfill'

export function useHardCodedActions() {
  const activeChain = useActiveChain()
  const isTestnet = useSelectedNetwork() === 'testnet'
  const navigate = useNavigate()
  const auth = useAuth()

  const chainInfos = useChainInfos()
  const address = useAddress()
  const { hideBalances: balancesHidden } = useHideAssets()
  const setBalancesVisibility = useSetHideAssets()

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const setShowSideNav = useSetRecoilState(showSideNavFromSearchModalState)

  function handleSwapClick() {
    if (chainsWithSwapSupport.includes(activeChain) && !isTestnet) {
      navigate('/swap')
    } else {
      const chain = chainInfos[activeChain]
      const redirectUrl = `https://cosmos.leapwallet.io/transact/swap?sourceChainId=${chain.chainId}`

      window.open(redirectUrl, '_blank')
    }
  }

  function handleConnectLedgerClick() {
    const views = Browser.extension.getViews({ type: 'popup' })
    if (views.length === 0) {
      navigate('/onboardingImport?walletName=hardwarewallet')
    } else {
      window.open('index.html#/onboardingImport?walletName=hardwarewallet')
    }
  }

  function handleCopyAddressClick() {
    UserClipboard.copyText(address)
    setAlertMessage(`Address Copied (${sliceAddress(address)})`)
    setShowAlert(true)
  }

  function handleHideBalancesClick() {
    setBalancesVisibility(!balancesHidden)
    setAlertMessage(`Balances ${!balancesHidden ? 'Hidden' : 'Visible'}`)
    setShowAlert(true)
  }

  function handleLockWalletClick() {
    auth?.signout()
  }

  function handleSettingsClick() {
    setShowSideNav(true)
  }

  return {
    handleSwapClick,
    handleConnectLedgerClick,
    showAlert,
    setShowAlert,
    handleCopyAddressClick,
    alertMessage,
    setAlertMessage,
    handleHideBalancesClick,
    handleLockWalletClick,
    handleSettingsClick,
  }
}
