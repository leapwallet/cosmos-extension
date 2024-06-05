import { GenericCard } from '@leapwallet/leap-ui'
import React, { ReactNode } from 'react'

type TokenContractAddressProps = {
  address: string
  img?: ReactNode
}

export function TokenContractAddress({ address, img }: TokenContractAddressProps) {
  return (
    <GenericCard
      title={<span className='text-[15px]'>Contract Address</span>}
      subtitle={<span className='break-all'>{address}</span>}
      className='h-[80px] py-8 my-5'
      img={img ?? null}
      size='sm'
      isRounded
    />
  )
}
