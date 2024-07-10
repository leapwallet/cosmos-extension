import {
  PerChainDelegations,
  sliceSearchWord,
  useAggregatedStake,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
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
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useMemo, useState } from 'react'
import { HeaderActionType } from 'types/components'

import {
  AggregatedStakeNullComponents,
  AggregatedValues,
  GeneralStake,
  StakeTokenCard,
} from './index'

const NETWORK = 'mainnet'
type DelegationsToConsider = PerChainDelegations & { chain: SupportedChain }

export function AggregatedStake() {
  const [showSideNav, setShowSideNav] = useState(false)
  const [showChainSelector, setShowChainSelector] = useState(false)
  const {
    perChainDelegations,
    totalCurrencyAmountDelegation,
    averageApr,
    totalClaimRewardsAmount,
    isEveryChainLoading,
    isSomeChainLoading,
  } = useAggregatedStake()

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

    return formattedDelgations
  }, [perChainDelegations, searchedText, showAmountInDescending, showAprInDescending, sortBy])

  const handleOpenSelectChainSheet = useCallback(() => setShowChainSelector(true), [])
  const handleOpenSideNavSheet = useCallback(() => setShowSideNav(true), [])
  const handleTokenCardClick = useCallback((chain: SupportedChain) => setSelectedChain(chain), [])
  const handleBackClick = useCallback(() => setSelectedChain(null), [])

  return selectedChain ? (
    <GeneralStake
      forceChain={selectedChain}
      forceNetwork={NETWORK}
      showBackAction={true}
      onBackClick={handleBackClick}
    />
  ) : (
    <div className='relative w-[400px] overflow-clip'>
      <AggregatedStakeNullComponents />
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
              className: 'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
            }}
          />
        }
      >
        <div className='flex flex-col pt-[16px] px-[24px]'>
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
                <div className='material-icons-round !text-[16px] text-black-100 dark:text-white-100'>
                  {showAprInDescending ? 'expand_more' : 'expand_less'}
                </div>
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
                <div className='material-icons-round !text-[16px] text-black-100 dark:text-white-100'>
                  {showAmountInDescending ? 'expand_more' : 'expand_less'}
                </div>
              )}
            </button>
          </p>

          <div
            className={classNames('overflow-y-auto', {
              'max-h-[360px]': showSearchInput,
              'max-h-[268px]': !showSearchInput,
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

      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <BottomNav label={BottomNavLabel.Stake} />
    </div>
  )
}
