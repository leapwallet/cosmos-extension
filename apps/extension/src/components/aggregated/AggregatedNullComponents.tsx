/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActiveWallet, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedChainsStore } from '@leapwallet/cosmos-wallet-store'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { ManageChainSettings } from 'stores/manage-chains-store'
import { manageChainsStore } from 'stores/manage-chains-store'
import { getLedgerEnabledEvmChainsIds } from 'utils/getLedgerEnabledEvmChains'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

type AggregatedNullComponentsProps = {
  setAggregatedStore: any
  aggregatedChainsStore: AggregatedChainsStore
  render: ({
    key,
    chain,
    setAggregatedStore,
  }: {
    key: string
    chain: SupportedChain
    setAggregatedStore: any
  }) => JSX.Element
}

export const AggregatedNullComponents = observer(function ({
  setAggregatedStore,
  aggregatedChainsStore,
  render,
}: AggregatedNullComponentsProps) {
  const chains = useGetChains()
  const aggregatedChains = aggregatedChainsStore.aggregatedChainsData as SupportedChain[]
  const activeWallet = useActiveWallet()

  const ledgerEnabledEvmChainsIds = useMemo(() => {
    return getLedgerEnabledEvmChainsIds(Object.values(chains))
  }, [chains])

  const chainsToFetch = useMemo(() => {
    return aggregatedChains.reduce((acc: ManageChainSettings[], chain) => {
      const chainInfo = chains[chain]
      const noAddress = !activeWallet?.addresses[chain]

      // If `connectEVMLedger` check is true, then we will skip the chain
      if (
        noAddress &&
        activeWallet?.walletType === WALLETTYPE.LEDGER &&
        ledgerEnabledEvmChainsIds.includes(chainInfo?.chainId)
      ) {
        return acc
      }

      // If `ledgerNotSupported` check is true, then we will skip the chain
      if (
        noAddress &&
        activeWallet?.walletType === WALLETTYPE.LEDGER &&
        !ledgerEnabledEvmChainsIds.includes(chainInfo?.chainId)
      ) {
        return acc
      }

      // If no address, chain is testnet or apiStatus is false, then we will skip the chain
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
    }, [])
  }, [
    activeWallet?.addresses,
    activeWallet?.walletType,
    aggregatedChains,
    chains,
    ledgerEnabledEvmChainsIds,
    manageChainsStore.chains,
  ])

  return (
    <>
      {chainsToFetch.map((chain) =>
        render({
          key: chain.chainName,
          chain: chain.chainName,
          setAggregatedStore,
        }),
      )}
    </>
  )
})

AggregatedNullComponents.displayName = 'AggregatedNullComponents'
