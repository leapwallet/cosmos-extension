import {
  daysLeft,
  SelectedNetwork,
  sliceWord,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  SupportedChain,
  UnbondingDelegation,
  UnbondingDelegationEntry,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import currency from 'currency.js'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import { timeLeft } from 'utils/timeLeft'

import ReviewCancelUnstakeTx from './ReviewCancelUnstakeTx'

interface UnstakedValidatorDetailsProps {
  isOpen: boolean
  onClose: () => void
  validator: Validator
  unbondingDelegation?: UnbondingDelegation
  unbondingDelegationEntry?: UnbondingDelegationEntry
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const UnstakedValidatorDetails = observer(
  ({
    isOpen,
    onClose,
    validator,
    unbondingDelegation,
    unbondingDelegationEntry,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    rootBalanceStore,
    forceChain,
    forceNetwork,
  }: UnstakedValidatorDetailsProps) => {
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const denoms = rootDenomsStore.allDenoms
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
    const [formatCurrency] = useFormatCurrency()
    const { theme } = useTheme()
    const [showReviewCancelUnstakeTx, setShowReviewCancelUnstakeTx] = useState(false)
    const { network } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )
    const aprs = network?.validatorAprs
    const { data: imageUrl } = useValidatorImage(validator)

    const amountTitleText = useMemo(() => {
      if (new BigNumber(unbondingDelegationEntry?.currencyBalance ?? '').gt(0)) {
        return hideAssetsStore.formatHideBalance(
          formatCurrency(new BigNumber(unbondingDelegationEntry?.currencyBalance ?? '')),
        )
      } else {
        return hideAssetsStore.formatHideBalance(unbondingDelegationEntry?.formattedBalance ?? '')
      }
    }, [
      formatCurrency,
      unbondingDelegationEntry?.currencyBalance,
      unbondingDelegationEntry?.formattedBalance,
    ])

    const amountSubtitleText = useMemo(() => {
      if (new BigNumber(unbondingDelegationEntry?.currencyBalance ?? '').gt(0)) {
        return hideAssetsStore.formatHideBalance(unbondingDelegationEntry?.formattedBalance ?? '')
      }
      return ''
    }, [unbondingDelegationEntry?.currencyBalance, unbondingDelegationEntry?.formattedBalance])

    const isCancelledScheduled = unbondingDelegation && unbondingDelegationEntry

    return (
      <>
        <BottomModal isOpen={isOpen} onClose={onClose} title='Validator Details' className='p-6'>
          <div className='flex flex-col w-full gap-y-4'>
            <div className='flex w-full gap-x-2 items-center'>
              <img
                width={24}
                height={24}
                className='rounded-full'
                src={imageUrl ?? validator?.image ?? Images.Misc.Validator}
                onError={imgOnError(Images.Misc.Validator)}
              />

              <Text size='lg' color='text-black-100 dark:text-white-100' className='font-bold'>
                {sliceWord(
                  validator.moniker,
                  isSidePanel()
                    ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                    : 10,
                  3,
                )}
              </Text>
            </div>

            <div className='flex w-full rounded-lg p-3 bg-white-100 dark:bg-gray-950 border  border-gray-100 dark:border-gray-850'>
              <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
                <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                  Total Staked
                </Text>

                <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                  {currency(
                    validator?.delegations?.total_tokens_display ?? validator.tokens ?? '',
                    {
                      symbol: '',
                      precision: 0,
                    },
                  ).format()}
                </Text>
              </div>

              <div className='w-px h-10 bg-gray-200 dark:bg-gray-850' />
              <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
                <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                  Commission
                </Text>

                <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                  {validator.commission?.commission_rates.rate
                    ? `${new BigNumber(validator.commission.commission_rates.rate)
                        .multipliedBy(100)
                        .toFixed(0)}%`
                    : 'N/A'}
                </Text>
              </div>

              <div className='w-px h-10 bg-gray-200 dark:bg-gray-850' />
              <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
                <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                  APR
                </Text>

                <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                  {aprs &&
                    (aprs[validator?.address]
                      ? `${currency(aprs[validator?.address] * 100, {
                          precision: 2,
                          symbol: '',
                        }).format()}%`
                      : 'N/A')}
                </Text>
              </div>
            </div>

            <Text size='xs' color='text-gray-800 dark:text-gray-200' className='font-medium'>
              Pending Unstake
            </Text>

            <div className='flex gap-x-4 w-full p-4 bg-white-100 dark:bg-gray-950 rounded-lg'>
              <TokenImageWithFallback
                assetImg={activeStakingDenom.icon}
                text={activeStakingDenom.coinDenom}
                altText={activeStakingDenom.coinDenom}
                imageClassName='w-9 h-9 rounded-full'
                containerClassName='w-9 h-9 bg-gray-100 dark:bg-gray-850'
                textClassName='text-[10px] !leading-[14px]'
              />
              <div className='flex flex-col justify-center'>
                <Text
                  color='text-black-100 dark:text-white-100'
                  size='sm'
                  className='font-bold mt-0.5'
                >
                  {amountTitleText}
                </Text>

                <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                  {amountSubtitleText}
                </Text>
              </div>

              <div className='ml-auto flex flex-col items-end'>
                <Text
                  color='text-black-100 dark:text-white-100'
                  size='sm'
                  className='font-bold mt-0.5'
                >
                  {timeLeft(unbondingDelegationEntry?.completion_time ?? '')}
                </Text>

                <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                  {unbondingDelegationEntry?.completion_time &&
                    daysLeft(unbondingDelegationEntry?.completion_time)}
                </Text>
              </div>
            </div>

            {!isCancelledScheduled && (
              <Buttons.Generic
                onClick={() => {
                  setShowReviewCancelUnstakeTx(true)
                  onClose()
                }}
                className='w-full'
                size='normal'
                color={theme === ThemeName.DARK ? Colors.white100 : Colors.black100}
              >
                <Text color='text-white-100 dark:text-black-100'>Cancel Unstake</Text>
              </Buttons.Generic>
            )}
          </div>
        </BottomModal>

        <ReviewCancelUnstakeTx
          isOpen={showReviewCancelUnstakeTx}
          onClose={() => setShowReviewCancelUnstakeTx(false)}
          unbondingDelegationEntry={unbondingDelegationEntry}
          validator={validator}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
        />
      </>
    )
  },
)

export default UnstakedValidatorDetails
