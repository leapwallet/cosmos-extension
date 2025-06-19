import {
  Token,
  useChainId,
  useChainInfo,
  useGetChains,
  useSnipGetSnip20TokenBalances,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { isSolanaChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedLoadingList } from 'components/aggregated'
import WarningCard from 'components/WarningCard'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  aptosCoinDataStore,
  evmBalanceStore,
  solanaCoinDataStore,
  suiCoinDataStore,
} from 'stores/balance-store'
import { rootBalanceStore } from 'stores/root-store'
import { zeroStateBannerStore } from 'stores/zero-state-banners'
import { zeroStateTokensStore } from 'stores/zero-state-tokens-store'
import { AggregatedSupportedChain } from 'types/utility'
import { getLedgerEnabledEvmChainsIds } from 'utils/getLedgerEnabledEvmChains'

import { ChainInfoProp } from '../../utils'
import { tokenHasBalance } from '../GeneralHome'
import { ListTokens } from '../index'
import { NativeTokenPlaceholder } from '../NativeTokenPlaceholder'
import { ZeroStateBanner } from '../ZeroStateBanner'
import { TokenSectionHeader } from './header'
import { SearchTokensInput } from './SearchTokensInput'

export const TokensSection = observer(
  ({
    noAddress,
    balanceError,
    evmStatus,
    isTokenLoading,
  }: {
    noAddress: boolean
    balanceError: boolean
    evmStatus: string
    isTokenLoading: boolean
  }) => {
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const chains = useGetChains()
    const chain: ChainInfoProp = useChainInfo()
    const { activeWallet } = useActiveWallet()
    const [isSearchTokensInputVisible, setIsSearchTokensInputVisible] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const allTokens = rootBalanceStore.allTokens
    const evmBalance = evmBalanceStore.evmBalance
    const aptosBalance = aptosCoinDataStore.balances
    const suiBalance = suiCoinDataStore.balances
    const solanaBalance = solanaCoinDataStore.balances
    const isAptosChain = chains?.[activeChain as SupportedChain]?.chainId.startsWith('aptos')
    const isEvmOnlyChain = chains?.[activeChain as SupportedChain]?.evmOnlyChain
    const isSuiChain = chains?.[activeChain as SupportedChain]?.chainId.startsWith('sui')
    const _isSolanaChain = isSolanaChain(activeChain)

    const toggleSearchTokensInput = useCallback(() => {
      setIsSearchTokensInputVisible((prev) => !prev)
    }, [])

    useEffect(() => {
      setIsSearchTokensInputVisible(false)
    }, [activeChain])

    const zeroStateTokens = zeroStateTokensStore.zeroStateTokens

    const allTokensToShow = useMemo(() => {
      let _allTokens = allTokens
      if (isEvmOnlyChain) {
        _allTokens = [...(evmBalance?.evmBalance ?? []), ...(_allTokens ?? [])]
      }
      if (isAptosChain) {
        _allTokens = [...(aptosBalance ?? [])]
      }
      if (_isSolanaChain) {
        _allTokens = [...(solanaBalance ?? [])]
      }
      if (isSuiChain) {
        _allTokens = [...(suiBalance ?? [])]
      }

      zeroStateTokens.forEach((token) => {
        const existingToken = _allTokens.find((t) => t.coinMinimalDenom === token.coinMinimalDenom)

        if (existingToken) {
          if (existingToken.amount === '0') {
            _allTokens = _allTokens.filter((t) => t.coinMinimalDenom !== token.coinMinimalDenom)
            _allTokens.push(token)
          }
        } else if (activeChain === 'aggregated' || activeChain === token.tokenBalanceOnChain) {
          _allTokens.push(token)
        }
      })

      return _allTokens
    }, [
      isEvmOnlyChain,
      isAptosChain,
      allTokens,
      activeChain,
      evmBalance?.evmBalance,
      aptosBalance,
      zeroStateTokens,
      _isSolanaChain,
      suiBalance,
      solanaBalance,
      isSuiChain,
    ])

    const isWalletHasFunds = !!allTokensToShow?.some((token) => tokenHasBalance(token))
    const selectedNetwork = useSelectedNetwork()
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

    const activeChainId = useChainId(
      activeChain === AGGREGATED_CHAIN_KEY ? undefined : activeChain,
      selectedNetwork,
      isEvmOnlyChain,
    )
    const zeroStateBanner = zeroStateBannerStore.getBannerForChain(
      activeChain === AGGREGATED_CHAIN_KEY ? undefined : activeChainId,
    )

    const showFundBanners =
      (!!zeroStateBanner || allTokensToShow.length === 0) &&
      !isWalletHasFunds &&
      !isTokenLoading &&
      !balanceError

    return (
      <>
        {noAddress || apiUnavailable ? (
          <WarningCard text={disabledCardMessage} />
        ) : showFundBanners ? (
          <ZeroStateBanner zeroStateBanner={zeroStateBanner} />
        ) : balanceError ? (
          <NativeTokenPlaceholder />
        ) : (
          <section className='flex flex-col w-full px-5 pb-20'>
            <TokenSectionHeader
              showSearch={isSearchTokensInputVisible}
              toggleSearchTokensInput={toggleSearchTokensInput}
            />

            <SearchTokensInput
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showSearch={isSearchTokensInputVisible}
            />

            {isTokenLoading ? (
              <AggregatedLoadingList />
            ) : (
              <>
                <ListTokens allTokens={allTokensToShow} searchQuery={searchQuery} />

                {evmStatus !== 'success' ? <AggregatedLoadingList className='mb-3' /> : null}
                {activeChain === 'secret' && snip20TokensStatus !== 'success' && snip20Enabled ? (
                  <AggregatedLoadingList className='mb-3' />
                ) : null}
              </>
            )}
          </section>
        )}
      </>
    )
  },
)
