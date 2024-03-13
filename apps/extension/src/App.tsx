import 'react-loading-skeleton/dist/skeleton.css'

import {
  useFeatureFlags,
  useGetBannerApi,
  useGetFaucetApi,
  useGetQuickSearchOptions,
  useInitBetaNFTsCollections,
  useInitCoingeckoPrices,
  useInitCustomChannelsStore,
  useInitDefaultGasEstimates,
  useInitDenoms,
  useInitDisabledCW20Tokens,
  useInitDisabledNFTsCollections,
  useInitFeeDenoms,
  useInitGasAdjustments,
  useInitGasPriceSteps,
  useInitIbcTraceStore,
  useInitInteractedTokens,
  useInitInvestData,
  useInitIteratedUriNftContracts,
  useInitNftChains,
  useInitSelectedNetwork,
  useInitSpamProposals,
  useInitTxMetadata,
  useMobileAppBanner,
  useTransactionConfigs,
} from '@leapwallet/cosmos-wallet-hooks'
import { useInitSnipDenoms } from '@leapwallet/cosmos-wallet-hooks/dist/utils/useInitSnipDenoms'
import { LeapUiTheme } from '@leapwallet/leap-ui'
import { AppInitLoader } from 'components/loader/AppInitLoader'
import { useNomicBTCDepositConstants } from 'hooks/nomic-btc-deposit'
import { useInitFavouriteNFTs, useInitHiddenNFTs, useInitIsCompassWallet } from 'hooks/settings'
import { useInitiateCurrencyPreference } from 'hooks/settings/useCurrency'
import { useInitHideAssets } from 'hooks/settings/useHideAssets'
import { useInitHideSmallBalances } from 'hooks/settings/useHideSmallBalances'
import { useInitChainInfos } from 'hooks/useChainInfos'
import { useInitNodeUrls } from 'hooks/useInitNodeUrls'
import React from 'react'
import { useState } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import Browser from 'webextension-polyfill'

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
  useInitIteratedUriNftContracts()

  // initialize chains and default user preferences
  useManageChains()
  useInitNftChains()
  useInitTxMetadata({ appVersion: Browser.runtime.getManifest().version })

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
  useInitGasAdjustments()
  useInitFeeDenoms()
  useInitDisabledCW20Tokens()
  useInitInteractedTokens()
  useInitDisabledNFTsCollections()

  useInitBetaNFTsCollections()
  useInitInvestData()
  useInitSnipDenoms()
  useInitIbcTraceStore()

  // initialize request cache
  // useInitRequestCache()
  useInitNodeUrls(setNodeUrlInitialised)
  useGetQuickSearchOptions()
  useNomicBTCDepositConstants()
  useMobileAppBanner()
  useFeatureFlags()
  useTransactionConfigs()

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
