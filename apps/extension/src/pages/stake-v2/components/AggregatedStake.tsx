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
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { AggregatedLoading, AggregatedSearchComponent } from 'components/aggregated'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { EmptyCard } from 'components/empty-card'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import currency from 'currency.js'
import { useChainPageInfo } from 'hooks'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useMemo, useState } from 'react'
import { HeaderActionType } from 'types/components'

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
    const [showSideNav, setShowSideNav] = useState(false)
    const [showChainSelector, setShowChainSelector] = useState(false)

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

    const [selectedChain, setSelectedChain] = useState<SupportedChain | null>(null)
    const { headerChainImgSrc } = useChainPageInfo()
    const averageAprValue = useMemo(() => {
      if (averageApr) {
        return `${currency((averageApr * 100).toString(), { precision: 2, symbol: '' }).format()} %`
      }

      return '-'
    }, [averageApr])

    const delegationsToConsider = useMemo(() => {
      const formattedSearchText = searchedText.trim().toLowerCase()

      const formattedDelgations = Object.keys(perChainDelegations).reduce(
        (acc: DelegationsToConsider[], chain) => {
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
        },
        [],
      )

      switch (sortBy) {
        case 'apr': {
          return formattedDelgations.sort((itemA, itemB) => {
            if (showAprInDescending) {
              return itemB.apr - itemA.apr
            }

            return itemA.apr - itemB.apr
          })
        }

        case 'amount': {
          return formattedDelgations.sort((itemA, itemB) => {
            if (showAmountInDescending) {
              return Number(itemB.currencyAmountDelegation) - Number(itemA.currencyAmountDelegation)
            }

            return Number(itemA.currencyAmountDelegation) - Number(itemB.currencyAmountDelegation)
          })
        }
      }
    }, [perChainDelegations, searchedText, showAmountInDescending, showAprInDescending, sortBy])

    const handleOpenSelectChainSheet = useCallback(() => setShowChainSelector(true), [])
    const handleOpenSideNavSheet = useCallback(() => setShowSideNav(true), [])
    const handleTokenCardClick = useCallback((chain: SupportedChain) => setSelectedChain(chain), [])
    const handleBackClick = useCallback(() => setSelectedChain(null), [])

    return selectedChain ? (
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
    ) : (
      <div className='relative w-full overflow-clip panel-height'>
        <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />

        <PopupLayout
          header={
            <PageHeader
              title='Staking'
              imgSrc={headerChainImgSrc}
              onImgClick={handleOpenSelectChainSheet}
              action={{
                onClick: handleOpenSideNavSheet,
                type: HeaderActionType.NAVIGATION,
                className: 'min-w-[48px] h-[36px] px-2 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
              }}
            />
          }
        >
          <div className='flex flex-col pt-[16px] px-[24px] max-h-[calc(100%-156px)]'>
            {showSearchInput ? (
              <AggregatedSearchComponent
                handleClose={() => {
                  setShowSearchInput(false)
                  setSearchedText('')
                }}
                handleChange={(value) => setSearchedText(value)}
                value={searchedText}
                placeholder='Search staked tokens'
              />
            ) : (
              <>
                <h1 className='flex items-center justify-between text-black-100 dark:text-white-100'>
                  <span className='text-[24px] font-[700]'>Stake</span>

                  <button
                    className='bg-white-100 dark:bg-gray-950 w-[40px] h-[40px] rounded-full flex items-center justify-center'
                    onClick={() => setShowSearchInput(true)}
                  >
                    <img
                      src={Images.Misc.SearchWhiteIcon}
                      className='w-[24px] h-[24px] invert dark:invert-0'
                    />
                  </button>
                </h1>

                <div className='bg-white-100 dark:bg-gray-950 border-[1px] border-solid border-gray-200 dark:border-gray-850 rounded-xl flex p-3 mb-4 mt-5'>
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
              </>
            )}

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

            <div
              className={classNames('overflow-y-auto', {
                'max-h-[calc(100%-240px)]': showSearchInput,
                'max-h-[calc(100%-332px)]': !showSearchInput,
              })}
            >
              <div className='flex flex-col gap-3'>
                {isEveryChainLoading ? (
                  <>
                    <AggregatedLoading />
                    <AggregatedLoading />
                  </>
                ) : null}

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

                {isSomeChainLoading && !showSearchInput ? (
                  <div className='rounded-xl dark:bg-gray-950 bg-white-100'>
                    <AggregatedLoading />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </PopupLayout>

        <SelectChain
          chainTagsStore={chainTagsStore}
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
        />
        <BottomNav label={BottomNavLabel.Stake} />
      </div>
    )
  },
)
