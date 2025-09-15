import {
  useBannerConfig,
  useFeatureFlags,
  useFetchAggregatedChainsList,
  useFetchDualStakeDelegations,
  useFetchDualStakeProviderRewards,
  useFetchDualStakeProviders,
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
  useInitCustomChains,
  useInitDefaultGasEstimates,
  useInitDisabledNFTsCollections,
  useInitEnabledNftsCollections,
  useInitFeeDenoms,
  useInitFractionalizedNftContracts,
  useInitGasAdjustments,
  useInitGasEstimateCache,
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
import { useActiveInfoEventDispatcher } from 'hooks/settings/useActiveInfoEventDispatcher'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainAbstractionView } from 'hooks/settings/useChainAbstractionView'
import { useInitiateCurrencyPreference } from 'hooks/settings/useCurrency'
import { useInitLightNode } from 'hooks/settings/useLightNode'
import { useAirdropsData } from 'hooks/useAirdropsData'
import { useInitChainInfos } from 'hooks/useChainInfos'
import { observer } from 'mobx-react-lite'
import useAssets from 'pages/swaps-v2/hooks/useAssets'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { chainInfoStore } from 'stores/chain-infos-store'
import { ibcDataStore } from 'stores/chains-api-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { useInitEpochStore } from 'stores/epoch-store'
import { lightNodeStore } from 'stores/light-node-store'
import { manageChainsStore } from 'stores/manage-chains-store'
import { favNftStore, hiddenNftStore } from 'stores/manage-nft-store'
import { nftStore } from 'stores/nft-store'
import { passwordStore } from 'stores/password-store'
import { sidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

import { useInitSecretTokens } from './hooks/secret/useInitSecretTokens'
import { useInitSecretViewingKeys } from './hooks/secret/useInitSecretViewingKeys'
import { useInitActiveWallet } from './hooks/settings/useActiveWallet'
import { useInitManageChains } from './hooks/settings/useManageChains'
import { useInitPrimaryWalletAddress } from './hooks/wallet/useInitPrimaryWalletAddress'

const app = 'extension'
const version = Browser.runtime.getManifest().version
export const individualPages = [
  '/approveConnection',
  '/sign',
  '/suggest-chain',
  '/switch-ethereum-chain',
  '/SuggestEthereumChain',
  '/SignSeiEvmTransaction',
  '/reconnect-ledger',
  '/signSolana',
  '/signAptos',
  '/signBitcoin',
  '/signSui',
  '/signSeiEvm',
]

const InitMainAppHooks = observer(() => {
  useInitCustomChains()
  useChainAbstractionView()
  useFetchDualStakeDelegations(rootDenomsStore.allDenoms)
  useFetchDualStakeProviders(rootDenomsStore.allDenoms)
  useFetchDualStakeProviderRewards(rootDenomsStore.allDenoms)

  const { activeWallet } = useActiveWallet()
  const fetchAirdropsData = useAirdropsData()

  useEffect(() => {
    if (activeWallet) {
      fetchAirdropsData()
    }
  }, [activeWallet, activeWallet?.id, fetchAirdropsData])

  useEffect(() => {
    ;(function () {
      if (nftStore.haveToFetchNfts === false) {
        nftStore.haveToFetchNfts = true
      }
    })()
  }, [activeWallet?.addresses])

  useAssets()
  useInitLightNode(lightNodeStore)
  useInitChainsApr()
  useInitCoingeckoPrices()

  useInitIteratedUriNftContracts()
  useInitFractionalizedNftContracts()

  useInitManageChains(manageChainsStore, chainInfoStore)
  useInitNftChains()

  useInitFavouriteNFTs(favNftStore)
  useInitHiddenNFTs(hiddenNftStore)

  useGetFaucetApi()
  useGetBannerApi()
  //useInitDenoms()
  useInitWhitelistedFactoryTokens()

  useInitSpamProposals()
  useFeatureFlags()

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
  useInitGasEstimateCache()

  useInitEpochStore()

  useEffect(() => {
    ibcDataStore.initCustomChannels()
  }, [])

  return <></>
})

const InitDappHooks = observer(() => {
  useActiveInfoEventDispatcher()
  useInitiateCurrencyPreference()
  useInitGasPriceSteps()
  useInitGasAdjustments()
  useInitFeeDenoms()
  useInitChainInfos()
  useInitTxMetadata({ appVersion: version })
  useInitSecretTokens()
  useInitSecretViewingKeys(passwordStore)
  useFeatureFlags()
  useTransactionConfigs()
  useInitTxLogCosmosBlockchainMap()
  useInitCompassSeiEvmConfig()
  useInitIbcTraceStore()
  useInitDefaultGasEstimates()
  useInitChainCosmosSDK()
  return <></>
})

export const InitHooks = observer(() => {
  const location = useLocation()
  const isApproveConnection = location.pathname === '/approveConnection'
  const isSuggestChain = location.pathname === '/suggest-chain'

  useInitIsCompassWallet()
  useInitActiveWallet(passwordStore)
  useInitPrimaryWalletAddress()
  useInitAnalytics()

  return (
    <>
      {!sidePanel &&
        individualPages.includes(location.pathname) &&
        !isApproveConnection &&
        !isSuggestChain && <InitDappHooks />}
      {!individualPages.includes(location.pathname) && (
        <>
          <InitDappHooks />
          <InitMainAppHooks />
        </>
      )}
    </>
  )
})
