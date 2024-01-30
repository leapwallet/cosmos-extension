import {
  ActivityCardContent,
  ActivityType,
  removeTrailingSlash,
  TxResponse,
  useActiveChain,
  useAddress,
  useGetChains,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import type { ParsedTransaction } from '@leapwallet/parser-parfait'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/search-input'
import { PENDING_SWAP_TXS } from 'config/storage-keys'
import dayjs from 'dayjs'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { sliceSearchWord } from 'utils/strings'
import Browser from 'webextension-polyfill'

import TokenCardSkeleton from '../../components/Skeletons/TokenCardSkeleton'
import { SelectedTx } from './Activity'
import { ActivityCard } from './ActivityCard'

export type ActivityListProps = {
  txResponse: TxResponse
  setSelectedTx: React.Dispatch<React.SetStateAction<SelectedTx | null>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setShowSwapTxPageFor: React.Dispatch<any>
}

export function ActivityList({
  txResponse,
  setSelectedTx,
  setShowSwapTxPageFor,
}: ActivityListProps) {
  const chains = useGetChains()
  const selectedNetwork = useSelectedNetwork()
  const activeChain = useActiveChain()
  const activeAddress = useAddress()

  const [pendingSwapTxs, setPendingSwapTxs] = useState([])

  useEffect(() => {
    async function updatePendingSwapTxs() {
      const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])

      if (storage[PENDING_SWAP_TXS]) {
        const pendingTxs = JSON.parse(storage[PENDING_SWAP_TXS])
        setPendingSwapTxs(pendingTxs)
      } else {
        setPendingSwapTxs([])
      }
    }

    updatePendingSwapTxs()

    Browser.storage.onChanged.addListener((storage) => {
      if (storage[PENDING_SWAP_TXS]) {
        updatePendingSwapTxs()
      }
    })

    return Browser.storage.onChanged.removeListener((storage) => {
      if (storage[PENDING_SWAP_TXS]) {
        updatePendingSwapTxs()
      }
    })
  }, [])

  const { activity } = txResponse
  const [assetFilter, setAssetFilter] = useState<string>('')
  const explorerAccountLink = chains[activeChain].txExplorer?.[selectedNetwork]?.accountUrl
    ? `${removeTrailingSlash(
        chains[activeChain].txExplorer?.[selectedNetwork]?.accountUrl ?? '',
      )}/${activeAddress}`
    : ''

  const handleFilterChange = (event: React.FormEvent<HTMLInputElement>) => {
    setAssetFilter(event.currentTarget.value.toLowerCase())
  }

  const sections = useMemo(() => {
    const txsByDate = activity
      ?.filter((tx) => {
        return tx.content.title1.toLowerCase().includes(assetFilter)
      })
      .reduce(
        (
          acc: Record<string, { parsedTx: ParsedTransaction; content: ActivityCardContent }[]>,
          tx,
        ) => {
          if (!tx.parsedTx) return acc

          const date = dayjs(tx.parsedTx.timestamp).format('MMMM DD')
          if (acc[date]) {
            acc[date].push(tx)
          } else {
            acc = { ...acc, [date]: [tx] }
          }
          return acc
        },
        {},
      )
    return Object.entries(txsByDate ?? {}).map((entry) => ({ title: entry[0], data: entry[1] }))
  }, [activity, assetFilter])

  if (activity?.length === 0 && !txResponse.loading) {
    return (
      <div className='flex flex-col h-[350px]'>
        <EmptyCard
          src={Images.Activity.ActivityIcon}
          heading='No activity'
          subHeading='Your activity will appear here'
        />

        {explorerAccountLink ? (
          <a
            href={explorerAccountLink}
            target='_blank'
            className='font-semibold text-base mt-4 text-center'
            style={{ color: Colors.getChainColor(activeChain) }}
            rel='noreferrer'
          >
            Check on Explorer
          </a>
        ) : null}
      </div>
    )
  }

  if (txResponse.error) {
    return (
      <div className='flex flex-col h-[350px]'>
        <EmptyCard src={Images.Activity.ActivityIcon} heading='Unable to fetch activity' />

        {explorerAccountLink ? (
          <a
            href={explorerAccountLink}
            target='_blank'
            className='font-semibold text-base mt-4 text-center'
            style={{ color: Colors.getChainColor(activeChain) }}
            rel='noreferrer'
          >
            Check on Explorer
          </a>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <SearchInput
        placeholder='Search activity...'
        onChange={handleFilterChange}
        value={assetFilter}
        onClear={() => setAssetFilter('')}
        inputDisabled={txResponse.loading}
      />

      {pendingSwapTxs.length > 0 ? (
        <div className='my-7'>
          <div className='font-bold text-sm text-gray-600 dark:text-gray-200 mb-2'>
            Pending Swap Transactions
          </div>
          <div className='rounded-2xl overflow-hidden bg-white-100 dark:bg-gray-900'>
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              pendingSwapTxs.map((swapTx: any, index: number) => {
                const content = {
                  txType: 'swap' as ActivityType,
                  title1: `${swapTx.sourceToken.symbol} → ${swapTx.destinationToken.symbol}`,
                  subtitle1: 'Swap in progress',
                  img: swapTx.sourceToken.img,
                  secondaryImg: swapTx.destinationToken.img,
                  sentAmount: swapTx.inAmount,
                  receivedAmount: swapTx.amountOut,
                  sentTokenInfo: { coinDenom: swapTx.sourceToken.symbol },
                  receivedTokenInfo: { coinDenom: swapTx.destinationToken.symbol },
                } as ActivityCardContent

                return (
                  <React.Fragment key={`${swapTx.inAmount}-${index}`}>
                    {index !== 0 && <CardDivider />}

                    <ActivityCard
                      showLoader
                      content={content}
                      onClick={() => setShowSwapTxPageFor(swapTx)}
                      isSuccessful={true}
                    />
                  </React.Fragment>
                )
              })
            }
          </div>
        </div>
      ) : null}

      <div className='pb-24'>
        {txResponse.loading && (
          <div className='rounded-2xl dark:bg-gray-900 bg-white-100'>
            <TokenCardSkeleton />
            <TokenCardSkeleton />
          </div>
        )}

        {!txResponse.loading && sections.length === 0 && (
          <EmptyCard
            isRounded
            subHeading='Please try again with something else'
            heading={'No results for “' + sliceSearchWord(assetFilter) + '”'}
            src={Images.Misc.FlashOn}
          />
        )}

        {!txResponse.loading &&
          sections.map(({ data, title }, index) => {
            return (
              <div className='mt-7' key={`${title}_${index}`} id='activity-list'>
                <div className='font-bold text-sm text-gray-600 dark:text-gray-200 mb-2'>
                  {title}
                </div>
                <div className='rounded-2xl overflow-hidden bg-white-100 dark:bg-gray-900'>
                  {data.map((tx, index) => (
                    <React.Fragment key={tx.parsedTx.txHash}>
                      {index !== 0 && <CardDivider />}
                      <ActivityCard
                        content={tx.content}
                        onClick={() => setSelectedTx(tx)}
                        isSuccessful={tx.parsedTx.code === 0}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )
          })}

        {!txResponse.loading && explorerAccountLink ? (
          <a
            href={explorerAccountLink}
            target='_blank'
            className='font-semibold text-base mt-4 text-center block'
            style={{ color: Colors.getChainColor(activeChain) }}
            rel='noreferrer'
          >
            Check more on Explorer
          </a>
        ) : null}
      </div>
    </div>
  )
}
