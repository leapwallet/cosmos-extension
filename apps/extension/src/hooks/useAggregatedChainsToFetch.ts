import { useActiveWallet, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedChainsStore } from '@leapwallet/cosmos-wallet-store'
import { useMemo } from 'react'
import { ManageChainSettings, ManageChainsStore } from 'stores/manage-chains-store'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

export const useAggregatedChainsToFetch = (
  aggregatedChainsStore: AggregatedChainsStore,
  manageChainsStore: ManageChainsStore,
) => {
  const chains = useGetChains()
  const activeWallet = useActiveWallet()

  const chainsToFetch = useMemo(() => {
    return (aggregatedChainsStore.aggregatedChainsData as SupportedChain[]).reduce(
      (acc: ManageChainSettings[], chain) => {
        const chainInfo = chains[chain]
        const noAddress = !activeWallet?.addresses[chain]

        // If no address or chain is testnet or apiStatus is false, then we will skip the chain
        if (
          noAddress ||
          chainInfo?.chainId === chainInfo?.testnetChainId ||
          chainInfo?.apiStatus === false
        ) {
          return acc
        }

        // If `disabled` check is true, then we will skip the chain
        if (
          activeWallet?.walletType === WALLETTYPE.LEDGER &&
          !isLedgerEnabled(chain, chainInfo?.bip44?.coinType, Object.values(chains))
        ) {
          return acc
        }

        // If managed chain is not active, skip fetching the chain
        const managedChain = manageChainsStore.chains.find(
          (managedChain) => managedChain.chainName === chain,
        )
        if (managedChain && managedChain.active) {
          return [...acc, managedChain]
        }

        return acc
      },
      [],
    )
  }, [
    activeWallet?.addresses,
    activeWallet?.walletType,
    aggregatedChainsStore.aggregatedChainsData,
    manageChainsStore.chains,
    chains,
  ])

  return chainsToFetch
}
