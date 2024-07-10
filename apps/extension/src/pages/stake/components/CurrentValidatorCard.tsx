import { useValidatorImage } from '@leapwallet/cosmos-wallet-hooks'
import { Delegation, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, GenericCard } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

type CurrentValidatorCardProps = {
  fromValidator?: Validator
  delegation?: Delegation
}

const CurrentValidatorCard = React.memo(
  ({ fromValidator, delegation }: CurrentValidatorCardProps) => {
    const { data: keybaseImageUrl } = useValidatorImage(fromValidator)

    if (!fromValidator || !delegation) {
      return null
    }

    return (
      <div className='rounded-2xl dark:bg-gray-950 bg-white-100'>
        <GenericCard
          img={
            <img
              src={keybaseImageUrl ?? fromValidator.image ?? Images.Misc.Validator}
              onError={imgOnError(Images.Misc.Validator)}
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
          className='dark:!bg-gray-950'
        />

        <div className='[&>div]:dark:!bg-gray-950'>
          <CardDivider />
        </div>

        <Text
          size='xs'
          className='mx-4 my-2'
          color='dark:text-gray-400 text-gray-600'
        >{`Staked: ${delegation.balance.formatted_amount}`}</Text>
      </div>
    )
  },
)

CurrentValidatorCard.displayName = 'CurrentValidatorCard'
export { CurrentValidatorCard }
