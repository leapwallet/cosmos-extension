import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import { GenericCard } from '@leapwallet/leap-ui'
import React from 'react'

import CardDivider from '~/components/card-divider'
import Text from '~/components/text'
import { Images } from '~/images'

function CurrentValidatorCard({
  fromValidator,
  delegation,
}: {
  fromValidator?: Validator
  delegation?: Delegation
}) {
  return (
    <>
      {fromValidator && delegation && (
        <div className='rounded-2xl dark:bg-gray-900 bg-white-100'>
          <GenericCard
            img={
              <img
                src={
                  fromValidator.image ??
                  fromValidator.keybase_image ??
                  fromValidator.mintscan_image ??
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
              <Text size='md' className='font-bold ml-3'>
                Current Validator
              </Text>
            }
            title2={
              <div className='text-right truncate w-[130px] py-2 text-ellipsis'>
                {fromValidator.moniker ?? fromValidator.name}
              </div>
            }
            subtitle={''}
            subtitle2={''}
          />
          <CardDivider />
          <Text
            size='xs'
            className='mx-4 my-2'
            color='dark:text-gray-400 text-gray-600'
          >{`Staked: ${delegation.balance.formatted_amount}`}</Text>
        </div>
      )}
    </>
  )
}
export default CurrentValidatorCard
