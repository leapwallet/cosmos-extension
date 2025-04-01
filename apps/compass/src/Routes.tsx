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
import { InitHooks } from 'init-hooks'
import { GlobalLayout } from 'layout'
import Login from 'pages/auth/login'
import Home from 'pages/home/Home'
import { AddEvmLedger } from 'pages/onboarding/import/AddEvmLedger'
import { OnboardingSuspenseLoader } from 'pages/onboarding/suspense-loader'
import useAssets from 'pages/swaps-v2/hooks/useAssets'
import React, { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { compassSeiEvmConfigStore, marketDataStore } from 'stores/balance-store'
import { compassTokensAssociationsStore } from 'stores/chain-infos-store'
import { compassTokenTagsStore, denomsStore, rootDenomsStore } from 'stores/denoms-store-instance'
import { nftStore } from 'stores/nft-store'
import { rootBalanceStore, rootStakeStore } from 'stores/root-store'
import { isCompassWallet } from 'utils/isCompassWallet'

import { AuthProvider, RequireAuth, RequireAuthOnboarding } from './context/auth-context'

const Activity = lazy(() => import('pages/activity/Activity'))
const Swap = lazy(() => import('pages/swaps-v2'))
const Search = lazy(() => import('pages/search'))
const ApproveConnection = React.lazy(() => import('pages/ApproveConnection/ApproveConnection'))
const TokensDetails = React.lazy(() => import('pages/asset-details'))
const Earn = React.lazy(() => import('pages/earn'))
const ForgotPassword = React.lazy(() => import('pages/forgot-password'))

const ManageChain = React.lazy(() => import('pages/manageChain'))
const Onboarding = React.lazy(async () => import('pages/onboarding'))

const OnboardingCreateWallet = React.lazy(() => import('pages/onboarding/create'))
const OnboardingImportWallet = React.lazy(() => import('pages/onboarding/import'))
const OnboardingSuccess = React.lazy(() => import('pages/onboarding/success'))
const AddSecretToken = React.lazy(() => import('pages/suggest/SuggestSecret'))
const Send = React.lazy(() => import('pages/send'))
const Buy = React.lazy(() => import('pages/buy'))
const Sign = React.lazy(() => import('pages/sign/sign-transaction'))
const SignSeiEvm = React.lazy(() => import('pages/sign-sei-evm/SignSeiEvmTransaction'))
const Stake = React.lazy(() => import('pages/stake-v2'))
const StakeInputPage = React.lazy(() => import('pages/stake-v2/StakeInputPage'))
const StakeTxnPage = React.lazy(() => import('pages/stake-v2/StakeTxnPage'))

const Discover = React.lazy(() => import('pages/discover'))
const SecretManageTokens = React.lazy(() => import('pages/snip20-manage-tokens'))
const SuggestErc20 = React.lazy(() => import('pages/suggest/SuggestErc20'))
const PendingTx = React.lazy(() => import('pages/activity/PendingTx'))
const NFTs = React.lazy(() => import('pages/nfts-v2/NFTPage'))
const AddToken = React.lazy(() => import('pages/add-token/AddToken'))
const ManageTokens = React.lazy(() => import('pages/manage-tokens'))
const Proposals = React.lazy(() => import('pages/governance/Proposals'))

const SwitchEthereumChain = React.lazy(() => import('pages/switch-ethereum-chain'))
const SwitchChain = React.lazy(() => import('pages/switch-chain'))
const RoutesMatch = Sentry.withSentryReactRouterV6Routing(Routes)

export default function AppRoutes(): JSX.Element {
  const { activeWallet } = useActiveWallet()

  useInitCustomChains()
  useChainAbstractionView()
  useFetchDualStakeDelegations(rootDenomsStore.allDenoms)
  useFetchDualStakeProviders(rootDenomsStore.allDenoms)
  useFetchDualStakeProviderRewards(rootDenomsStore.allDenoms)

  useActiveInfoEventDispatcher()

  useChains()
  useSkipSupportedChains()
  useAssets()

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
    <AuthProvider>
      <HashRouter>
        <InitHooks />
        <SidePanelNavigation />
        <AnimatedRoutes />
      </HashRouter>
    </AuthProvider>
  )
}

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <GlobalLayout location={location}>
      <RoutesMatch location={location}>
        <Route path='/' element={<Login />} />

        <Route
          path='onboarding'
          element={
            <RequireAuthOnboarding>
              <Suspense fallback={<OnboardingSuspenseLoader />}>
                <Onboarding />
              </Suspense>
            </RequireAuthOnboarding>
          }
        />
        <Route
          path='onboardingCreate'
          element={
            <RequireAuthOnboarding>
              <Suspense fallback={<OnboardingSuspenseLoader />}>
                <OnboardingCreateWallet />
              </Suspense>
            </RequireAuthOnboarding>
          }
        />
        <Route
          path='onboardingImport'
          element={
            <RequireAuthOnboarding>
              <Suspense fallback={<OnboardingSuspenseLoader />}>
                <OnboardingImportWallet />
              </Suspense>
            </RequireAuthOnboarding>
          }
        />

        <Route
          path='onboardingSuccess'
          element={
            <Suspense fallback={<OnboardingSuspenseLoader />}>
              <OnboardingSuccess />
            </Suspense>
          }
        />

        <Route
          path='forgotPassword'
          element={
            <Suspense fallback={<AppInitLoader />}>
              <ForgotPassword />
            </Suspense>
          }
        />

        <Route
          path='onboardEvmLedger'
          element={
            <RequireAuth>
              <Suspense fallback={<OnboardingSuspenseLoader />}>
                <AddEvmLedger />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='manageChain'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <ManageChain />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='assetDetails'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <TokensDetails
                  denomsStore={denomsStore}
                  rootDenomsStore={rootDenomsStore}
                  compassTokensAssociationsStore={compassTokensAssociationsStore}
                  compassSeiEvmConfigStore={compassSeiEvmConfigStore}
                  marketDataStore={marketDataStore}
                  compassTokenTagsStore={compassTokenTagsStore}
                />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='activity'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Activity />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='send'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Send />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='search'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Search />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='buy'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Buy />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='ibc'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Send />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='home'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Home />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='nfts'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <NFTs />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='stake'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Stake />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='earn'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Earn />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='swap'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Swap rootBalanceStore={rootBalanceStore} />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='gov'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Proposals />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='discover'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Discover />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='approveConnection'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <ApproveConnection />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='sign'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <Sign />
              </Suspense>
            </RequireAuth>
          }
        />

        <Route
          path='signSeiEvm'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <SignSeiEvm />
              </Suspense>
            </RequireAuth>
          }
        />

        <Route
          path='add-token'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <AddToken />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='add-secret-token'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <AddSecretToken />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='suggest-erc-20'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <SuggestErc20 />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='pending-tx'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <PendingTx rootBalanceStore={rootBalanceStore} rootStakeStore={rootStakeStore} />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='switch-chain'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <SwitchChain />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='stake/input'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <StakeInputPage />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='stake/pending-txn'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <StakeTxnPage rootBalanceStore={rootBalanceStore} rootStakeStore={rootStakeStore} />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='manage-tokens'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <ManageTokens />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='snip20-manage-tokens'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <SecretManageTokens />
              </Suspense>
            </RequireAuth>
          }
        />

        <Route
          path='switch-ethereum-chain'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <SwitchEthereumChain />
              </Suspense>
            </RequireAuth>
          }
        />
      </RoutesMatch>
    </GlobalLayout>
  )
}
