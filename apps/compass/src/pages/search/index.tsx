import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import useQuery from 'hooks/useQuery'
import React, { useMemo } from 'react'
import { activeChainStore } from 'stores/active-chain-store'
import { cw20TokenBalanceStore, marketDataStore, priceStore } from 'stores/balance-store'
import { compassTokensAssociationsStore } from 'stores/chain-infos-store'
import {
  autoFetchedCW20DenomsStore,
  betaCW20DenomsStore,
  betaERC20DenomsStore,
  compassTokenTagsStore,
  cw20DenomsStore,
  denomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
  erc20DenomsStore,
  rootDenomsStore,
} from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { isCompassWallet } from 'utils/isCompassWallet'

import { SwapContextProvider } from '../swaps-v2/context'
import { SearchPage } from './SearchPage'

export default function Search() {
  const pageViewSource = useQuery().get('pageSource') ?? undefined
  const pageViewAdditionalProperties = useMemo(() => {
    return { pageViewSource }
  }, [pageViewSource])

  usePageView(PageName.Search, pageViewAdditionalProperties)

  if (!isCompassWallet()) {
    return null
  }

  return (
    <SwapContextProvider
      rootDenomsStore={rootDenomsStore}
      rootBalanceStore={rootBalanceStore}
      activeChainStore={activeChainStore}
      autoFetchedCW20DenomsStore={autoFetchedCW20DenomsStore}
      betaCW20DenomsStore={betaCW20DenomsStore}
      cw20DenomsStore={cw20DenomsStore}
      cw20DenomBalanceStore={cw20TokenBalanceStore}
      disabledCW20DenomsStore={disabledCW20DenomsStore}
      enabledCW20DenomsStore={enabledCW20DenomsStore}
      betaERC20DenomsStore={betaERC20DenomsStore}
      erc20DenomsStore={erc20DenomsStore}
      compassTokenTagsStore={compassTokenTagsStore}
      compassTokensAssociationsStore={compassTokensAssociationsStore}
      priceStore={priceStore}
    >
      <SearchPage
        compassTokenTagsStore={compassTokenTagsStore}
        denomsStore={denomsStore}
        marketDataStore={marketDataStore}
      />
    </SwapContextProvider>
  )
}
