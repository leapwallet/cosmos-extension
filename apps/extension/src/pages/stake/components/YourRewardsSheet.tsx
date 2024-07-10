import {
  formatTokenAmount,
  sliceWord,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { Amount, Reward, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, CardDivider, GenericCard } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'

import { ReviewClaimRewardsTx, StakeRewardCard } from './index'

export type YourRewardsSheetProps = {
  isOpen: boolean
  onClose: VoidFunction
  validator?: Validator
  reward?: Reward
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

export function YourRewardsSheet({
  isOpen,
  onClose,
  validator,
  reward,
  forceChain,
  forceNetwork,
}: YourRewardsSheetProps) {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain])

  const _activeNetwork = useSelectedNetwork()
  const activeNetwork = useMemo(
    () => forceNetwork || _activeNetwork,
    [forceNetwork, _activeNetwork],
  )

  const [formatCurrency] = useFormatCurrency()
  const [activeStakingDenom] = useActiveStakingDenom(activeChain, activeNetwork)
  const activeDenom = useMemo(() => activeStakingDenom.coinDenom, [activeStakingDenom.coinDenom])

  const { formatHideBalance } = useHideAssets()
  const defaultTokenLogo = useDefaultTokenLogo()
  const { rewards } = useStaking(activeChain, activeNetwork)
  const [showReviewTxSheet, setShowReviewTxSheet] = useState(false)

  const rewardTokens = useMemo(() => {
    if (reward?.reward) {
      return reward.reward
    }

    return rewards?.total
  }, [reward?.reward, rewards?.total])

  const tokensToShow = useMemo(() => {
    const nativeToken = rewardTokens?.find(
      (token) => token.tokenInfo && token.tokenInfo.coinDenom === activeDenom,
    )
    const sortedRewardTokens = [...(rewardTokens ?? [])].sort(
      (tokenA, tokenB) => parseFloat(tokenB.amount) - parseFloat(tokenA.amount),
    )

    let otherTokens = []
    let _tokensToShow: Amount[] = []

    if (rewardTokens && rewardTokens.length > 3) {
      let count = 0

      otherTokens = sortedRewardTokens.filter((token) => {
        const denom = token.tokenInfo?.coinDenom ?? token.denom
        if (denom === activeDenom) return false
        if (count === 2) return false

        if (denom) {
          count += 1
          return true
        }
        return false
      })
    } else {
      otherTokens = sortedRewardTokens.filter(
        (token) => (token.tokenInfo?.coinDenom ?? token.denom) !== activeDenom,
      )
    }

    if (nativeToken) _tokensToShow = [nativeToken]
    return [..._tokensToShow, ...otherTokens]
  }, [rewardTokens, activeDenom])

  const { rewardsAmount, rewardsTokens: cardRewardsTokens } = useMemo(() => {
    let rewardsAmount = ''
    let rewardsTokens = ''

    if (rewardTokens) {
      if (rewardTokens.length > 3 && tokensToShow) {
        let count = 0

        rewardsAmount = rewardTokens
          .reduce((totalSum, token) => {
            const isInTokensToShow = tokensToShow.find(
              (_token) =>
                _token?.tokenInfo?.coinDenom === token.tokenInfo?.coinDenom ||
                _token.denom === token.denom,
            )
            if (isInTokensToShow) return totalSum

            if (count === 1) {
              rewardsTokens += `, ${token.tokenInfo?.coinDenom ?? sliceWord(token.denom, 4, 3)}`
              count += 1
            }

            if (count === 0) {
              rewardsTokens += token.tokenInfo?.coinDenom ?? sliceWord(token.denom, 4, 3)
              count += 1
            }

            return totalSum.plus(new BigNumber(token.currenyAmount ?? ''))
          }, new BigNumber('0'))
          .toString()
      }

      if (rewardTokens.length > 5) {
        rewardsTokens += ` & ${rewardTokens.length - 5} other${
          rewardTokens.length - 5 > 1 ? 's' : ''
        }`
      } else if (rewardTokens.length > 4) {
        rewardsTokens += ` & ${rewardTokens.length - 4} other${
          rewardTokens.length - 4 > 1 ? 's' : ''
        }`
      }
    }

    return { rewardsAmount, rewardsTokens }
  }, [rewardTokens, tokensToShow])

  return (
    <>
      {!showReviewTxSheet && (
        <BottomModal
          title='Total Rewards'
          isOpen={isOpen}
          closeOnBackdropClick={true}
          onClose={onClose}
          contentClassName='[&>div:first-child>div:last-child]:-mt-[2px]'
        >
          <div className='flex flex-col items-center h-full'>
            <div
              className='bg-white-100 dark:bg-gray-950 rounded-2xl max-h-[240px] w-fit mb-4'
              style={{ overflowY: 'scroll' }}
            >
              {tokensToShow &&
                tokensToShow.length &&
                tokensToShow.map((rewardToken, index, array) => {
                  const { amount, currenyAmount, tokenInfo, denom } = rewardToken
                  const isLast = index === array.length - 1
                  const title = tokenInfo?.coinDenom
                    ? sliceWord(tokenInfo.coinDenom, 4, 3)
                    : sliceWord(denom, 4, 3)

                  return (
                    <React.Fragment key={`${rewardToken.denom}-index`}>
                      <div className='py-2'>
                        <GenericCard
                          title={
                            <h3 className='text-md text-gray-600 dark:text-white-100 font-medium'>
                              {formatHideBalance(formatTokenAmount(amount, title, 3))}
                            </h3>
                          }
                          subtitle={
                            <p className='whitespace-nowrap text-gray-400 font-medium text-xs'>
                              {formatHideBalance(
                                currenyAmount
                                  ? formatCurrency(new BigNumber(currenyAmount ?? ''))
                                  : '-',
                              )}
                            </p>
                          }
                          img={
                            <img
                              src={tokenInfo?.icon ?? defaultTokenLogo}
                              className='w-[28px] h-[28px] mr-2 border rounded-full dark:border-[#333333] border-[#cccccc]'
                              onError={imgOnError(defaultTokenLogo)}
                            />
                          }
                          isRounded={isLast}
                          className='dark:!bg-gray-950'
                        />
                      </div>

                      {!isLast && (
                        <div className='[&>div]:dark:!bg-gray-950'>
                          <CardDivider />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
            </div>

            {rewardTokens && rewardTokens.length > 3 && (
              <StakeRewardCard
                isLoading={false}
                rewardsAmount={rewardsAmount ?? ''}
                rewardsTokens={cardRewardsTokens ?? ''}
                forceChain={activeChain}
              />
            )}

            <Buttons.Generic
              color={Colors.getChainColor(activeChain)}
              size='normal'
              className={classNames('w-[344px]', {
                'mt-4': rewardTokens && rewardTokens.length > 3,
              })}
              onClick={() => setShowReviewTxSheet(true)}
            >
              Claim All
            </Buttons.Generic>
          </div>
        </BottomModal>
      )}

      {isOpen && (
        <ReviewClaimRewardsTx
          isOpen={showReviewTxSheet}
          onClose={() => setShowReviewTxSheet(false)}
          validator={validator}
          reward={reward}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
        />
      )}
    </>
  )
}
