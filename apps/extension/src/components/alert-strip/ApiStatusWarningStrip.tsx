import { BalanceErrorStatus } from '@leapwallet/cosmos-wallet-store'
import React from 'react'

import { AlertStrip } from './v2'

export const ApiStatusWarningStrip = ({ balanceError }: { balanceError: BalanceErrorStatus }) => {
  if (balanceError === 'no-error') {
    return null
  }

  if (balanceError === 'partial-failure') {
    return (
      <AlertStrip type='warning' className='items-start' iconClassName='mt-0.5'>
        <span className='text-foreground text-xs !leading-[18px]'>
          Some balances may be outdated. Your funds remain secure.
        </span>
      </AlertStrip>
    )
  }

  return (
    <AlertStrip type='error' className='items-start' iconClassName='mt-0.5'>
      <span className='text-foreground text-xs !leading-[18px]'>
        Failed to fetch network data. Check again later.
      </span>
    </AlertStrip>
  )
}
