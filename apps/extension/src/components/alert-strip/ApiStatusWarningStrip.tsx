import React from 'react'

import { AlertStrip } from './v2'

export const ApiStatusWarningStrip = () => {
  return (
    <AlertStrip type='warning' className='items-start' iconClassName='mt-0.5'>
      <span className='text-foreground text-xs !leading-[18px]'>
        Some of your token balances and prices may be outdated. Your funds are safe.
      </span>
    </AlertStrip>
  )
}
