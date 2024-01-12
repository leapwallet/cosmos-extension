import { useTransactions } from '@leapwallet/elements-hooks'
import React from 'react'
import { SwapTxAction, SwapTxnStatus, TransferTxAction } from 'types/swap'

import { TxPageStepsType } from './index'

type TxPageStepsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: any
  txStatus: SwapTxnStatus[]
}

export function TxPageSteps({ route, txStatus }: TxPageStepsProps) {
  const { groupedTransactions } = useTransactions(route)

  return (
    <div className='min-h-[75px] max-h-[150px] overflow-y-auto flex flex-col ml-[48px] gap-2'>
      {Object.keys(groupedTransactions).length > 0
        ? Object.entries(groupedTransactions).map(([, value], txIndex) => {
            let currentResponseIndex = 0

            return (
              <React.Fragment key={txIndex}>
                {value?.map((action: SwapTxAction | TransferTxAction, index: number) => {
                  if ((action.type === 'TRANSFER' || action.type === 'SEND') && index > 1) {
                    currentResponseIndex++
                  }
                  return (
                    <TxPageStepsType
                      key={`${action.type}-${index}`}
                      action={action}
                      isFirst={index === 0}
                      isLast={index === value.length - 1}
                      response={txStatus[txIndex].responses[currentResponseIndex]}
                    />
                  )
                })}
              </React.Fragment>
            )
          })
        : null}
    </div>
  )
}
