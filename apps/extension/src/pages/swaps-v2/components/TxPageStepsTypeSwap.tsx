import { useChains, useDenomData } from '@leapwallet/elements-hooks'
import React from 'react'
import { SwapTxAction } from 'types/swap'

type TxPageStepsTypeSwapProps = {
  action: SwapTxAction
}

export function TxPageStepsTypeSwap({ action }: TxPageStepsTypeSwapProps) {
  const { data: chains } = useChains()
  const { data: srcDenomData } = useDenomData(action.sourceAsset, action.chain)
  const { data: destDenomData } = useDenomData(action.destinationAsset, action.chain)

  if (!chains) {
    return null
  }

  const sourceChain = chains.find((chain) => chain.chainId === action.chain)

  return (
    <>
      <p className='dark:text-white-100 text-sm'>Swap</p>
      <p className='text-gray-300 text-xs'>
        {srcDenomData?.coinDenom} to {destDenomData?.coinDenom} on {sourceChain?.chainName}
      </p>
    </>
  )
}
