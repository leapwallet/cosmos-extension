import { sliceWord, useValidatorImage } from '@leapwallet/cosmos-wallet-hooks'
import {
  Delegation,
  Network,
  RewardsResponse,
  SupportedChain,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, GenericCard } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import { Images } from 'images'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { imgOnError } from 'utils/imgOnError'

import { ValidatorDetailsProps } from '../ValidatorDetails'

type ValidatorBreakdownProps = {
  unstakingPeriod: string
  delegation: Record<string, Delegation>
  network: Network
  rewards: RewardsResponse
  isLoading: boolean
  formatHideBalance: (s: string) => React.ReactNode
  activeChain: SupportedChain
  activeNetwork: SelectedNetwork
}

const ValidatorBreakdown = React.memo(
  ({
    delegation,
    unstakingPeriod,
    network,
    rewards,
    isLoading,
    formatHideBalance,
    activeChain,
    activeNetwork,
  }: ValidatorBreakdownProps) => {
    const navigate = useNavigate()
    const validators = network?.getValidators({}) as Record<string, Validator>
    const delegations = Object.values(delegation ?? {})
    if (!isLoading && delegations.length === 0) return <></>

    return (
      <div className='dark:bg-gray-950 rounded-2xl bg-white-100 pt-4'>
        {!isLoading && (
          <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-bold py-1 px-4'>
            Breakdown by Validator
          </Text>
        )}

        {isLoading && (
          <div className='w-[312px] p-4'>
            <Skeleton count={3} />
          </div>
        )}

        {!isLoading &&
          validators &&
          delegation &&
          delegations.map((d, index) => {
            const validator = validators[d?.delegation?.validator_address]
            const Component = () => {
              const { data: keybaseImageUrl } = useValidatorImage(validator)

              return (
                <React.Fragment key={`validators${index}`}>
                  {index !== 0 && (
                    <div className='[&>div]:dark:!bg-gray-950'>
                      <CardDivider />
                    </div>
                  )}

                  {validator && (
                    <GenericCard
                      className='dark:!bg-gray-950'
                      onClick={() => {
                        if (network) {
                          const apy = network.validatorApys
                          const reward = rewards?.rewards.find(
                            (r) => r.validator_address === d.delegation.validator_address,
                          )

                          navigate('/stakeValidatorDetails', {
                            state: {
                              unstakingPeriod,
                              delegation: d,
                              reward: reward,
                              validatorAddress: d.delegation.validator_address,
                              validators: validators,
                              apy: apy,
                              activeChain,
                              activeNetwork,
                            } as ValidatorDetailsProps,
                          })
                        }
                      }}
                      img={
                        <img
                          src={keybaseImageUrl ?? validator.image ?? Images.Misc.Validator}
                          onError={imgOnError(Images.Misc.Validator)}
                          className={'rounded-full overflow-clip w-6 h-6'}
                        />
                      }
                      isRounded
                      title={
                        <Text size='md' className='font-bold text-ellipsis ml-3'>
                          {sliceWord(validator.moniker ?? validator.name, 10, 3)}
                        </Text>
                      }
                      title2={
                        <span className='text-gray-400'>
                          {formatHideBalance(d.balance.formatted_amount ?? d.balance.amount)}
                        </span>
                      }
                      subtitle={''}
                      subtitle2={''}
                      icon={
                        <span className='material-icons-round text-gray-400'>
                          keyboard_arrow_right
                        </span>
                      }
                    />
                  )}
                </React.Fragment>
              )
            }

            return <Component key={validator?.address} />
          })}
      </div>
    )
  },
)

ValidatorBreakdown.displayName = 'ValidatorBreakdown'
export { ValidatorBreakdown }
