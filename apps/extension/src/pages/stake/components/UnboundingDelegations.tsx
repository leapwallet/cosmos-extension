import {
  sliceWord,
  useGetTokenSpendableBalances,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain, UnbondingDelegation, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, GenericCard } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import { Images } from 'images'
import React, { useEffect } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { imgOnError } from 'utils/imgOnError'
import { timeLeft } from 'utils/timeLeft'

import { CancleUndelegationProps } from '../CancelUndelegation'

type UnboundingDelegationsProps = {
  isLoading: boolean
  onWhyPending: () => void
  validators: Record<string, Validator>
  unboundingDelegations: Record<string, UnbondingDelegation>
  formatHideBalance: (s: string) => React.ReactNode
  isCancleUnstakeSupported: boolean
  activeChain: SupportedChain
  activeNetwork: SelectedNetwork
}

const UnboundingDelegations = React.memo(
  ({
    unboundingDelegations,
    validators,
    isLoading,
    onWhyPending,
    formatHideBalance,
    isCancleUnstakeSupported,
    activeChain,
    activeNetwork,
  }: UnboundingDelegationsProps) => {
    const navigate = useNavigate()
    const { refetchBalances } = useGetTokenSpendableBalances(activeChain, activeNetwork)

    // refetch balances
    useEffect(() => {
      refetchBalances()
    }, [])

    if (!isLoading && (Object.values(unboundingDelegations ?? {}).length === 0 || !validators)) {
      return <></>
    }

    return (
      <div className='dark:bg-gray-950 rounded-2xl bg-white-100 pt-4'>
        {isLoading && (
          <div className='w-[312px] p-4'>
            <Skeleton count={3} />
          </div>
        )}

        {!isLoading && Object.values(unboundingDelegations).length !== 0 && validators && (
          <div className='flex justify-between'>
            <Text
              size='xs'
              color='dark:text-gray-400 text-gray-600'
              className='font-bold py-1 px-4'
            >
              Pending Unstakes
            </Text>

            <div className='px-4'>
              <div
                className={
                  'flex justify-center text-xs text-gray-600 dark:text-gray-400 items-center cursor-pointer'
                }
                onClick={onWhyPending}
              >
                <span className='mr-1 text-lg material-icons-round'>info</span>
                <span className='text-xs font-semibold'>Why pending?</span>
              </div>
            </div>
          </div>
        )}

        {!isLoading &&
          unboundingDelegations &&
          validators &&
          Object.values(unboundingDelegations).map((ud, index) => {
            const validator = validators[ud?.validator_address]
            const frags = ud?.entries?.map((d, idx) => {
              const timeLeftText = timeLeft(d.completion_time)

              const Component = () => {
                const { data: keybaseImageUrl } = useValidatorImage(validator)

                return (
                  <React.Fragment key={`validators ${validator?.rank} ${idx}`}>
                    {index !== 0 && (
                      <div className='[&>div]:dark:!bg-gray-950'>
                        <CardDivider />
                      </div>
                    )}

                    {validator && (
                      <div className='relative cursor-default'>
                        {!isCancleUnstakeSupported && (
                          <div className='absolute h-[72px] w-[344px] cursor-default ' />
                        )}

                        <GenericCard
                          img={
                            <img
                              src={keybaseImageUrl ?? validator.image ?? Images.Misc.Validator}
                              onError={imgOnError(Images.Misc.Validator)}
                              className={'rounded-full  overflow-clip w-6 h-6'}
                            />
                          }
                          icon={
                            isCancleUnstakeSupported ? (
                              <span className='material-icons-round text-gray-400'>
                                keyboard_arrow_right
                              </span>
                            ) : undefined
                          }
                          onClick={
                            isCancleUnstakeSupported
                              ? () => {
                                  navigate('/stakeCancelUndelegation', {
                                    state: {
                                      unBoundingdelegation: ud,
                                      unBoundingdelegationEntry: d,
                                      validatorAddress: ud.validator_address,
                                      validators: validators,
                                      activeChain,
                                      activeNetwork,
                                    } as CancleUndelegationProps,
                                  })
                                }
                              : undefined
                          }
                          isRounded
                          title={
                            <Text size='md' className='font-bold ml-3'>
                              {sliceWord(validator.moniker ?? validator.name, 10, 3)}
                            </Text>
                          }
                          subtitle={
                            <div className='ml-3'>
                              {formatHideBalance(`${d.formattedBalance} | ${timeLeftText}`)}
                            </div>
                          }
                          subtitle2={''}
                          className='dark:!bg-gray-950'
                        />
                      </div>
                    )}
                  </React.Fragment>
                )
              }

              return <Component key={`validators ${validator?.rank} ${idx}`} />
            })

            return <React.Fragment key={`validators ${index}`}>{frags}</React.Fragment>
          })}
      </div>
    )
  },
)

UnboundingDelegations.displayName = 'UnboundingDelegations'
export { UnboundingDelegations }
