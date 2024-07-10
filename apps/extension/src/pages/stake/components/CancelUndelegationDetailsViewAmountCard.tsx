import Text from 'components/text'
import React from 'react'

type CancelUndelegationDetailsViewAmountCardProps = {
  validatorName: string
  totalDelegations: string
  currencyAmountDelegation: string
  formatHideBalance: (s: string) => React.ReactNode
  renderingOnValidatorDetails?: boolean
}

const CancelUndelegationDetailsViewAmountCard = React.memo(
  ({
    totalDelegations,
    currencyAmountDelegation,
    validatorName,
    formatHideBalance,
    renderingOnValidatorDetails,
  }: CancelUndelegationDetailsViewAmountCardProps) => {
    if (!totalDelegations) return null

    return (
      <div className='dark:bg-gray-950 rounded-2xl bg-white-100 pt-4'>
        {totalDelegations && (
          <Text
            size='xs'
            color='dark:text-gray-400 text-gray-600'
            className='font-bold mb-3 py-1 px-4'
          >
            Your {renderingOnValidatorDetails ? 'deposited' : 'unstaking'} amount{' '}
            {`(${validatorName})`}
          </Text>
        )}

        {totalDelegations && (
          <div className='flex px-4 pb-4 justify-between items-center'>
            <div>
              <Text size='xl' className='text-[28px] mb-2 font-black'>
                {formatHideBalance(currencyAmountDelegation)}
              </Text>

              <Text size='xs' className='font-semibold'>
                {formatHideBalance(totalDelegations)}
              </Text>
            </div>
          </div>
        )}
      </div>
    )
  },
)

CancelUndelegationDetailsViewAmountCard.displayName = 'CancelUndelegationDetailsViewAmountCard'
export { CancelUndelegationDetailsViewAmountCard }
