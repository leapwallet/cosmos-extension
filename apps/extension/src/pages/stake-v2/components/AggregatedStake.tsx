import { PerChainDelegations, sliceSearchWord, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  AggregateStakeStore,
  ChainTagsStore,
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { CaretDown, CaretUp, X } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import { AggregatedLoadingList } from 'components/aggregated'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/ui/input/search-input'
import currency from 'currency.js'
import { decodeChainIdToChain } from 'extension-scripts/utils'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import useQuery from 'hooks/useQuery'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { StakeHeader } from '../stake-header'
import StakePage from '../StakePage'
import { AggregatedValues } from './AggregatedValues'
import { StakeTokenCard } from './StakeTokenCard'

const NETWORK = 'mainnet'
type DelegationsToConsider = PerChainDelegations & { chain: SupportedChain }

type AggregatedStakeProps = {
  aggregateStakeStore: AggregateStakeStore
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  rootBalanceStore: RootBalanceStore
  chainTagsStore: ChainTagsStore
}

export const AggregatedStake = observer(
  ({
    chainTagsStore,
    aggregateStakeStore,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    rootBalanceStore,
  }: AggregatedStakeProps) => {
    const {
      perChainDelegations,
      totalCurrencyAmountDelegation,
      averageApr,
      totalClaimRewardsAmount,
      isEveryChainLoading,
      isSomeChainLoading,
    } = aggregateStakeStore.aggregatedStake

    const [searchedText, setSearchedText] = useState('')
    const [showSearchInput, setShowSearchInput] = useState(false)
    const [formatCurrency] = useFormatCurrency()
    const chains = useGetChains()
    const [showAprInDescending, setShowAprInDescending] = useState(true)
    const [showAmountInDescending, setShowAmountInDescending] = useState(true)
    const [sortBy, setSortBy] = useState<'apr' | 'amount'>('amount')
    const selectedNetwork = useSelectedNetwork()

    const [selectedChain, setSelectedChain] = useState<SupportedChain | null>(null)

    const query = useQuery()
    const paramChainId = query.get('chainId') ?? undefined

    const averageAprValue = useMemo(() => {
      if (averageApr) {
        return `${currency((averageApr * 100).toString(), { precision: 2, symbol: '' }).format()}%`
      }

      return '-'
    }, [averageApr])

    const stakingDenomsPriority = ['ATOM', 'TIA', 'CORE', 'OSMO', 'INJ', 'BABY', 'NIBI', 'OM']

    const delegationsToConsider = useMemo(() => {
      const formattedSearchText = searchedText.trim().toLowerCase()

      const formattedDelegations = Object.keys(perChainDelegations)
        .reduce((acc: DelegationsToConsider[], chain) => {
          if (
            chain.toLowerCase().includes(formattedSearchText) ||
            perChainDelegations[chain].stakingDenom.toLowerCase().includes(formattedSearchText)
          ) {
            return [
              ...acc,
              {
                ...perChainDelegations[chain],
                chain: chain as SupportedChain,
              },
            ]
          }

          return acc
        }, [])
        .sort((a, b) => {
          const aIndex = stakingDenomsPriority.indexOf(a.stakingDenom)
          const bIndex = stakingDenomsPriority.indexOf(b.stakingDenom)
          return aIndex === -1 ? 1 : bIndex === -1 ? -1 : aIndex - bIndex
        })

      switch (sortBy) {
        case 'apr': {
          return formattedDelegations.sort((itemA, itemB) => {
            if (showAprInDescending) {
              return itemB.apr - itemA.apr
            }

            return itemA.apr - itemB.apr
          })
        }

        case 'amount': {
          return formattedDelegations.sort((itemA, itemB) => {
            const isAValid =
              itemA.currencyAmountDelegation && !isNaN(Number(itemA.currencyAmountDelegation))
            const isBValid =
              itemB.currencyAmountDelegation && !isNaN(Number(itemB.currencyAmountDelegation))

            if (!isBValid) {
              if (isAValid) {
                return showAmountInDescending ? -1 : 1
              }

              const aDelegation: undefined | BigNumber = itemA.totalDelegation
              const bDelegation: undefined | BigNumber = itemB.totalDelegation

              if (!bDelegation || bDelegation.isNaN() || bDelegation.isZero()) {
                if (!(!aDelegation || aDelegation.isNaN() || aDelegation.isZero())) {
                  return showAmountInDescending ? -1 : 1
                }

                return showAmountInDescending ? 1 : -1
              }

              if (!aDelegation || aDelegation.isNaN() || aDelegation.isZero()) {
                return showAmountInDescending ? 1 : -1
              }

              if (showAmountInDescending) {
                return bDelegation.minus(aDelegation).toNumber()
              }

              return itemA.totalDelegation.minus(itemB.totalDelegation).toNumber()
            }

            if (!isAValid) {
              return showAmountInDescending ? 1 : -1
            }

            if (showAmountInDescending) {
              return Number(itemB.currencyAmountDelegation) - Number(itemA.currencyAmountDelegation)
            }

            return Number(itemA.currencyAmountDelegation) - Number(itemB.currencyAmountDelegation)
          })
        }
      }
    }, [perChainDelegations, searchedText, showAmountInDescending, showAprInDescending, sortBy])

    const handleTokenCardClick = useCallback(
      (chain: SupportedChain) => {
        setSelectedChain(chain)
        if (
          (validatorsStore.validatorsForChain(chain).validatorData?.validators ?? []).length === 0
        ) {
          validatorsStore.loadValidators(chain, selectedNetwork)
        }
      },
      [selectedNetwork, validatorsStore],
    )

    const handleBackClick = useCallback(() => setSelectedChain(null), [])

    useEffect(() => {
      async function updateChain() {
        if (paramChainId) {
          const chainIdToChain = await decodeChainIdToChain()
          const chain = chainIdToChain[paramChainId] as SupportedChain
          setSelectedChain(chain)
          query.delete('chainId')
        }
      }
      updateChain()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramChainId])

    if (selectedChain) {
      return (
        <StakePage
          forceChain={selectedChain}
          forceNetwork={NETWORK}
          showBackAction={true}
          onBackClick={handleBackClick}
          rootDenomsStore={rootDenomsStore}
          delegationsStore={delegationsStore}
          validatorsStore={validatorsStore}
          unDelegationsStore={unDelegationsStore}
          claimRewardsStore={claimRewardsStore}
          rootBalanceStore={rootBalanceStore}
          chainTagsStore={chainTagsStore}
        />
      )
    }

    return (
      <>
        <StakeHeader setShowSearchInput={setShowSearchInput} />
        <div className='flex flex-col pt-6 px-6 w-full h-full overflow-y-scroll bg-secondary-50'>
          {showSearchInput ? (
            <div className='flex gap-4 items-center mb-6'>
              <SearchInput
                value={searchedText}
                placeholder='Search staked tokens'
                onChange={(e) => setSearchedText(e.target.value)}
                onClear={() => setSearchedText('')}
              />
              <X
                size={24}
                className='text-muted-foreground  cursor-pointer p-3.5 h-auto w-12 rounded-full bg-secondary-100 hover:bg-secondary-200'
                onClick={() => {
                  setShowSearchInput(false)
                  setSearchedText('')
                }}
              />
            </div>
          ) : (
            <div className='bg-white-100 dark:bg-gray-950 border-[1px] border-solid border-gray-200 dark:border-gray-850 rounded-xl flex p-3 mb-6'>
              <AggregatedValues
                label='Staked'
                value={formatCurrency(totalCurrencyAmountDelegation)}
                className='border-r-[1px] border-solid border-gray-200 dark:border-gray-850'
              />
              <AggregatedValues
                label='Claimable'
                value={formatCurrency(totalClaimRewardsAmount)}
                className='border-r-[1px] border-solid border-gray-200 dark:border-gray-850'
              />
              <AggregatedValues label='Avg APR' value={averageAprValue} />
            </div>
          )}

          {delegationsToConsider.length > 0 && (
            <p className='text-gray-800 dark:text-gray-200 text-[12px] text-[500] flex items-center justify-between mb-2 px-[12px]'>
              <span className='block w-[150px]'>Tokens</span>

              <button
                className='flex items-center justify-between gap-1'
                onClick={() => {
                  setShowAprInDescending(!showAprInDescending)
                  setSortBy('apr')
                }}
              >
                APR
                {sortBy === 'apr' && (
                  <>
                    {showAprInDescending ? (
                      <CaretDown size={16} className='text-black-100 dark:text-white-100' />
                    ) : (
                      <CaretUp size={16} className='text-black-100 dark:text-white-100' />
                    )}
                  </>
                )}
              </button>

              <button
                className='w-[90px] text-right flex items-center justify-end gap-1'
                onClick={() => {
                  setShowAmountInDescending(!showAmountInDescending)
                  setSortBy('amount')
                }}
              >
                Amount
                {sortBy === 'amount' && (
                  <>
                    {showAmountInDescending ? (
                      <CaretDown size={16} className='text-black-100 dark:text-white-100' />
                    ) : (
                      <CaretUp size={16} className='text-black-100 dark:text-white-100' />
                    )}
                  </>
                )}
              </button>
            </p>
          )}

          <div className='h-full w-full overflow-y-scroll'>
            <div className='flex flex-col gap-3 pb-6'>
              {isEveryChainLoading ? <AggregatedLoadingList /> : null}

              {!isEveryChainLoading ? (
                delegationsToConsider.length > 0 ? (
                  <>
                    {delegationsToConsider.map((delegation) => {
                      const {
                        totalDelegationAmount,
                        currencyAmountDelegation,
                        stakingDenom,
                        apr,
                        chain,
                      } = delegation

                      const aprValue = apr
                        ? `${currency((apr * 100).toString(), {
                            precision: 2,
                            symbol: '',
                          }).format()} %`
                        : '-'

                      return (
                        <StakeTokenCard
                          key={chain}
                          tokenName={stakingDenom}
                          chainName={chains[chain as SupportedChain].chainName}
                          chainLogo={chains[chain as SupportedChain].chainSymbolImageUrl ?? ''}
                          apr={aprValue}
                          dollarAmount={formatCurrency(new BigNumber(currencyAmountDelegation))}
                          amount={totalDelegationAmount}
                          onClick={() => handleTokenCardClick(chain)}
                        />
                      )
                    })}
                  </>
                ) : (
                  <EmptyCard
                    isRounded
                    subHeading='Please try again with something else'
                    heading={'No results for “' + sliceSearchWord(searchedText) + '”'}
                    src={Images.Misc.Explore}
                    classname='dark:!bg-gray-950'
                    imgContainerClassname='dark:!bg-gray-900'
                  />
                )
              ) : null}
              {isSomeChainLoading && !showSearchInput ? <AggregatedLoadingList /> : null}
            </div>
          </div>
        </div>
      </>
    )
  },
)
