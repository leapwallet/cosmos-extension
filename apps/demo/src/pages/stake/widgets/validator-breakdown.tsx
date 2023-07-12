import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import { GenericCard } from '@leapwallet/leap-ui'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import CardDivider from '~/components/card-divider'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { Images } from '~/images'
import { Delegations } from '~/types/bank'
import { sliceWord } from '~/util/strings'
import { tokensByChain } from '~/util/tokens'

function ValidatorBreakdown({
  delegations,
  validators,
  isLoading,
}: {
  delegations: Delegations
  validators: Record<string, Validator>
  percentChange: number
  isLoading: boolean
}) {
  const chain = useActiveChain()
  const _delegations = Object.values(delegations ?? {})
  if (!isLoading && _delegations.length === 0) return <></>

  return (
    <div className='dark:bg-gray-900 rounded-2xl bg-white-100 pt-4'>
      {!isLoading && (
        <Text size='xs' color='dark:text-gray-200 text-gray-600' className='font-bold py-1 px-4'>
          Breakdown by Validator
        </Text>
      )}
      {isLoading && (
        <div className='w-full p-4'>
          <Skeleton count={3} />
        </div>
      )}
      {!isLoading &&
        _delegations.map((d, index) => {
          const validator = validators[d?.delegation?.validator_address]

          return (
            <React.Fragment key={`validators${index}`}>
              {index !== 0 && <CardDivider />}
              {validator && (
                <GenericCard
                  className='w-full'
                  img={
                    <img
                      src={
                        validator.image ??
                        validator.keybase_image ??
                        validator.mintscan_image ??
                        Images.Misc.Validator
                      }
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = Images.Misc.Validator
                      }}
                      className={'rounded-full overflow-clip w-6 h-6'}
                    />
                  }
                  isRounded
                  title={
                    <Text size='md' className='font-bold text-ellipsis ml-4'>
                      {sliceWord(validator.moniker ?? validator.name, 10, 3)}
                    </Text>
                  }
                  subtitle={
                    <p className='ml-4'>
                      {d.balance.amount} {tokensByChain[chain].symbol}
                    </p>
                  }
                  icon={
                    <span className='material-icons-round text-gray-400'>keyboard_arrow_right</span>
                  }
                />
              )}
            </React.Fragment>
          )
        })}
    </div>
  )
}

export default ValidatorBreakdown
