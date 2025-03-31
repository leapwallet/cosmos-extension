import {
  sliceAddress,
  useAddress,
  useChainInfo,
  useFeatureFlags,
} from '@leapwallet/cosmos-wallet-hooks'
import { captureException } from '@sentry/react'
import { ButtonName, ButtonType, EventName, PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY, LEAPBOARD_URL } from 'config/constants'
import { useAuth } from 'context/auth-context'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import mixpanel from 'mixpanel-browser'
import { useProviderFeatureFlags } from 'pages/swaps-v2/hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AggregatedSupportedChain } from 'types/utility'
import { UserClipboard } from 'utils/clipboard'
import { closeSidePanel } from 'utils/closeSidePanel'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

export function useHardCodedActions() {
  const navigate = useNavigate()
  const auth = useAuth()
  const { data: featureFlags } = useFeatureFlags()
  const { isEvmSwapEnabled } = useProviderFeatureFlags()

  const address = useAddress()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const activeChainInfo = useChainInfo()

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const handleBuyClick = () => {
    navigate(`/buy?pageSource=${PageName.Home}`)
    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonName: ButtonName.ONRAMP_TOKEN_SELECTION,
        buttonType: ButtonType.ONRAMP,
      })
    } catch (error) {
      captureException(error)
    }
  }

  function handleSwapClick(_redirectUrl?: string, navigateUrl?: string) {
    if (featureFlags?.all_chains?.swap === 'redirect') {
      const fallbackUrl = activeChainInfo?.chainId
        ? `https://swapfast.app/?sourceChainId=${activeChainInfo.chainId}`
        : 'https://swapfast.app'
      const redirectUrl = _redirectUrl ?? fallbackUrl
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

  function handleBridgeClick(navigateUrl?: string) {
    let redirectURL = ''
    if (
      featureFlags?.all_chains?.swap === 'redirect' ||
      !isEvmSwapEnabled ||
      ['mainCoreum', 'coreum'].includes(activeChainInfo?.key)
    ) {
      const baseUrl = 'https://swapfast.app/bridge'
      redirectURL = `${baseUrl}?destinationChainId=${activeChainInfo?.chainId}`

      if (['mainCoreum', 'coreum'].includes(activeChainInfo?.key)) {
        redirectURL = 'https://sologenic.org/bridge/coreum-bridge'
      } else if (activeChainInfo?.key === 'mantra') {
        redirectURL = 'https://mantra.swapfast.app'
      } else if (activeChain === AGGREGATED_CHAIN_KEY) {
        redirectURL = baseUrl
      }
      window.open(redirectURL, '_blank')
    } else {
      navigate(navigateUrl ?? '/swap')
    }

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
      const fallbackUrl = activeChainInfo?.chainId
        ? `${LEAPBOARD_URL}/transact/send?sourceChainId=${activeChainInfo.chainId}`
        : `${LEAPBOARD_URL}/transact/send`
      const redirectUrl = _redirectUrl ?? fallbackUrl
      window.open(redirectUrl, '_blank')
    } else {
      navigate(`/send`)
    }
  }

  function handleConnectLedgerClick() {
    const views = Browser.extension.getViews({ type: 'popup' })
    if (views.length === 0 && !isSidePanel()) {
      navigate('/onboardingImport?walletName=ledger')
    } else {
      window.open('index.html#/onboardingImport?walletName=ledger')
      closeSidePanel()
    }
  }

  function handleCopyAddressClick() {
    UserClipboard.copyText(address)
    setAlertMessage(`Address Copied (${sliceAddress(address)})`)
    setShowAlert(true)
  }

  function handleLockWalletClick() {
    auth?.signout()
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
    handleLockWalletClick,
    handleNftsClick,
    handleVoteClick,
    onSendClick,
    handleBridgeClick,
  }
}
