import {
  removeTrailingSlash,
  TxResponse,
  useActiveChain,
  useAddress,
  useGetChains,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { AggregatedLoadingCard } from 'components/aggregated'
import React, { useMemo } from 'react'

import { reduceActivityInSections } from '../utils'
import { CheckMoreLink } from './check-more-link'
import { ActivityCard, ErrorActivityView, NoActivityView, SelectedTx } from './index'

export const ActivityList = (props: {
  txResponse: TxResponse
  setSelectedTx: (tx: SelectedTx) => void
}) => {
  const { txResponse, setSelectedTx } = props
  const chains = useGetChains()
  const selectedChain = useActiveChain()
  const activeNetwork = useSelectedNetwork()

  const address = useAddress(selectedChain)
  const { activity } = txResponse ?? {}

  const accountExplorerLink = useMemo(() => {
    if (chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl) {
      const accountUrl = chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl

      if (accountUrl?.includes('PLACEHOLDER_FOR_WALLET_ADDRESS')) {
        return (
          removeTrailingSlash(
            (accountUrl ?? '').replace('PLACEHOLDER_FOR_WALLET_ADDRESS', address),
          ) ?? ''
        )
      }

      return `${removeTrailingSlash(
        chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl ?? '',
      )}/${address}`
    }

    return ''
  }, [activeNetwork, address, chains, selectedChain])

  const sections = useMemo(() => {
    const txsByDate = activity?.reduce(reduceActivityInSections, {})
    return Object.entries(txsByDate ?? {}).map((entry) => ({ title: entry[0], data: entry[1] }))
  }, [activity])

  if (activity?.length === 0 && !txResponse?.loading) {
    return <NoActivityView accountExplorerLink={accountExplorerLink} />
  }

  if (txResponse?.error) {
    return <ErrorActivityView accountExplorerLink={accountExplorerLink} />
  }

  return (
    <div className='flex flex-col flex-1 w-full gap-6 px-6 pb-6 pt-8 mb-20 overflow-auto'>
      {txResponse?.loading ? (
        <div className='flex flex-col gap-3'>
          <span className='text-sm text-muted-foreground font-bold'>Today</span>
          <AggregatedLoadingCard className='mt-1' />
          <AggregatedLoadingCard />
          <AggregatedLoadingCard />
          <AggregatedLoadingCard />
        </div>
      ) : null}

      {!txResponse?.loading &&
        sections &&
        sections.map(({ data, title }, index) => {
          return (
            <div key={`${title}_${index}`} className='flex flex-col gap-3'>
              <span className='text-sm text-muted-foreground font-bold mb-1'>{title}</span>

              {data.map((tx) => (
                <ActivityCard
                  key={tx.parsedTx.txHash}
                  content={tx.content}
                  isSuccessful={tx.parsedTx.code === 0}
                  forceChain={selectedChain}
                  imgSize='md'
                  onClick={() => setSelectedTx(tx)}
                />
              ))}
            </div>
          )
        })}

      {!txResponse?.loading && accountExplorerLink ? (
        <CheckMoreLink href={accountExplorerLink} />
      ) : null}
    </div>
  )
}
