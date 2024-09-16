import 'react-loading-skeleton/dist/skeleton.css'

import {
  useBannerConfig,
  useFeatureFlags,
  useFetchAggregatedChainsList,
  useGetBannerApi,
  useGetFaucetApi,
  useGetQuickSearchOptions,
  useInitBetaEvmNftTokenIds,
  useInitBetaNFTsCollections,
  useInitChainCosmosSDK,
  useInitChainInfosConfig,
  useInitChainsApr,
  useInitCoingeckoPrices,
  useInitCompassSeiEvmConfig,
  useInitCustomChannelsStore,
  useInitDefaultGasEstimates,
  useInitDisabledCW20Tokens,
  useInitDisabledNFTsCollections,
  useInitEnabledCW20Tokens,
  useInitEnabledNftsCollections,
  useInitFeeDenoms,
  useInitFractionalizedNftContracts,
  useInitGasAdjustments,
  useInitGasPriceSteps,
  useInitIbcTraceStore,
  useInitInteractedTokens,
  useInitIteratedUriNftContracts,
  useInitKadoBuyChains,
  useInitNftChains,
  useInitSelectedNetwork,
  useInitSpamProposals,
  useInitStakingDenoms,
  useInitTxLogCosmosBlockchainMap,
  useInitTxMetadata,
  useInitWhitelistedFactoryTokens,
  useMobileAppBanner,
  useTransactionConfigs,
} from '@leapwallet/cosmos-wallet-hooks'
import { useInitSnipDenoms } from '@leapwallet/cosmos-wallet-hooks/dist/utils/useInitSnipDenoms'
import { LeapUiTheme } from '@leapwallet/leap-ui'
import { IconContext } from '@phosphor-icons/react'
import { AppInitLoader } from 'components/loader/AppInitLoader'
import { useNomicBTCDepositConstants } from 'hooks/nomic-btc-deposit'
import {
  useInitFavouriteNFTs,
  useInitHiddenNFTs,
  useInitIsCompassWallet,
  useInitStarredChains,
} from 'hooks/settings'
import { useInitiateCurrencyPreference } from 'hooks/settings/useCurrency'
import { useInitHideAssets } from 'hooks/settings/useHideAssets'
import { useInitHideSmallBalances } from 'hooks/settings/useHideSmallBalances'
import { useInitChainInfos } from 'hooks/useChainInfos'
import { useInitNodeUrls } from 'hooks/useInitNodeUrls'
import React, { useState } from 'react'
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
  useInitChainsApr()

  useInitHideAssets()
  useInitHideSmallBalances()

  useInitIsCompassWallet()
  useInitActiveChain()
  useInitActiveWallet()
  useInitSelectedNetwork()
  useInitIteratedUriNftContracts()
  useInitFractionalizedNftContracts()

  // initialize chains and default user preferences
  useManageChains()
  useInitNftChains()
  useInitTxMetadata({ appVersion: Browser.runtime.getManifest().version })

  useInitFavouriteNFTs()
  useInitStarredChains()
  useInitHiddenNFTs()
  useInitPrimaryWalletAddress()

  useInitSecretTokens()
  useInitSecretViewingKeys()
  useInitChainInfos()

  useGetFaucetApi()
  useGetBannerApi()
  //useInitDenoms()
  useInitWhitelistedFactoryTokens()

  useInitSpamProposals()
  useInitCustomChannelsStore()
  useInitDefaultGasEstimates()

  useInitGasPriceSteps()
  useInitGasAdjustments()
  useInitFeeDenoms()
  // useInitDisabledCW20Tokens()
  // useInitEnabledCW20Tokens()
  // useInitInteractedTokens()
  useInitDisabledNFTsCollections()

  useInitBetaNFTsCollections()
  useInitEnabledNftsCollections()
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

  useInitStakingDenoms()
  useInitChainInfosConfig()
  useInitKadoBuyChains()
  useInitTxLogCosmosBlockchainMap()
  useInitChainCosmosSDK()

  useFetchAggregatedChainsList()
  useInitBetaEvmNftTokenIds()
  useInitCompassSeiEvmConfig()

  useGetBannerApi()
  useBannerConfig()

  return (
    <LeapUiTheme defaultTheme={theme} forcedTheme={theme}>
      <SkeletonTheme
        baseColor={theme === 'dark' ? Colors.gray800 : Colors.gray300}
        highlightColor={theme === 'dark' ? Colors.gray900 : Colors.gray400}
      >
        <IconContext.Provider
          value={{
            weight: 'bold',
          }}
        >
          {!nodeUrlsInitialised ? <AppInitLoader /> : <Routes />}
        </IconContext.Provider>
      </SkeletonTheme>
    </LeapUiTheme>
  )
}
