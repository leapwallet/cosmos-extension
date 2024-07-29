import { useStaking } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'

import StakeRewardCard from './StakeRewardCard'

interface StakeAmountCardProps {
  onClaim: () => void
  onClaimAndStake?: () => void
}

export default function StakeAmountCard({ onClaim, onClaimAndStake }: StakeAmountCardProps) {
  const { formatHideBalance } = useHideAssets()
  const { loadingDelegations, currencyAmountDelegation, totalDelegationAmount } = useStaking()
  const [formatCurrency] = useFormatCurrency()

  const formattedCurrencyAmountDelegation = useMemo(() => {
    if (new BigNumber(currencyAmountDelegation).gt(0)) {
      return formatCurrency(new BigNumber(currencyAmountDelegation))
    }
  }, [currencyAmountDelegation, formatCurrency])

  return (
    <div className='flex flex-col w-full bg-white-100 dark:bg-gray-950 rounded-2xl p-4 gap-y-4'>
      <Text size='xs' color='dark:text-gray-400 text-gray-700' className='font-medium'>
        Your deposited amount
      </Text>
      {loadingDelegations && <Skeleton width={100} count={2} />}
      {!loadingDelegations && (
        <div>
          <Text size='lg' className='font-black'>
            {formattedCurrencyAmountDelegation &&
              formatHideBalance(formattedCurrencyAmountDelegation)}
          </Text>
          <Text size='sm' className='font-medium' color='text-gray-800 dark:text-gray-200'>
            {formatHideBalance(totalDelegationAmount)}
          </Text>
        </div>
      )}
      <StakeRewardCard onClaim={onClaim} onClaimAndStake={onClaimAndStake} />
    </div>
  )
}
