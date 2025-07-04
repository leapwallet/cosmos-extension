import { BetaTag } from 'components/BetaTag/BetaTag'
import React from 'react'

function LightNodeHeader() {
  return (
    <div className='flex justify-center items-center gap-1'>
      <span className='text-md font-medium'>Celestia Light Node</span>
      <BetaTag className='relative' />
    </div>
  )
}

export default LightNodeHeader
