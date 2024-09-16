import {
  sliceAddress,
  useAddress,
  useChainInfo,
  useFeatureFlags,
} from '@leapwallet/cosmos-wallet-hooks'
import { captureException } from '@sentry/react'
import { showSideNavFromSearchModalState } from 'atoms/search-modal'
import { ButtonName, ButtonType, EventName, PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY, LEAPBOARD_URL } from 'config/constants'
import { useAuth } from 'context/auth-context'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useHideAssets, useSetHideAssets } from 'hooks/settings/useHideAssets'
import mixpanel from 'mixpanel-browser'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { AggregatedSupportedChain } from 'types/utility'
import { UserClipboard } from 'utils/clipboard'
import { closeSidePanel } from 'utils/closeSidePanel'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

export function useHardCodedActions() {
  const navigate = useNavigate()
  const auth = useAuth()
  const { data: featureFlags } = useFeatureFlags()

  const address = useAddress()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const activeChainInfo = useChainInfo()
  const { hideBalances: balancesHidden } = useHideAssets()
  const setBalancesVisibility = useSetHideAssets()

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const setShowSideNav = useSetRecoilState(showSideNavFromSearchModalState)

  const handleBuyClick = () => {
    navigate(`/buy?pageSource=${PageName.Home}`)
  }

  function handleSwapClick(_redirectUrl?: string, navigateUrl?: string) {
    if (featureFlags?.all_chains?.swap === 'redirect') {
      const redirectUrl =
        _redirectUrl ?? `https://swapfast.app/?sourceChainId=${activeChainInfo.chainId}`
      window.open(redirectUrl, '_blank')
    } else {
      navigate(navigateUrl ?? '/swap')
    }
  }

  function handleNftsClick(_redirectUrl?: string) {
    if (featureFlags?.nfts?.extension === 'redirect') {
      const redirectUrl = _redirectUrl ?? `${LEAPBOARD_URL}/portfolio/nfts`
      window.open(redirectUrl, '_blank')
    } else {
      navigate('/nfts')
    }
  }

  function handleVoteClick(_redirectUrl?: string) {
    if (featureFlags?.gov?.extension === 'redirect') {
      const redirectUrl = _redirectUrl ?? `${LEAPBOARD_URL}/portfolio/gov`
      window.open(redirectUrl, '_blank')
    } else {
      navigate('/gov')
    }
  }

  function handleBridgeClick() {
    const baseUrl = 'https://swapfast.app/bridge'
    let redirectURL = `${baseUrl}?destinationChainId=${activeChainInfo?.chainId}`

    if (activeChainInfo?.key === 'mainCoreum') {
      redirectURL = 'https://sologenic.org/coreum-bridge'
    } else if (activeChain === AGGREGATED_CHAIN_KEY) {
      redirectURL = baseUrl
    }
    window.open(redirectURL, '_blank')

    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonType: ButtonType.HOME,
        buttonName: ButtonName.BRIDGE,
        redirectURL: redirectURL,
        time: Date.now() / 1000,
      })
    } catch (e) {
      captureException(e)
    }
  }

  function onSendClick(_redirectUrl?: string) {
    if (featureFlags?.ibc?.extension === 'redirect') {
      const redirectUrl =
        _redirectUrl ?? `${LEAPBOARD_URL}/transact/send?sourceChainId=${activeChainInfo.chainId}`
      window.open(redirectUrl, '_blank')
    } else {
      navigate(`/send`)
    }
  }

  function handleConnectLedgerClick() {
    const views = Browser.extension.getViews({ type: 'popup' })
    if (views.length === 0 && !isSidePanel()) {
      navigate('/onboardingImport?walletName=hardwarewallet')
    } else {
      window.open('index.html#/onboardingImport?walletName=hardwarewallet')
      closeSidePanel()
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
    handleBuyClick,
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
    handleVoteClick,
    onSendClick,
    handleBridgeClick,
  }
}
