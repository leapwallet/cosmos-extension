import 'react-loading-skeleton/dist/skeleton.css'

import {
  useGetBannerApi,
  useGetFaucetApi,
  useInitBetaNFTsCollections,
  useInitCoingeckoPrices,
  useInitCustomChannelsStore,
  useInitDefaultGasEstimates,
  useInitDenoms,
  useInitDisabledCW20Tokens,
  useInitDisabledNFTsCollections,
  useInitGasPriceSteps,
  useInitIbcTraceStore,
  useInitInvestData,
  useInitNftChains,
  useInitSelectedNetwork,
  useInitSpamProposals,
} from '@leapwallet/cosmos-wallet-hooks'
import { useInitSnipDenoms } from '@leapwallet/cosmos-wallet-hooks/dist/utils/useInitSnipDenoms'
import { LeapUiTheme } from '@leapwallet/leap-ui'
import { AppInitLoader } from 'components/loader/AppInitLoader'
import { useInitFavouriteNFTs, useInitHiddenNFTs, useInitIsCompassWallet } from 'hooks/settings'
import { useInitiateCurrencyPreference } from 'hooks/settings/useCurrency'
import { useInitHideAssets } from 'hooks/settings/useHideAssets'
import { useInitHideSmallBalances } from 'hooks/settings/useHideSmallBalances'
import { useInitChainInfos } from 'hooks/useChainInfos'
import { useInitNodeUrls } from 'hooks/useInitNodeUrls'
import React from 'react'
import { useState } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'

import { useInitSecretTokens } from './hooks/secret/useInitSecretTokens'
import { useInitSecretViewingKeys } from './hooks/secret/useInitSecretViewingKeys'
import { useInitActiveChain } from './hooks/settings/useActiveChain'
import { useInitActiveWallet } from './hooks/settings/useActiveWallet'
import { useManageChains } from './hooks/settings/useManageChains'
import { useInitTheme, useThemeState } from './hooks/settings/useTheme'
import { useInitPrimaryWalletAddress } from './hooks/wallet/useInitPrimaryWalletAddress'
import Routes from './Routes'
import { Colors } from './theme/colors'

export default function App() {
  const { theme } = useThemeState()
  const [nodeUrlsInitialised, setNodeUrlInitialised] = useState(false)

  useInitTheme()
  useInitiateCurrencyPreference()
  useInitCoingeckoPrices()

  useInitHideAssets()
  useInitHideSmallBalances()

  useInitIsCompassWallet()
  useInitActiveChain()
  useInitActiveWallet()
  useInitSelectedNetwork()

  // initialize chains and default user preferences
  useManageChains()
  useInitNftChains()

  useInitFavouriteNFTs()
  useInitHiddenNFTs()
  useInitPrimaryWalletAddress()

  useInitSecretTokens()
  useInitSecretViewingKeys()
  useInitChainInfos()

  useGetFaucetApi()
  useGetBannerApi()
  useInitDenoms()

  useInitSpamProposals()
  useInitCustomChannelsStore()
  useInitDefaultGasEstimates()

  useInitGasPriceSteps()
  useInitDisabledCW20Tokens()
  useInitDisabledNFTsCollections()

  useInitBetaNFTsCollections()
  useInitInvestData()
  useInitSnipDenoms()
  useInitIbcTraceStore()

  // initialize request cache
  // useInitRequestCache()
  useInitNodeUrls(setNodeUrlInitialised)

  return (
    <LeapUiTheme defaultTheme={theme} forcedTheme={theme}>
      <SkeletonTheme
        baseColor={theme === 'dark' ? Colors.gray800 : Colors.gray300}
        highlightColor={theme === 'dark' ? Colors.gray900 : Colors.gray400}
      >
        {!nodeUrlsInitialised ? <AppInitLoader /> : <Routes />}
      </SkeletonTheme>
    </LeapUiTheme>
  )
}
