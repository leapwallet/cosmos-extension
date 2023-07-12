import React from 'react'
import Skeleton from 'react-loading-skeleton'

const WalletLoading = () => {
  return (
    <div className='h-40'>
      <Skeleton style={{ width: 'calc(100% - 1rem)' }} className='h-36 mt-2 mx-2' />
    </div>
  )
}

export default WalletLoading
