import { Action, useTransactions } from '@leapwallet/elements-hooks'
import { motion } from 'framer-motion'
import React from 'react'
import { SwapTxnStatus } from 'types/swap'

import { TxPageStepsType } from './index'

type TxPageStepsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: any
  txStatus: SwapTxnStatus[]
}

export function TxPageSteps({ route, txStatus }: TxPageStepsProps) {
  const { groupedTransactions } = useTransactions(route)

  if (Object.keys(groupedTransactions).length === 0) {
    return null
  }

  return (
    <motion.div
      className='flex flex-col p-4 dark:bg-gray-900 rounded-xl bg-gray-50 overflow-hidden'
      initial={{ height: 0, opacity: 0.6 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0.6 }}
      transition={{ duration: 0.1 }}
      key='tx-page-steps'
    >
      {Object.entries(groupedTransactions).map(([, value], txIndex) => {
        return (
          <React.Fragment key={txIndex}>
            {value?.map((action: Action, actionIndex: number, self) => {
              const seqReducer = (acc: number, curr: Action) => {
                if (
                  curr.type === 'TRANSFER' ||
                  curr.type === 'SEND' ||
                  (curr.type === 'SWAP' && actionIndex === 0)
                ) {
                  return acc + 1
                }
                return acc
              }

              const transferSequenceIndex = self.slice(0, actionIndex + 1).reduce(seqReducer, -1)

              const previousActionTransferSequenceIndex = self
                .slice(0, actionIndex)
                .reduce(seqReducer, -1)

              const prevAction = actionIndex === 0 ? undefined : self[actionIndex - 1]

              return (
                <TxPageStepsType
                  key={`${action.type}-${actionIndex}`}
                  action={action}
                  isFirst={actionIndex === 0}
                  isLast={actionIndex === value.length - 1}
                  prevAction={prevAction}
                  response={txStatus?.[txIndex]?.responses?.[transferSequenceIndex]}
                  prevTransferSequenceIndex={previousActionTransferSequenceIndex}
                  transferSequenceIndex={transferSequenceIndex}
                  actionIndex={actionIndex}
                />
              )
            })}
          </React.Fragment>
        )
      })}
    </motion.div>
  )
}
