import {
  useFetchDualStakeDelegations,
  useFetchDualStakeProviderRewards,
  useFetchDualStakeProviders,
  useInitCustomChains,
} from '@leapwallet/cosmos-wallet-hooks'
import { useAllSkipAssets, useChains, useSkipSupportedChains } from '@leapwallet/elements-hooks'
import * as Sentry from '@sentry/react'
import { AppInitLoader } from 'components/loader/AppInitLoader'
import { SidePanelNavigation } from 'components/side-panel-navigation'
import { useInitAnalytics } from 'hooks/analytics/useInitAnalytics'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainAbstractionView } from 'hooks/settings/useChainAbstractionView'
import { useAirdropsData } from 'hooks/useAirdropsData'
import { AddEvmLedger, AddEvmTitle } from 'pages/onboarding/import/AddEvmLedger'
import React, { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { chainTagsStore } from 'stores/chain-infos-store'
import { denomsStore, rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore, rootStakeStore, rootStore } from 'stores/root-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'

import { ledgerPopupState } from './atoms/ledger-popup'
import LedgerConfirmationPopup from './components/ledger-confirmation/LedgerConfirmationPopup'
import { AuthProvider, RequireAuth, RequireAuthOnboarding } from './context/auth-context'

const Activity = lazy(() => import('pages/activity/Activity'))
const Swap = lazy(() => import('pages/swaps-v2'))
const ApproveConnection = React.lazy(() => import('pages/ApproveConnection/ApproveConnection'))
const TokensDetails = React.lazy(() => import('pages/asset-details/components/chart-details'))
const Login = React.lazy(() => import('pages/auth/login'))
const Earn = React.lazy(() => import('pages/earn'))
const ForgotPassword = React.lazy(() => import('pages/forgot-password'))
const Home = React.lazy(() => import('pages/home/Home'))
const ManageChain = React.lazy(() => import('pages/manageChain'))
const Onboarding = React.lazy(() => import('pages/onboarding'))

const OnboardingCreateWallet = React.lazy(() => import('pages/onboarding/create'))
const OnboardingImportWallet = React.lazy(() => import('pages/onboarding/import'))
const OnboardingSuccess = React.lazy(() => import('pages/onboarding/success'))
const AddSecretToken = React.lazy(() => import('pages/suggest/SuggestSecret'))
const Send = React.lazy(() => import('pages/send-v2'))
const Buy = React.lazy(() => import('pages/buy'))
const Sign = React.lazy(() => import('pages/sign/sign-transaction'))
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
const RoutesMatch = Sentry.withSentryReactRouterV6Routing(Routes)

const useAllSkipAssetsParams = {
  includeCW20Assets: true,
  includeNoMetadataAssets: false,
  includeEVMAssets: false,
  includeSVMAssets: false,
  nativeOnly: false,
}

export default function AppRoutes(): JSX.Element {
  const showLedgerPopup = useRecoilValue(ledgerPopupState)
  const { activeWallet } = useActiveWallet()
  const fetchAirdropsData = useAirdropsData()

  useInitAnalytics()
  useInitCustomChains()
  useChainAbstractionView()
  useFetchDualStakeDelegations(rootDenomsStore.allDenoms)
  useFetchDualStakeProviders(rootDenomsStore.allDenoms)
  useFetchDualStakeProviderRewards(rootDenomsStore.allDenoms)

  useChains()
  useSkipSupportedChains()
  useAllSkipAssets(useAllSkipAssetsParams)

  useEffect(() => {
    if (activeWallet) {
      fetchAirdropsData()
    }
  }, [activeWallet, activeWallet?.id, fetchAirdropsData])

  return (
    <Suspense fallback={<AppInitLoader />}>
      <AuthProvider>
        <HashRouter>
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
                  <Swap />
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

        <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />
      </AuthProvider>
    </Suspense>
  )
}
