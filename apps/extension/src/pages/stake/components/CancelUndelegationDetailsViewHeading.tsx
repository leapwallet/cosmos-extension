import { useValidatorImage } from '@leapwallet/cosmos-wallet-hooks'
import { Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar } from '@leapwallet/leap-ui'
import Text from 'components/text'
import currency from 'currency.js'
import { Images } from 'images'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

type CancelUndelegationDetailsViewHeadingProps = {
  validator: Validator
}

const CancelUndelegationDetailsViewHeading = React.memo(
  ({ validator }: CancelUndelegationDetailsViewHeadingProps) => {
    const { data: imageUrl } = useValidatorImage(validator)

    return (
      <div className='flex flex-col pb-4 gap-1'>
        <div className='flex items-center gap-3'>
          <div className='h-9 w-9 rounded-full overflow-clip border border-gray-400 shrink flex items-center justify-center'>
            <Avatar
              size='sm'
              avatarImage={imageUrl ?? validator.image ?? Images.Misc.Validator}
              avatarOnError={imgOnError(Images.Misc.Validator)}
            />
          </div>

          <Text size='xxl' className='font-black'>
            {validator.moniker ?? validator.name}
          </Text>
        </div>

        <Text size='md' color='dark:text-gray-300 text-gray-800' className='font-bold'>
          {`Staked: ${currency(validator.delegations?.total_tokens_display as number, {
            precision: 2,
            symbol: '',
          }).format()} | Commission: ${
            currency((+(validator.commission?.commission_rates.rate ?? '') * 100).toString(), {
              precision: 0,
              symbol: '',
            }).format() + '%'
          }`}
        </Text>
      </div>
    )
  },
)

CancelUndelegationDetailsViewHeading.displayName = 'CancelUndelegationDetailsViewHeading'
export { CancelUndelegationDetailsViewHeading }
