import {
  daysLeft,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
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
import { useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import currency from 'currency.js'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { stakeEpochStore } from 'stores/epoch-store'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import { timeLeft } from 'utils/timeLeft'

import { StakeTxnSheet } from '../StakeTxnSheet'
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
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void
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
    setClaimTxMode,
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
    const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator)
    const imageUrl = validator?.image || validatorImage || Images.Misc.Validator

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

    const isCancelledScheduled =
      unbondingDelegation &&
      unbondingDelegationEntry &&
      stakeEpochStore.canceledUnBondingDelegationsMap[unbondingDelegation.validator_address]?.some(
        (ch) => ch === unbondingDelegationEntry.creation_height,
      )

    return (
      <>
        <BottomModal
          isOpen={isOpen}
          onClose={onClose}
          fullScreen
          title='Validator Details'
          className='!p-0 relative h-full'
          headerClassName='border-secondary-200 border-b'
        >
          <div className='p-6 pt-8 px-6 flex flex-col gap-4 h-[calc(100%-84px)] overflow-y-scroll'>
            <div className='flex w-full gap-4 items-center'>
              <img
                width={40}
                height={40}
                className='rounded-full'
                src={imageUrl}
                onError={imgOnError(Images.Misc.Validator)}
              />

              <span className='font-bold text-lg'>
                {sliceWord(
                  validator?.moniker ?? '',
                  isSidePanel()
                    ? 18 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                    : 10,
                  3,
                )}
              </span>
            </div>

            <div className='flex flex-col gap-4 p-6 bg-secondary-100 rounded-xl'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Total Staked</span>

                <span className='font-bold text-sm'>
                  {currency(
                    validator?.delegations?.total_tokens_display ?? validator?.tokens ?? '',
                    {
                      symbol: '',
                      precision: 0,
                    },
                  ).format()}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Commission</span>

                <span className='font-bold text-sm'>
                  {validator?.commission?.commission_rates?.rate
                    ? `${new BigNumber(validator?.commission?.commission_rates?.rate ?? '')
                        .multipliedBy(100)
                        .toFixed(0)}%`
                    : 'N/A'}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>APR</span>

                <span className='font-bold text-sm text-accent-success'>
                  {aprs &&
                    (aprs[validator?.address ?? '']
                      ? `${currency(aprs[validator?.address ?? ''] * 100, {
                          precision: 2,
                          symbol: '',
                        }).format()}%`
                      : 'N/A')}
                </span>
              </div>
            </div>

            <span className='text-sm text-muted-foreground mt-4'>Pending Unstake</span>
            <div className='p-6 bg-secondary-100 rounded-xl flex justify-between items-center'>
              <div className='flex flex-col items-start gap-y-0.5'>
                <span className='font-bold text-[18px] text-foreground'>{amountTitleText} </span>
                <span className='text-muted-foreground text-sm'>{amountSubtitleText}</span>
              </div>
              <div className='flex flex-col items-end gap-y-0.5'>
                <span className='font-bold text-[18px] text-foreground'>
                  {timeLeft(unbondingDelegationEntry?.completion_time ?? '')}
                </span>
                <span className='text-muted-foreground text-sm'>
                  {unbondingDelegationEntry?.completion_time &&
                    daysLeft(unbondingDelegationEntry?.completion_time)}
                </span>
              </div>
            </div>
          </div>

          {!isCancelledScheduled && (
            <div className='py-4 px-5 bg-secondary-200'>
              <Button
                onClick={() => {
                  setShowReviewCancelUnstakeTx(true)
                  onClose()
                }}
                className='w-full'
                variant='mono'
              >
                Cancel Unstake
              </Button>
            </div>
          )}
        </BottomModal>

        <ReviewCancelUnstakeTx
          isOpen={showReviewCancelUnstakeTx}
          onClose={() => setShowReviewCancelUnstakeTx(false)}
          unbondingDelegationEntry={unbondingDelegationEntry}
          validator={validator}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
          setClaimTxMode={setClaimTxMode}
        />
      </>
    )
  },
)

export default UnstakedValidatorDetails
