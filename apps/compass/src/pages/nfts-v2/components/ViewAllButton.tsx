import { useChainPageInfo } from 'hooks'
import React from 'react'

export function ViewAllButton({ onClick }: { onClick: VoidFunction }) {
  const { topChainColor } = useChainPageInfo()

  return (
    <button className='col-span-2 font-bold' style={{ color: topChainColor }} onClick={onClick}>
      View all
    </button>
  )
}
