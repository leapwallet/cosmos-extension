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
  useInitSpamProposals,
  useInitStakingDenoms,
  useInitTxLogCosmosBlockchainMap,
  useInitTxMetadata,
  useInitWhitelistedFactoryTokens,
  useMobileAppBanner,
  useTransactionConfigs,
} from '@leapwallet/cosmos-wallet-hooks'
import { useInitSnipDenoms } from '@leapwallet/cosmos-wallet-hooks/dist/utils/useInitSnipDenoms'
import { useInitAnalytics } from 'hooks/analytics/useInitAnalytics'
import { useNomicBTCDepositConstants } from 'hooks/nomic-btc-deposit'
import { useInitFavouriteNFTs, useInitHiddenNFTs, useInitIsCompassWallet } from 'hooks/settings'
import { useInitiateCurrencyPreference } from 'hooks/settings/useCurrency'
import { useInitLightNode } from 'hooks/settings/useLightNode'
import { useInitChainInfos } from 'hooks/useChainInfos'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useLocation } from 'react-router'
import { chainInfoStore } from 'stores/chain-infos-store'
import { useInitEpochStore } from 'stores/epoch-store'
import { lightNodeStore } from 'stores/light-node-store'
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
]

const InitMainAppHooks = observer(() => {
  useInitLightNode(lightNodeStore)
  useInitChainsApr()
  useInitCoingeckoPrices()

  useInitIteratedUriNftContracts()
  useInitFractionalizedNftContracts()

  // initialize chains and default user preferences
  useInitManageChains(manageChainsStore, chainInfoStore)
  useInitNftChains()

  useInitFavouriteNFTs(favNftStore)
  useInitHiddenNFTs(hiddenNftStore)

  useGetFaucetApi()
  useGetBannerApi()
  //useInitDenoms()
  useInitWhitelistedFactoryTokens()

  useInitSpamProposals()
  useInitCustomChannelsStore()

  // useInitDisabledCW20Tokens()
  // useInitEnabledCW20Tokens()
  // useInitInteractedTokens()
  useInitDisabledNFTsCollections()

  useInitBetaNFTsCollections()
  useInitEnabledNftsCollections()
  useInitSnipDenoms()

  useGetQuickSearchOptions()
  useNomicBTCDepositConstants()
  useMobileAppBanner()

  useInitStakingDenoms()
  useInitChainInfosConfig()
  useInitKadoBuyChains()

  useFetchAggregatedChainsList(app, version)
  useInitBetaEvmNftTokenIds()

  useGetBannerApi()
  useBannerConfig()

  useInitEpochStore()

  return <></>
})

export const InitHooks = observer(() => {
  const location = useLocation()

  useInitiateCurrencyPreference()

  useInitGasPriceSteps()
  useInitGasAdjustments()
  useInitFeeDenoms()
  useInitIsCompassWallet()
  useInitActiveWallet(passwordStore)

  useInitTxMetadata({ appVersion: version })

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
