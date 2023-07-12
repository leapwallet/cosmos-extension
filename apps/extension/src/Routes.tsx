import { useFetchCW20Tokens, useFetchERC20Tokens } from '@leapwallet/cosmos-wallet-hooks'
import * as Sentry from '@sentry/react'
import { useFillBetaCW20Tokens, useFillBetaNFTsCollections } from 'hooks/settings'
import Activity from 'pages/activity/Activity'
import ApproveConnection from 'pages/ApproveConnection/ApproveConnection'
import AssetDetails from 'pages/asset-details'
import Login from 'pages/auth/login'
import Earn from 'pages/earn'
import ForgotPassword from 'pages/forgot-password'
import Proposals from 'pages/governance/Proposals'
import Home from 'pages/home/Home'
import ManageChain from 'pages/manageChain'
import NFTs from 'pages/nfts'
import Onboarding from 'pages/onboarding'
import OnboardingCreateWallet from 'pages/onboarding/create'
import OnboardingImportWallet from 'pages/onboarding/import'
import OnboardingSuccess from 'pages/onboarding/success'
import AddSecretToken from 'pages/secret/addSecretToken'
import { AddToken } from 'pages/secret/AddToken'
import Send from 'pages/send-v2'
import Sign from 'pages/sign/sign-transaction'
import Stake from 'pages/stake'
import ChooseValidator from 'pages/stake/chooseValidator'
import ValidatorDetails from 'pages/stake/validatorDetails'
import SuggestChain from 'pages/suggestChain'
import AddChain from 'pages/suggestChain/addChain'
import Swap from 'pages/swaps'
import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { ledgerPopupState } from './atoms/ledger-popup'
import LedgerConfirmationPopup from './components/ledger-confirmation/LedgerConfirmationPopup'
import { AuthProvider, RequireAuth, RequireAuthOnboarding } from './context/auth-context'

const RoutesMatch = Sentry.withSentryReactRouterV6Routing(Routes)

export default function AppRoutes(): JSX.Element {
  const showLedgerPopup = useRecoilValue(ledgerPopupState)
  useFetchCW20Tokens()
  useFillBetaCW20Tokens()
  useFillBetaNFTsCollections()
  useFetchERC20Tokens()

  return (
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
                <AssetDetails />
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
        </RoutesMatch>
      </HashRouter>
      <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />
    </AuthProvider>
  )
}
