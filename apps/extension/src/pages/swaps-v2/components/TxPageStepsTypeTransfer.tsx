import { formatTokenAmount, sliceAddress, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { useChains, useDenomData } from '@leapwallet/elements-hooks'
import React from 'react'
import { TransferTxAction } from 'types/swap'

type TxPageStepsTypeTransferProps = {
  action: TransferTxAction
}

export function TxPageStepsTypeTransfer({ action }: TxPageStepsTypeTransferProps) {
  const { data: chains } = useChains()
  const { data: denomData } = useDenomData(action.asset, action.sourceChain)

  return (
    <>
      <p className='dark:text-white-100 text-sm'>Transfer</p>
      <p className='text-gray-300 text-xs'>
        {action.type === 'SEND'
          ? (() => {
              if (!denomData) {
                return null
              }
              const formattedAmount = formatTokenAmount(
                action.amount.toString(),
                sliceWord(denomData.coinDenom, 4, 4),
                3,
              )

              return (
                <>
                  {formattedAmount} from
                  <span title={action.fromAddress}>{sliceAddress(action.fromAddress)}</span> to
                  <span title={action.toAddress}>{sliceAddress(action.toAddress)}</span>
                </>
              )
            })()
          : null}
        {action.type === 'TRANSFER'
          ? (() => {
              if (!chains) {
                return null
              }
              const sourceChain = chains.find((chain) => chain.chainId === action.sourceChain)
              const destinationChain = chains.find(
                (chain) => chain.chainId === action.destinationChain,
              )
              if (!denomData) {
                return null
              }
              if (!sourceChain && destinationChain) {
                return (
                  <>
                    {denomData?.coinDenom} from {destinationChain?.chainName}
                  </>
                )
              }
              if (sourceChain && !destinationChain) {
                return (
                  <>
                    {denomData?.coinDenom} to {action.toAddress}
                  </>
                )
              }
              if (sourceChain && destinationChain) {
                return (
                  <>
                    {denomData.coinDenom} from {sourceChain.chainName} to{' '}
                    {destinationChain.chainName}
                  </>
                )
              }
              return 'Insufficient data to display transfer information'
            })()
          : null}
      </p>
    </>
  )
}
