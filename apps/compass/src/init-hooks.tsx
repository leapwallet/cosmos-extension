import {
  useBannerConfig,
  useFeatureFlags,
  useGetBannerApi,
  useInitBetaEvmNftTokenIds,
  useInitBetaNFTsCollections,
  useInitChainCosmosSDK,
  useInitChainsApr,
  useInitCoingeckoPrices,
  useInitCompassSeiEvmConfig,
  useInitCustomChannelsStore,
  useInitDefaultGasEstimates,
  useInitDisabledNFTsCollections,
  useInitEnabledNftsCollections,
  useInitFeeDenoms,
  useInitFractionalizedNftContracts,
  useInitGasAdjustments,
  useInitGasPriceSteps,
  useInitIbcTraceStore,
  useInitIteratedUriNftContracts,
  useInitKadoBuyChains,
  useInitNftChains,
  useInitStakingDenoms,
  useInitTxLogCosmosBlockchainMap,
  useInitTxMetadata,
  useInitWhitelistedFactoryTokens,
  useTransactionConfigs,
} from '@leapwallet/cosmos-wallet-hooks'
import { useInitAnalytics } from 'hooks/analytics/useInitAnalytics'
import { useInitFavouriteNFTs, useInitHiddenNFTs, useInitIsCompassWallet } from 'hooks/settings'
import { useInitiateCurrencyPreference } from 'hooks/settings/useCurrency'
import { useInitChainInfos } from 'hooks/useChainInfos'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useLocation } from 'react-router'
import { chainInfoStore } from 'stores/chain-infos-store'
import { manageChainsStore } from 'stores/manage-chains-store'
import { favNftStore, hiddenNftStore } from 'stores/manage-nft-store'
import { passwordStore } from 'stores/password-store'
import Browser from 'webextension-polyfill'

import { useInitSecretTokens } from './hooks/secret/useInitSecretTokens'
import { useInitSecretViewingKeys } from './hooks/secret/useInitSecretViewingKeys'
import { useInitActiveWallet } from './hooks/settings/useActiveWallet'
import { useInitManageChains } from './hooks/settings/useManageChains'
import { useInitPrimaryWalletAddress } from './hooks/wallet/useInitPrimaryWalletAddress'

const app = 'extension'
const version = Browser.runtime.getManifest().version
const individualPages = [
  '/approveConnection',
  '/sign',
  '/suggest-chain',
  '/switch-ethereum-chain',
  '/SuggestEthereumChain',
  '/SignSeiEvmTransaction',
  '/onboarding',
  '/onboardingCreate',
  '/onboardingSuccess',
]

const InitMainAppHooks = observer(() => {
  useInitChainsApr()
  useInitCoingeckoPrices()

  useInitIteratedUriNftContracts()
  useInitFractionalizedNftContracts()

  // initialize chains and default user preferences
  useInitManageChains(manageChainsStore, chainInfoStore)
  useInitNftChains()

  useInitFavouriteNFTs(favNftStore)
  useInitHiddenNFTs(hiddenNftStore)

  useGetBannerApi()
  //useInitDenoms()
  useInitWhitelistedFactoryTokens()

  useInitCustomChannelsStore()

  // useInitDisabledCW20Tokens()
  // useInitEnabledCW20Tokens()
  // useInitInteractedTokens()
  useInitDisabledNFTsCollections()

  useInitBetaNFTsCollections()
  useInitEnabledNftsCollections()

  useInitStakingDenoms()
  useInitKadoBuyChains()

  useInitBetaEvmNftTokenIds()

  useGetBannerApi()
  useBannerConfig()

  return <></>
})

const metadata = {
  appVersion: version,
}

export const InitHooks = observer(() => {
  const location = useLocation()
  useInitiateCurrencyPreference()

  useInitGasPriceSteps()
  useInitGasAdjustments()
  useInitFeeDenoms()
  useInitIsCompassWallet()
  useInitActiveWallet(passwordStore)

  useInitTxMetadata(metadata)

  useInitPrimaryWalletAddress()
  useInitAnalytics()

  useInitSecretTokens()
  useInitSecretViewingKeys(passwordStore)

  useFeatureFlags()
  useTransactionConfigs()

  useInitTxLogCosmosBlockchainMap()
  useInitChainInfos()
  useInitCompassSeiEvmConfig()

  useInitIbcTraceStore()
  useInitDefaultGasEstimates()
  useInitChainCosmosSDK()

  return <>{!individualPages.includes(location.pathname) && <InitMainAppHooks />}</>
})
