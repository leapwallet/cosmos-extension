import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { DeliverTxResponse, isDeliverTxSuccess } from '@cosmjs/stargate'
import { usePendingTxState } from '@leapwallet/cosmos-wallet-hooks'
import { ActivityCardContent } from '@leapwallet/cosmos-wallet-hooks'
import { LeapWalletApi } from '@leapwallet/cosmos-wallet-hooks'
import { useQueryClient } from '@tanstack/react-query'
import classnames from 'classnames'
import React, { useEffect } from 'react'
import { atom } from 'recoil'

import Text from '~/components/text'

import ActivityCard from './activity-card'

type TxStatus = 'loading' | 'success' | 'failed'

type PendingTx = ActivityCardContent & {
  txStatus: TxStatus
  promise: Promise<DeliverTxResponse | ExecuteResult>
}

export const pendingTxState = atom<PendingTx | null>({
  key: 'pending-activity-state',
  default: null,
})

export default function PendingTxCard() {
  const { pendingTx, setPendingTx } = usePendingTxState()
  const queryClient = useQueryClient()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()

  useEffect(() => {
    if (pendingTx) {
      pendingTx.promise &&
        pendingTx.promise.then(async (result) => {
          if ('code' in result) {
            if (result && isDeliverTxSuccess(result)) {
              setPendingTx({ ...pendingTx, txStatus: 'success' })
            } else {
              setPendingTx({ ...pendingTx, txStatus: 'failed' })
            }
          }
          setTimeout(() => {
            setPendingTx(null)
            queryClient.invalidateQueries(['datasend'])
          }, 2000)
        })
    }
  }, [txPostToDB])

  const txStatusStyles: Record<TxStatus, { bgColor: string; border: string; title: string }> = {
    loading: {
      bgColor: 'bg-gray-600',
      border: 'border-gray-600',
      title: 'Pending',
    },
    success: {
      bgColor: 'bg-green-600',
      border: 'border-green-600',
      title: 'Success',
    },
    failed: {
      bgColor: 'dark:bg-red-600',
      border: 'dark:border-red-600',
      title: 'Failed',
    },
  }

  if (!pendingTx) return null

  const { txStatus } = pendingTx

  return (
    <div className={classnames('rounded-2xl mb-5', txStatusStyles[txStatus].bgColor)}>
      <div className='px-[16px] py-[8px]'>
        <Text size='sm' className='text-gray-100 dark:text-white-100 font-bold'>
          {txStatusStyles[txStatus].title}
        </Text>
      </div>
      <div
        className={classnames(
          'rounded-2xl overflow-hidden bg-white-100 dark:bg-gray-900 border',
          txStatusStyles[txStatus].border,
        )}
      >
        <ActivityCard showLoader={pendingTx.txStatus === 'loading'} content={pendingTx} />
      </div>
    </div>
  )
}
