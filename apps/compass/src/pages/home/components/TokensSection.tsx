import {
  Token,
  useChainInfo,
  useGetChains,
  useSnipGetSnip20TokenBalances,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedLoadingCard, AggregatedLoadingList } from 'components/aggregated'
import WarningCard from 'components/WarningCard'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { AnimatePresence } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { rootBalanceStore, rootStore } from 'stores/root-store'
import { AggregatedSupportedChain } from 'types/utility'
import { getLedgerEnabledEvmChainsIds } from 'utils/getLedgerEnabledEvmChains'
import { isCompassWallet } from 'utils/isCompassWallet'

import { ChainInfoProp } from '../utils'
import { FundBanners, ListTokens } from './index'
import { NativeTokenPlaceholder } from './NativeTokenPlaceholder'

const tokenHasBalance = (token: Token | undefined) => {
  return !!token?.amount && !isNaN(parseFloat(token?.amount)) && parseFloat(token.amount) > 0
}

export const TokensSection = observer(
  ({
    noAddress,
    balanceError,
    evmStatus,
  }: {
    noAddress: boolean
    balanceError: boolean
    evmStatus: string
  }) => {
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const chains = useGetChains()
    const chain: ChainInfoProp = useChainInfo()
    const { activeWallet } = useActiveWallet()
    const isWalletHasFunds = !!rootBalanceStore?.allTokens?.some((token) => tokenHasBalance(token))
    const atLeastOneTokenIsLoading = rootBalanceStore.loading
    const { snip20TokensStatus, enabled: snip20Enabled } = useSnipGetSnip20TokenBalances()

    const apiUnavailable = useMemo(() => {
      return (
        activeChain !== AGGREGATED_CHAIN_KEY &&
        atLeastOneTokenIsLoading &&
        chain?.apiStatus === false
      )
    }, [activeChain, atLeastOneTokenIsLoading, chain?.apiStatus])

    const ledgerEnabledEvmChainsIds = useMemo(() => {
      return getLedgerEnabledEvmChainsIds(Object.values(chains))
    }, [chains])

    const ledgerNoSupported = useMemo(() => {
      return (
        noAddress &&
        !ledgerEnabledEvmChainsIds.includes(chain?.chainId) &&
        activeWallet?.walletType === WALLETTYPE.LEDGER
      )
    }, [activeWallet?.walletType, chain?.chainId, ledgerEnabledEvmChainsIds, noAddress])

    const disabledCardMessage = useMemo(() => {
      if (ledgerNoSupported) {
        return `Ledger support coming soon for ${chain?.chainName}`
      } else if (apiUnavailable) {
        return `The ${chain?.chainName} network is currently experiencing issues. Please try again later.`
      }

      return ''
    }, [apiUnavailable, chain?.chainName, ledgerNoSupported])

    const isTokenLoading = atLeastOneTokenIsLoading || rootStore.initializing !== 'done'

    const showFundBanners =
      !isCompassWallet() &&
      !chains?.[activeChain as SupportedChain]?.evmOnlyChain &&
      !isWalletHasFunds &&
      !isTokenLoading &&
      !balanceError

    return (
      <div className='w-full px-4'>
        {noAddress || apiUnavailable ? (
          <WarningCard text={disabledCardMessage} />
        ) : showFundBanners ? (
          <FundBanners />
        ) : balanceError ? (
          <NativeTokenPlaceholder />
        ) : (
          <AnimatePresence exitBeforeEnter>
            {isTokenLoading ? (
              <AggregatedLoadingList />
            ) : (
              <>
                <ListTokens />

                {evmStatus !== 'success' ? <AggregatedLoadingCard className='mb-[12px]' /> : null}
                {activeChain === 'secret' && snip20TokensStatus !== 'success' && snip20Enabled ? (
                  <AggregatedLoadingCard className='mb-[12px]' />
                ) : null}
              </>
            )}
          </AnimatePresence>
        )}
      </div>
    )
  },
)
