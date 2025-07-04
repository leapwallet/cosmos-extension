import {
  useFetchDualStakeDelegations,
  useFetchDualStakeProviderRewards,
  useFetchDualStakeProviders,
  useInitCustomChains,
  useLuminaTxClientStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { useChains, useSkipSupportedChains } from '@leapwallet/elements-hooks'
import * as Sentry from '@sentry/react'
import { AppInitLoader } from 'components/loader/AppInitLoader'
import { SidePanelNavigation } from 'components/side-panel-navigation'
import ImportWatchWalletSeedPopup from 'components/watch-watch/ImportWatchWalletSeedPopup'
import { useActiveInfoEventDispatcher } from 'hooks/settings/useActiveInfoEventDispatcher'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainAbstractionView } from 'hooks/settings/useChainAbstractionView'
import { useAirdropsData } from 'hooks/useAirdropsData'
import { InitHooks } from 'init-hooks'
import { GlobalLayout } from 'layout'
import { ActivityPageLoader } from 'pages/activity/ActivityPageLoader'
import { ActivityHeader } from 'pages/activity/components/activity-header'
import { EligibleDetailsDrawer } from 'pages/alpha/chad-components/EligibilityDetailsDrawer'
import { AlphaContextProvider } from 'pages/alpha/context'
import EarnPage from 'pages/earnUSDN'
import Home from 'pages/home/Home'
import SideNav from 'pages/home/side-nav'
import { NFTLoading } from 'pages/nfts/NFTLoading'
import useAssets from 'pages/swaps-v2/hooks/useAssets'
import { SwapsLoader } from 'pages/swaps-v2/SwapsLoader'
import React, { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { percentageChangeDataStore, priceStore } from 'stores/balance-store'
import { chainTagsStore } from 'stores/chain-infos-store'
import { denomsStore, rootDenomsStore } from 'stores/denoms-store-instance'
import { nftStore } from 'stores/nft-store'
import { rootBalanceStore, rootStakeStore, rootStore } from 'stores/root-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { LuminaTxClientWasm } from 'utils/luminaTxClient'
import Browser from 'webextension-polyfill'

import { AuthProvider, RequireAuth, RequireAuthOnboarding } from './context/auth-context'

const Activity = lazy(() => import('pages/activity/Activity'))
const Swap = lazy(() => import('pages/swaps-v2'))
const ApproveConnection = React.lazy(() => import('pages/ApproveConnection/ApproveConnection'))
const TokensDetails = React.lazy(() => import('pages/asset-details/components/chart-details'))
const Login = React.lazy(() => import('pages/auth/login'))
const Earn = React.lazy(() => import('pages/earn'))
const InitiaVip = React.lazy(() => import('pages/initia-vip'))
const ForgotPassword = React.lazy(() => import('pages/forgot-password'))

const ManageChain = React.lazy(() => import('pages/manageChain'))
const Onboarding = React.lazy(() => import('pages/onboarding'))
const ImportLedger = React.lazy(() => import('pages/importLedger'))

const OnboardingCreateWallet = React.lazy(() => import('pages/onboarding/create'))
const OnboardingImportWallet = React.lazy(() => import('pages/onboarding/import'))
const OnboardingSuccess = React.lazy(() => import('pages/onboarding/success'))
const AddSecretToken = React.lazy(() => import('pages/suggest/SuggestSecret'))
const Send = React.lazy(() => import('pages/send'))
const Buy = React.lazy(() => import('pages/buy'))
const Sign = React.lazy(() => import('pages/sign/sign-transaction'))
const SignAptos = React.lazy(() => import('pages/sign-aptos/sign-transaction'))
const SignBitcoin = React.lazy(() => import('pages/sign-bitcoin/SignBitcoinTransaction'))
const SignSeiEvm = React.lazy(() => import('pages/sign-sei-evm/SignSeiEvmTransaction'))
const SignSolana = React.lazy(() => import('pages/sign-solana/sign-transaction'))
const SignSui = React.lazy(() => import('pages/sign-sui/sign-transaction'))
const Stake = React.lazy(() => import('pages/stake-v2'))
const StakeInputPage = React.lazy(() => import('pages/stake-v2/StakeInputPage'))
const StakeTxnPage = React.lazy(() => import('pages/stake-v2/StakeTxnPage'))

const AddChain = React.lazy(() => import('pages/suggestChain/addChain'))
const SuggestChain = React.lazy(() => import('pages/suggestChain/suggestChain'))
const Airdrops = React.lazy(() => import('pages/airdrops'))
const AirdropsDetails = React.lazy(() => import('pages/airdrops/AirdropsDetails'))
const Alpha = React.lazy(() => import('pages/alpha'))
const SecretManageTokens = React.lazy(() => import('pages/snip20-manage-tokens'))
const SuggestErc20 = React.lazy(() => import('pages/suggest/SuggestErc20'))
const PendingTx = React.lazy(() => import('pages/activity/PendingTx'))
const NFTs = React.lazy(() => import('pages/nfts/NFTPage'))
const AddToken = React.lazy(() => import('pages/add-token/AddToken'))
const ManageTokens = React.lazy(() => import('pages/manage-tokens'))
const Proposals = React.lazy(() => import('pages/governance/Proposals'))

const SwitchEthereumChain = React.lazy(() => import('pages/switch-ethereum-chain'))
const SwitchSolanaChain = React.lazy(() => import('pages/switch-solana-chain'))
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
  useSkipSupportedChains({
    chainTypes: ['cosmos', 'evm'],
  })
  useAssets()

  const { setLuminaTxClient, setForceLuminaTxClient } = useLuminaTxClientStore()

  useEffect(() => {
    const rpcUrl = 'https://celestia-rpc.publicnode.com:443'
    setLuminaTxClient(new LuminaTxClientWasm(rpcUrl))
    Browser.storage.local.get('useCelestiaBalanceStore').then((res) => {
      if (res.useCelestiaBalanceStore === 'true') {
        setForceLuminaTxClient(true)
      }
    })
  }, [setLuminaTxClient])

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

  return (
    <Suspense fallback={<AppInitLoader />}>
      <AuthProvider>
        <HashRouter>
          <InitHooks />
          <SidePanelNavigation />
          <SideNav />
          <EligibleDetailsDrawer />

          <AnimatedRoutes />
          <ImportWatchWalletSeedPopup />
        </HashRouter>
      </AuthProvider>
    </Suspense>
  )
}

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <GlobalLayout location={location}>
      <RoutesMatch location={location}>
        <Route path='/' element={<Login location={location} />} />
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

        <Route
          path='importLedger'
          element={
            <RequireAuthOnboarding>
              <ImportLedger />
            </RequireAuthOnboarding>
          }
        />

        <Route path='onboardingSuccess' element={<OnboardingSuccess />} />

        <Route path='forgotPassword' element={<ForgotPassword />} />

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
              <Suspense fallback={<AppInitLoader />}>
                <TokensDetails
                  denomsStore={denomsStore}
                  chainTagsStore={chainTagsStore}
                  rootDenomsStore={rootDenomsStore}
                  percentageChangeDataStore={percentageChangeDataStore}
                  priceStore={priceStore}
                />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='activity'
          element={
            <RequireAuth>
              <Suspense fallback={<ActivityPageLoader />}>
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
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path='nfts'
          element={
            <RequireAuth>
              <Suspense
                fallback={
                  <>
                    <ActivityHeader disableWalletButton /> <NFTLoading />
                  </>
                }
              >
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
              <Earn chainTagsStore={chainTagsStore} />
            </RequireAuth>
          }
        />
        <Route
          path='swap'
          element={
            <RequireAuth>
              <Suspense fallback={<SwapsLoader />}>
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
          path='signSolana'
          element={
            <RequireAuth hideBorder={true}>
              <SignSolana />
            </RequireAuth>
          }
        />
        <Route
          path='signSui'
          element={
            <RequireAuth hideBorder={true}>
              <SignSui />
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
          path='switch-solana-chain'
          element={
            <RequireAuth>
              <SwitchSolanaChain />
            </RequireAuth>
          }
        />
        <Route
          path='stake/input'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <StakeInputPage
                  rootDenomsStore={rootDenomsStore}
                  delegationsStore={delegationsStore}
                  validatorsStore={validatorsStore}
                  unDelegationsStore={unDelegationsStore}
                  claimRewardsStore={claimRewardsStore}
                  rootBalanceStore={rootBalanceStore}
                  nmsStore={rootStore.nmsStore}
                />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='stake/pending-txn'
          element={
            <RequireAuth>
              <StakeTxnPage rootBalanceStore={rootBalanceStore} rootStakeStore={rootStakeStore} />
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
              <Suspense fallback={<AppInitLoader />}>
                <Airdrops />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path='airdropsDetails'
          element={
            <RequireAuth>
              <Suspense fallback={<AppInitLoader />}>
                <AirdropsDetails />
              </Suspense>
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
          path='alpha'
          element={
            <RequireAuth>
              <AlphaContextProvider>
                <Alpha />
              </AlphaContextProvider>
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
        <Route
          path='earn-usdn'
          element={
            <RequireAuth>
              <EarnPage />
            </RequireAuth>
          }
        />
        <Route
          path='initia-vip'
          element={
            <RequireAuth>
              <InitiaVip />
            </RequireAuth>
          }
        />
      </RoutesMatch>
    </GlobalLayout>
  )
}
