import {
  useActiveChain,
  useFetchDualStakeDelegations,
  useFetchDualStakeProviderRewards,
  useFetchDualStakeProviders,
  useInitCustomChains,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { useChains, useSkipSupportedChains } from '@leapwallet/elements-hooks'
import * as Sentry from '@sentry/react'
import { AppInitLoader } from 'components/loader/AppInitLoader'
import { SidePanelNavigation } from 'components/side-panel-navigation'
import { useActiveInfoEventDispatcher } from 'hooks/settings/useActiveInfoEventDispatcher'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainAbstractionView } from 'hooks/settings/useChainAbstractionView'
import { useAirdropsData } from 'hooks/useAirdropsData'
import { InitHooks } from 'init-hooks'
import Home from 'pages/home/Home'
import { AddEvmLedger, AddEvmTitle } from 'pages/onboarding/import/AddEvmLedger'
import useAssets from 'pages/swaps-v2/hooks/useAssets'
import React, { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { compassSeiEvmConfigStore, marketDataStore } from 'stores/balance-store'
import { chainTagsStore, compassTokensAssociationsStore } from 'stores/chain-infos-store'
import { compassTokenTagsStore, denomsStore, rootDenomsStore } from 'stores/denoms-store-instance'
import { nftStore } from 'stores/nft-store'
import { rootBalanceStore, rootStakeStore, rootStore } from 'stores/root-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { isCompassWallet } from 'utils/isCompassWallet'

import { AuthProvider, RequireAuth, RequireAuthOnboarding } from './context/auth-context'

const Activity = lazy(() => import('pages/activity/Activity'))
const Swap = lazy(() => import('pages/swaps-v2'))
const Search = lazy(() => import('pages/search'))
const ApproveConnection = React.lazy(() => import('pages/ApproveConnection/ApproveConnection'))
const TokensDetails = React.lazy(() => import('pages/asset-details/components/chart-details'))
const Login = React.lazy(() => import('pages/auth/login'))
const Earn = React.lazy(() => import('pages/earn'))
const ForgotPassword = React.lazy(() => import('pages/forgot-password'))

const ManageChain = React.lazy(() => import('pages/manageChain'))
const Onboarding = React.lazy(() => import('pages/onboarding'))

const OnboardingCreateWallet = React.lazy(() => import('pages/onboarding/create'))
const OnboardingImportWallet = React.lazy(() => import('pages/onboarding/import'))
const OnboardingSuccess = React.lazy(() => import('pages/onboarding/success'))
const AddSecretToken = React.lazy(() => import('pages/suggest/SuggestSecret'))
const Send = React.lazy(() => import('pages/send-v2'))
const Buy = React.lazy(() => import('pages/buy'))
const Sign = React.lazy(() => import('pages/sign/sign-transaction'))
const SignAptos = React.lazy(() => import('pages/sign-aptos/sign-transaction'))
const SignBitcoin = React.lazy(() => import('pages/sign-bitcoin/SignBitcoinTransaction'))
const SignSeiEvm = React.lazy(() => import('pages/sign-sei-evm/SignSeiEvmTransaction'))
const Stake = React.lazy(() => import('pages/stake-v2'))
const StakeInputPage = React.lazy(() => import('pages/stake-v2/StakeInputPage'))
const StakeTxnPage = React.lazy(() => import('pages/stake-v2/StakeTxnPage'))

const AddChain = React.lazy(() => import('pages/suggestChain/addChain'))
const SuggestChain = React.lazy(() => import('pages/suggestChain/suggestChain'))
const Airdrops = React.lazy(() => import('pages/airdrops'))
const AirdropsDetails = React.lazy(() => import('pages/airdrops/AirdropsDetails'))
const SecretManageTokens = React.lazy(() => import('pages/snip20-manage-tokens'))
const SuggestErc20 = React.lazy(() => import('pages/suggest/SuggestErc20'))
const PendingTx = React.lazy(() => import('pages/activity/PendingTx'))
const NFTs = React.lazy(() => import('pages/nfts-v2/NFTs'))
const AddToken = React.lazy(() => import('pages/add-token/AddToken'))
const ManageTokens = React.lazy(() => import('pages/manage-tokens'))
const Proposals = React.lazy(() => import('pages/governance/Proposals'))

const SwitchEthereumChain = React.lazy(() => import('pages/switch-ethereum-chain'))
const SuggestEthereumChain = React.lazy(() => import('pages/suggestChain/SuggestEthereumChain'))
const SwitchChain = React.lazy(() => import('pages/switch-chain'))
const RoutesMatch = Sentry.withSentryReactRouterV6Routing(Routes)

export default function AppRoutes(): JSX.Element {
  const { activeWallet } = useActiveWallet()
  const fetchAirdropsData = useAirdropsData()

  useInitCustomChains()
  useChainAbstractionView()
  useFetchDualStakeDelegations(rootDenomsStore.allDenoms)
  useFetchDualStakeProviders(rootDenomsStore.allDenoms)
  useFetchDualStakeProviderRewards(rootDenomsStore.allDenoms)

  useActiveInfoEventDispatcher()

  useChains()
  useSkipSupportedChains()
  useAssets()

  useEffect(() => {
    if (activeWallet) {
      fetchAirdropsData()
    }
  }, [activeWallet, activeWallet?.id, fetchAirdropsData])

  const activeChain = useActiveChain()
  const activeNetwork = useSelectedNetwork()

  useEffect(() => {
    ;(function () {
      if (nftStore.haveToFetchNfts === false) {
        nftStore.haveToFetchNfts = true
      }
    })()
  }, [activeWallet?.addresses])

  useEffect(() => {
    ;(function () {
      if (isCompassWallet() && nftStore.haveToFetchNfts === false) {
        nftStore.haveToFetchNfts = true
      }
    })()
  }, [activeChain, activeNetwork])

  return (
    <Suspense fallback={<AppInitLoader />}>
      <AuthProvider>
        <HashRouter>
          <InitHooks />
          <SidePanelNavigation />
          <RoutesMatch>
            <Route path='/' element={<Login />} />
            <Route
              path='onboarding'
              element={
                <RequireAuthOnboarding>
                  <Onboarding />
                </RequireAuthOnboarding>
              }
            />
            <Route
              path='onboardingCreate'
              element={
                <RequireAuthOnboarding>
                  <OnboardingCreateWallet />
                </RequireAuthOnboarding>
              }
            />
            <Route
              path='onboardingImport'
              element={
                <RequireAuthOnboarding>
                  <OnboardingImportWallet />
                </RequireAuthOnboarding>
              }
            />
            <Route path='onboardingSuccess' element={<OnboardingSuccess />} />

            <Route path='forgotPassword' element={<ForgotPassword />} />

            <Route
              path='onboardEvmLedger'
              element={
                <RequireAuth titleComponent={<AddEvmTitle />}>
                  <AddEvmLedger />
                </RequireAuth>
              }
            />
            <Route
              path='manageChain'
              element={
                <RequireAuth>
                  <ManageChain />
                </RequireAuth>
              }
            />
            <Route
              path='assetDetails'
              element={
                <RequireAuth>
                  <TokensDetails
                    denomsStore={denomsStore}
                    chainTagsStore={chainTagsStore}
                    rootDenomsStore={rootDenomsStore}
                    compassTokensAssociationsStore={compassTokensAssociationsStore}
                    compassSeiEvmConfigStore={compassSeiEvmConfigStore}
                    marketDataStore={marketDataStore}
                    compassTokenTagsStore={compassTokenTagsStore}
                  />
                </RequireAuth>
              }
            />
            <Route
              path='activity'
              element={
                <RequireAuth>
                  <Activity />
                </RequireAuth>
              }
            />
            <Route
              path='send'
              element={
                <RequireAuth>
                  <Send />
                </RequireAuth>
              }
            />
            <Route
              path='search'
              element={
                <RequireAuth>
                  <Search />
                </RequireAuth>
              }
            />
            <Route
              path='buy'
              element={
                <RequireAuth>
                  <Buy />
                </RequireAuth>
              }
            />
            <Route
              path='ibc'
              element={
                <RequireAuth>
                  <Send />
                </RequireAuth>
              }
            />
            <Route
              path='home'
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path='nfts'
              element={
                <RequireAuth>
                  <NFTs />
                </RequireAuth>
              }
            />
            <Route
              path='stake'
              element={
                <RequireAuth>
                  <Stake />
                </RequireAuth>
              }
            />
            <Route
              path='earn'
              element={
                <RequireAuth>
                  <Earn chainTagsStore={chainTagsStore} />
                </RequireAuth>
              }
            />
            <Route
              path='swap'
              element={
                <RequireAuth>
                  <Swap rootBalanceStore={rootBalanceStore} />
                </RequireAuth>
              }
            />
            <Route
              path='gov'
              element={
                <RequireAuth>
                  <Proposals />
                </RequireAuth>
              }
            />
            <Route
              path='approveConnection'
              element={
                <RequireAuth hideBorder={true}>
                  <ApproveConnection />
                </RequireAuth>
              }
            />
            <Route
              path='sign'
              element={
                <RequireAuth hideBorder={true}>
                  <Sign />
                </RequireAuth>
              }
            />
            <Route
              path='signAptos'
              element={
                <RequireAuth hideBorder={true}>
                  <SignAptos />
                </RequireAuth>
              }
            />
            <Route
              path='signBitcoin'
              element={
                <RequireAuth hideBorder={true}>
                  <SignBitcoin />
                </RequireAuth>
              }
            />
            <Route
              path='signSeiEvm'
              element={
                <RequireAuth hideBorder={true}>
                  <SignSeiEvm />
                </RequireAuth>
              }
            />
            <Route
              path='suggestChain'
              element={
                <RequireAuth hideBorder={true}>
                  <SuggestChain />
                </RequireAuth>
              }
            />
            <Route
              path='add-chain'
              element={
                <RequireAuth>
                  <AddChain />
                </RequireAuth>
              }
            />
            <Route
              path='add-token'
              element={
                <RequireAuth>
                  <AddToken />
                </RequireAuth>
              }
            />
            <Route
              path='add-secret-token'
              element={
                <RequireAuth hideBorder={true}>
                  <AddSecretToken />
                </RequireAuth>
              }
            />
            <Route
              path='suggest-erc-20'
              element={
                <RequireAuth hideBorder={true}>
                  <SuggestErc20 />
                </RequireAuth>
              }
            />
            <Route
              path='pending-tx'
              element={
                <RequireAuth>
                  <PendingTx rootBalanceStore={rootBalanceStore} rootStakeStore={rootStakeStore} />
                </RequireAuth>
              }
            />
            <Route
              path='switch-chain'
              element={
                <RequireAuth>
                  <SwitchChain />
                </RequireAuth>
              }
            />
            <Route
              path='stake/input'
              element={
                <RequireAuth>
                  <StakeInputPage
                    rootDenomsStore={rootDenomsStore}
                    delegationsStore={delegationsStore}
                    validatorsStore={validatorsStore}
                    unDelegationsStore={unDelegationsStore}
                    claimRewardsStore={claimRewardsStore}
                    rootBalanceStore={rootBalanceStore}
                    nmsStore={rootStore.nmsStore}
                  />
                </RequireAuth>
              }
            />
            <Route
              path='stake/pending-txn'
              element={
                <RequireAuth>
                  <StakeTxnPage
                    rootBalanceStore={rootBalanceStore}
                    rootStakeStore={rootStakeStore}
                  />
                </RequireAuth>
              }
            />
            <Route
              path='manage-tokens'
              element={
                <RequireAuth>
                  <ManageTokens />
                </RequireAuth>
              }
            />
            <Route
              path='snip20-manage-tokens'
              element={
                <RequireAuth>
                  <SecretManageTokens />
                </RequireAuth>
              }
            />
            <Route
              path='airdrops'
              element={
                <RequireAuth>
                  <Airdrops />
                </RequireAuth>
              }
            />
            <Route
              path='airdropsDetails'
              element={
                <RequireAuth>
                  <AirdropsDetails />
                </RequireAuth>
              }
            />
            <Route
              path='switch-ethereum-chain'
              element={
                <RequireAuth>
                  <SwitchEthereumChain />
                </RequireAuth>
              }
            />
            <Route
              path='suggest-ethereum-chain'
              element={
                <RequireAuth hideBorder={true}>
                  <SuggestEthereumChain />
                </RequireAuth>
              }
            />
          </RoutesMatch>
        </HashRouter>
      </AuthProvider>
    </Suspense>
  )
}
