import {
  sliceAddress,
  useAddress,
  useChainInfo,
  useFeatureFlags,
} from '@leapwallet/cosmos-wallet-hooks'
import { captureException } from '@sentry/react'
import { ButtonName, ButtonType, EventName, PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY, LEAPBOARD_SWAP_URL, LEAPBOARD_URL } from 'config/constants'
import { useAuth } from 'context/auth-context'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import mixpanel from 'mixpanel-browser'
import { useProviderFeatureFlags } from 'pages/swaps-v2/hooks'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { earnFeatureShowStore } from 'stores/earn-feature-show'
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

  const handleBuyClick = useCallback(() => {
    navigate(`/buy?pageSource=${PageName.Home}`)
    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonName: ButtonName.ONRAMP_TOKEN_SELECTION,
        buttonType: ButtonType.ONRAMP,
      })
    } catch (error) {
      captureException(error)
    }
  }, [navigate])

  const handleSwapClick = useCallback(
    (_redirectUrl?: string, navigateUrl?: string) => {
      if (featureFlags?.all_chains?.swap === 'redirect') {
        const fallbackUrl = activeChainInfo?.chainId
          ? `${LEAPBOARD_SWAP_URL}&sourceChainId=${activeChainInfo.chainId}`
          : LEAPBOARD_SWAP_URL
        const redirectUrl = _redirectUrl ?? fallbackUrl
        window.open(redirectUrl, '_blank')
      } else {
        navigate(navigateUrl ?? '/swap')
      }
    },
    [featureFlags?.all_chains?.swap, activeChainInfo, navigate],
  )

  function handleNftsClick(_redirectUrl?: string) {
    if (featureFlags?.nfts?.extension === 'redirect') {
      const redirectUrl = _redirectUrl ?? `${LEAPBOARD_URL}/portfolio/nfts`
      window.open(redirectUrl, '_blank')
    } else {
      navigate('/nfts')
    }
  }

  const handleVoteClick = useCallback(() => {
    if (featureFlags?.gov?.extension === 'redirect') {
      const redirectUrl = `${LEAPBOARD_URL}/portfolio/gov`
      window.open(redirectUrl, '_blank')
    } else {
      navigate('/gov')
    }
  }, [featureFlags?.gov?.extension, navigate])

  function handleBridgeClick(navigateUrl?: string) {
    let redirectURL = ''
    if (
      featureFlags?.all_chains?.swap === 'redirect' ||
      !isEvmSwapEnabled ||
      ['mainCoreum', 'coreum'].includes(activeChainInfo?.key)
    ) {
      redirectURL = `${LEAPBOARD_SWAP_URL}&destinationChainId=${activeChainInfo?.chainId}`

      if (['mainCoreum', 'coreum'].includes(activeChainInfo?.key)) {
        redirectURL = 'https://sologenic.org/bridge/coreum-bridge'
      } else if (activeChainInfo?.key === 'mantra') {
        redirectURL = LEAPBOARD_SWAP_URL
      } else if (activeChain === AGGREGATED_CHAIN_KEY) {
        redirectURL = LEAPBOARD_SWAP_URL
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

  const onSendClick = useCallback(() => {
    if (featureFlags?.ibc?.extension === 'redirect') {
      const fallbackUrl = activeChainInfo?.chainId
        ? `${LEAPBOARD_URL}/transact/send?sourceChainId=${activeChainInfo.chainId}`
        : `${LEAPBOARD_URL}/transact/send`
      const redirectUrl = fallbackUrl
      window.open(redirectUrl, '_blank')
    } else {
      navigate(`/send`)
    }
  }, [featureFlags?.ibc?.extension, navigate, activeChainInfo])

  function handleNobleEarnClick() {
    if (earnFeatureShowStore.show !== 'false') {
      navigate('/home?openEarnUSDN=true')
    } else {
      navigate('/earn-usdn')
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
    handleNobleEarnClick,
  }
}
