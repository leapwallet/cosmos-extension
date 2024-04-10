import {
  sliceAddress,
  useAddress,
  useChainInfo,
  useFeatureFlags,
} from '@leapwallet/cosmos-wallet-hooks'
import { showSideNavFromSearchModalState } from 'atoms/search-modal'
import { useAuth } from 'context/auth-context'
import { useHideAssets, useSetHideAssets } from 'hooks/settings/useHideAssets'
import { useGetKadoAssets, useGetKadoChains } from 'hooks/useGetKadoDetails'
import {
  BuyUrlFuncParams,
  getBuyUrl,
  OriginWalletSourceEnum,
  ServiceProviderEnum,
} from 'pages/home/utils'
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

  const walletAddress = useAddress()
  const activeWalletCosmosAddress = useAddress('cosmos')
  const { data: kadoSupportedChainId = [] } = useGetKadoChains()
  const { data: kadoSupportedAssets = [] } = useGetKadoAssets()
  const isKadoSupported =
    kadoSupportedChainId.includes(activeChainInfo?.chainId) &&
    kadoSupportedAssets.includes(activeChainInfo?.denom)

  const handleBuyClick = (type: 'leap' | 'compass') => {
    const buyUrlArgs: BuyUrlFuncParams = {
      serviceProvider: ServiceProviderEnum.KADO,
      originWalletSource:
        type === 'leap' ? OriginWalletSourceEnum.LEAP : OriginWalletSourceEnum.COMPASS,
      walletAddress: isKadoSupported ? walletAddress : activeWalletCosmosAddress,
      providerApiKey: process.env.KADO_API_KEY as string,
      activeChain: isKadoSupported ? activeChainInfo.chainName.toUpperCase() : 'COSMOS HUB',
      denom: isKadoSupported ? activeChainInfo.denom : 'ATOM',
    }

    const buyUrl = getBuyUrl(buyUrlArgs)
    window.open(buyUrl, '_blank')
  }

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

  function handleVoteClick(_redirectUrl?: string) {
    if (featureFlags?.gov?.extension === 'redirect') {
      const redirectUrl = _redirectUrl ?? 'https://cosmos.leapwallet.io/portfolio/gov'
      window.open(redirectUrl, '_blank')
    } else {
      navigate('/gov')
    }
  }

  function onSendClick(_redirectUrl?: string) {
    if (featureFlags?.ibc?.extension === 'redirect') {
      const redirectUrl =
        _redirectUrl ??
        `https://cosmos.leapwallet.io/transact/send?sourceChainId=${activeChainInfo.chainId}`
      window.open(redirectUrl, '_blank')
    } else {
      navigate(`/send`)
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
  }
}
