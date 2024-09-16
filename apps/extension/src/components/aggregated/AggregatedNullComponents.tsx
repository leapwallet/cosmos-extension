/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useActiveWallet,
  useAggregatedChainsList,
  useGetChains,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ManageChainSettings, useManageChainData } from 'hooks/settings/useManageChains'
import React, { useMemo } from 'react'
import { getLedgerEnabledEvmChainsIds } from 'utils/getLedgerEnabledEvmChains'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

type AggregatedNullComponentsProps = {
  setAggregatedStore: any
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

export const AggregatedNullComponents = React.memo(function ({
  setAggregatedStore,
  render,
}: AggregatedNullComponentsProps) {
  const [managedChains] = useManageChainData()
  const chains = useGetChains()
  const aggregatedChains = useAggregatedChainsList()
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
      const managedChain = managedChains.find((managedChain) => managedChain.chainName === chain)
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
    managedChains,
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
