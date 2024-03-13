import {
  useFetchCW20Tokens,
  useFetchERC20Tokens,
  useFetchStakeClaimRewards,
  useFetchStakeDelegations,
  useFetchStakeUndelegations,
  useFetchStakeValidators,
  useGetNtrnProposals,
  useInitCustomChains,
  useInitGovProposals,
} from '@leapwallet/cosmos-wallet-hooks'
import * as Sentry from '@sentry/react'
import { AppInitLoader } from 'components/loader/AppInitLoader'
import { useInitAnalytics } from 'hooks/analytics/useInitAnalytics'
import { useFillBetaCW20Tokens, useFillBetaNativeTokens } from 'hooks/settings'
import { ManageTokens } from 'pages/manage-tokens'
import { lazy, Suspense } from 'react'
import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { ledgerPopupState } from './atoms/ledger-popup'
import LedgerConfirmationPopup from './components/ledger-confirmation/LedgerConfirmationPopup'
import { AuthProvider, RequireAuth, RequireAuthOnboarding } from './context/auth-context'

const Activity = lazy(() => import('pages/activity/Activity'))
const Swap = lazy(() => import('pages/swaps-v2').then((module) => ({ default: module.Swap })))

// For default exports
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
const AddSecretToken = React.lazy(() => import('pages/secret/addSecretToken'))
const Send = React.lazy(() => import('pages/send-v2'))
const Sign = React.lazy(() => import('pages/sign/sign-transaction'))
const Stake = React.lazy(() => import('pages/stake'))
const CancelUndelegationPage = React.lazy(() => import('pages/stake/cancelUndelegation'))
const ChooseValidator = React.lazy(() => import('pages/stake/chooseValidator'))
const ValidatorDetails = React.lazy(() => import('pages/stake/validatorDetails'))
const AddChain = React.lazy(() => import('pages/suggestChain/addChain'))
const SuggestChain = React.lazy(() => import('pages/suggestChain/suggestChain'))

// For named exports, using dynamic import
const PendingTx = React.lazy(() =>
  import('pages/activity/PendingTx').then((module) => ({ default: module.PendingTx })),
)
const NFTs = React.lazy(() => import('pages/nfts-v2').then((module) => ({ default: module.NFTs })))
const AddToken = React.lazy(() =>
  import('pages/secret/AddToken').then((module) => ({ default: module.AddToken })),
)
const Proposals = React.lazy(() => import('pages/governance/Proposals'))

const RoutesMatch = Sentry.withSentryReactRouterV6Routing(Routes)

export default function AppRoutes(): JSX.Element {
  const showLedgerPopup = useRecoilValue(ledgerPopupState)
  useFetchCW20Tokens()
  useFillBetaCW20Tokens()
  useFillBetaNativeTokens()
  useFetchERC20Tokens()

  useInitAnalytics()
  useInitGovProposals()
  useInitCustomChains()
  useGetNtrnProposals()
  useFetchStakeClaimRewards()
  useFetchStakeDelegations()
  useFetchStakeUndelegations()
  useFetchStakeValidators()

  return (
    <Suspense fallback={<AppInitLoader />}>
      <AuthProvider>
        <HashRouter>
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
              path='stakeChooseValidator'
              element={
                <RequireAuth>
                  <ChooseValidator />
                </RequireAuth>
              }
            />
            <Route
              path='stakeValidatorDetails'
              element={
                <RequireAuth>
                  <ValidatorDetails />
                </RequireAuth>
              }
            />
            <Route
              path='stakeCancelUndelegation'
              element={
                <RequireAuth>
                  <CancelUndelegationPage />
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
                  <TokensDetails />
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
                  <Earn />
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
              path='pending-tx'
              element={
                <RequireAuth>
                  <PendingTx />
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
          </RoutesMatch>
        </HashRouter>
        <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />
      </AuthProvider>
    </Suspense>
  )
}
