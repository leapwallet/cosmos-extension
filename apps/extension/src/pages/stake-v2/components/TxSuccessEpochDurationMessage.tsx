import { STAKE_MODE } from '@leapwallet/cosmos-wallet-hooks'
import { Info } from '@phosphor-icons/react'
import Text from 'components/text'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { epochIntervalStore } from 'stores/epoch-interval-store'

const epochMessageMap: Record<Partial<STAKE_MODE>, string | null> = {
  DELEGATE: 'staking',
  UNDELEGATE: 'unstaking',
  CANCEL_UNDELEGATION: 'cancel unstaking',
  REDELEGATE: 'restaking',
  CLAIM_REWARDS: null,
}

export const TxSuccessEpochDurationMessage = observer((props: { mode: STAKE_MODE }) => {
  const message = epochMessageMap[props.mode]
  if (!message) {
    return null
  }

  const fullMessage = `Amount is queued for ${message} in next epoch (${epochIntervalStore.timeLeft}).`

  return (
    <div className='flex w-full bg-white-100 dark:bg-gray-950 p-4 rounded-2xl gap-2 items-center'>
      <Info size={20} className='text-orange-500 dark:text-orange-300 shrink-0 items-center' />
      <Text className='text-xs'>{fullMessage}</Text>
    </div>
  )
})
