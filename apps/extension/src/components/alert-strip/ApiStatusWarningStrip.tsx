import { Warning, X } from '@phosphor-icons/react'
import React, { useState } from 'react'

import { AlertStrip } from './v2'

export const ApiStatusWarningStrip = () => {
  const [show, setShow] = useState(true)

  if (!show) {
    return null
  }

  return (
    <AlertStrip type='error'>
      <span className='text-destructive-foreground text-xs !leading-[24px]'>
        Failed to fetch network data. Check again later.
      </span>
    </AlertStrip>
  )
}
