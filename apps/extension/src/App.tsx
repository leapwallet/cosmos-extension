import 'react-loading-skeleton/dist/skeleton.css'

import {
  useGetBannerApi,
  useGetFaucetApi,
  useInitCustomChannelsStore,
  useInitDefaultGasEstimates,
  useInitDenoms,
  useInitDisabledCW20Tokens,
  useInitDisabledNFTsCollections,
  useInitGasPriceSteps,
  useInitInvestData,
  useInitSelectedNetwork,
  useInitSpamProposals,
} from '@leapwallet/cosmos-wallet-hooks'
import { useInitSnipDenoms } from '@leapwallet/cosmos-wallet-hooks/dist/utils/useInitSnipDenoms'
import { LeapUiTheme } from '@leapwallet/leap-ui'
import { useInitIsCompassWallet } from 'hooks/settings'
import { useInitiateCurrencyPreference } from 'hooks/settings/useCurrency'
import { useInitHideAssets } from 'hooks/settings/useHideAssets'
import { useInitHideSmallBalances } from 'hooks/settings/useHideSmallBalances'
import { useInitChainInfos } from 'hooks/useChainInfos'
import React from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'

import { useInitSecretTokens } from './hooks/secret/useInitSecretTokens'
import { useInitSecretViewingKeys } from './hooks/secret/useInitSecretViewingKeys'
import { useInitActiveChain } from './hooks/settings/useActiveChain'
import { useInitActiveWallet } from './hooks/settings/useActiveWallet'
import { useInitFavouriteNFTs } from './hooks/settings/useFavouriteNFTs'
import { useManageChains } from './hooks/settings/useManageChains'
import { useInitTheme, useThemeState } from './hooks/settings/useTheme'
import { useInitPrimaryWalletAddress } from './hooks/wallet/useInitPrimaryWalletAddress'
import Routes from './Routes'
import { Colors } from './theme/colors'

export default function App() {
  const { theme } = useThemeState()

  useInitTheme()
  useInitiateCurrencyPreference()

  useInitHideAssets()
  useInitHideSmallBalances()

  useInitIsCompassWallet()
  useInitActiveChain()
  useInitActiveWallet()
  useInitSelectedNetwork()

  // initialize chains and default user preferences
  useManageChains()

  useInitFavouriteNFTs()
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
  useInitInvestData()
  useInitSnipDenoms()

  // initialize request cache
  // useInitRequestCache()

  return (
    <LeapUiTheme defaultTheme={theme} forcedTheme={theme}>
      <SkeletonTheme
        baseColor={theme === 'dark' ? Colors.gray800 : Colors.gray300}
        highlightColor={theme === 'dark' ? Colors.gray900 : Colors.gray400}
      >
        <Routes />
      </SkeletonTheme>
    </LeapUiTheme>
  )
}
