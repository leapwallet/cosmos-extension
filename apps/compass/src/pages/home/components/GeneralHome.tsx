import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { QueryStatus } from '@tanstack/react-query'
import { SeiLedgerAppStrip } from 'components/alert-strip/SeiLedgerAppStrip'
import { EmptyCard } from 'components/empty-card'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import usePrevious from 'hooks/utility/usePrevious'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { evmBalanceStore } from 'stores/balance-store'
import { rootBalanceStore, rootStore } from 'stores/root-store'
import { AggregatedSupportedChain } from 'types/utility'
import { cn } from 'utils/cn'

import PendingSwapsAlertStrip from '../PendingSwapsAlertStrip'
import { ChainInfoProp } from '../utils'
import { BalanceHeader } from './balance-header'
import { GeneralHomeAlertStirps } from './general-home-alert-strips'
import { GeneralHomeHeader } from './general-home-header'
import { HomeLoadingState } from './home-loading-state'
import { GlobalBannersAD, HomeButtons } from './index'
import { TokensSection } from './TokensSection'

export const GeneralHome = observer(() => {
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const prevActiveChain = usePrevious(activeChain)

  const selectedNetwork = useSelectedNetwork()

  const { activeWallet } = useActiveWallet()
  const prevWallet = usePrevious(activeWallet)

  const chain: ChainInfoProp = useChainInfo()

  const evmStatus = evmBalanceStore.evmBalanceForChain(activeChain as SupportedChain)?.status
  const balanceError =
    activeChain !== 'aggregated' &&
    rootBalanceStore.getErrorStatusForChain(activeChain, selectedNetwork)

  const noAddress = activeChain !== AGGREGATED_CHAIN_KEY && !activeWallet?.addresses[activeChain]

  const queryStatus: QueryStatus = rootBalanceStore.loading ? 'loading' : 'success'

  usePerformanceMonitor({
    page: 'home',
    op: 'homePageLoad',
    queryStatus,
    description: 'loading state on home page',
  })

  usePerformanceMonitor({
    page: 'wallet-switch',
    op: 'walletSwitchLoadTime',
    queryStatus,
    description: 'loading state on wallet switch page',
    enabled: !!prevWallet && prevWallet.id !== activeWallet?.id,
  })

  usePerformanceMonitor({
    page: 'chain-switch',
    op: 'chainSwitchLoadTime',
    queryStatus,
    description: 'loading state on chain switch page',
    enabled: !!prevActiveChain && prevActiveChain !== activeChain,
  })

  if (!activeWallet) {
    return <HomeLoadingState />
  }

  if (!chain && activeChain !== AGGREGATED_CHAIN_KEY) {
    return null
  }

  return (
    <div className='relative w-full overflow-auto panel-height'>
      <GeneralHomeHeader />

      <div className={'w-full flex flex-col justify-center items-center mb-20 relative isolate'}>
        <GeneralHomeAlertStirps evmStatus={evmStatus} balanceError={balanceError} />
        <SeiLedgerAppStrip />

        <BalanceHeader watchWallet={activeWallet?.watchWallet} />

        {!activeWallet?.watchWallet && <HomeButtons />}

        {selectedNetwork !== 'testnet' && (
          <GlobalBannersAD show={rootStore.initializing === 'done'} />
        )}

        <TokensSection noAddress={noAddress} balanceError={balanceError} evmStatus={evmStatus} />
      </div>

      <PendingSwapsAlertStrip />
    </div>
  )
})
