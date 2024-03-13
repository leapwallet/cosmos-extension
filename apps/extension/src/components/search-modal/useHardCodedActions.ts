import {
  sliceAddress,
  useAddress,
  useChainInfo,
  useFeatureFlags,
} from '@leapwallet/cosmos-wallet-hooks'
import { showSideNavFromSearchModalState } from 'atoms/search-modal'
import { useAuth } from 'context/auth-context'
import { useHideAssets, useSetHideAssets } from 'hooks/settings/useHideAssets'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { UserClipboard } from 'utils/clipboard'
import Browser from 'webextension-polyfill'

export function useHardCodedActions() {
  const navigate = useNavigate()
  const auth = useAuth()
  const { data: featureFlags } = useFeatureFlags()

  const address = useAddress()
  const activeChainInfo = useChainInfo()
  const { hideBalances: balancesHidden } = useHideAssets()
  const setBalancesVisibility = useSetHideAssets()

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const setShowSideNav = useSetRecoilState(showSideNavFromSearchModalState)

  function handleSwapClick(_redirectUrl?: string) {
    if (featureFlags?.all_chains?.swap === 'redirect') {
      const redirectUrl =
        _redirectUrl ??
        `https://cosmos.leapwallet.io/transact/swap?sourceChainId=${activeChainInfo.chainId}`
      window.open(redirectUrl, '_blank')
    } else {
      navigate('/swap')
    }
  }

  function handleNftsClick(_redirectUrl?: string) {
    if (featureFlags?.nfts?.extension === 'redirect') {
      const redirectUrl = _redirectUrl ?? 'https://cosmos.leapwallet.io/portfolio/nfts'
      window.open(redirectUrl, '_blank')
    } else {
      navigate('/nfts')
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
    handleNftsClick,
  }
}
