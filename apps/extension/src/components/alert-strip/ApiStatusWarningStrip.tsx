import { Warning, X } from '@phosphor-icons/react'
import React, { useState } from 'react'

import { AlertStrip } from './AlertStrip'

export const ApiStatusWarningStrip = () => {
  const [show, setShow] = useState(true)

  if (!show) {
    return null
  }

  return (
    <AlertStrip
      alwaysShow
      className='dark:bg-gray-950 bg-white-100'
      message={
        <span className='flex items-center justify-between gap-1 font-medium text-xs dark:text-amber-400 text-amber-500'>
          <Warning weight='fill' size={14} />
          <span>Failed to fetch network data. Check again later.</span>
          <button
            title='hide'
            className='dark:text-gray-400 text-gray-600 absolute right-4'
            onClick={() => setShow(false)}
          >
            <X size={14} />
          </button>
        </span>
      }
    />
  )
}
