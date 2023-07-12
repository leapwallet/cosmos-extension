import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { DeliverTxResponse, isDeliverTxSuccess } from '@cosmjs/stargate'
import {
  ActivityCardContent,
  LeapWalletApi,
  useInvalidateActivity,
  useInvalidateDelegations,
  useInvalidateTokenBalances,
  usePendingTxState,
} from '@leapwallet/cosmos-wallet-hooks'
import { CosmosTxType } from '@leapwallet/cosmos-wallet-hooks'
import classnames from 'classnames'
import React, { useEffect } from 'react'
import { atom } from 'recoil'
import { TxResponse } from 'secretjs'

import Text from '../../components/text'
import { ActivityCard } from './ActivityCard'

type TxStatus = 'loading' | 'success' | 'failed'

type PendingTx = ActivityCardContent & {
  txStatus: TxStatus
  promise: Promise<DeliverTxResponse | ExecuteResult | TxResponse>
}

export const pendingTxState = atom<PendingTx | null>({
  key: 'pending-activity-state',
  default: null,
})

export default function PendingTxCard() {
  const { pendingTx, setPendingTx } = usePendingTxState()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const invalidateBalances = useInvalidateTokenBalances()
  const invalidateDelegations = useInvalidateDelegations()

  const invalidateActivity = useInvalidateActivity()

  useEffect(() => {
    const invalidateQueries = () => {
      invalidateBalances()
      invalidateDelegations()
      invalidateActivity()
    }

    if (pendingTx && pendingTx.promise) {
      pendingTx.promise
        .then(async (result) => {
          if ('code' in result) {
            if (result && isDeliverTxSuccess(result)) {
              setPendingTx({ ...pendingTx, txStatus: 'success' })
            } else {
              setPendingTx({ ...pendingTx, txStatus: 'failed' })
            }
          }

          if (pendingTx.txType === 'secretTokenTransfer') {
            const _result = result as unknown as TxResponse
            let feeQuantity

            if (_result?.tx?.auth_info?.fee?.amount) {
              feeQuantity = _result?.tx?.auth_info?.fee?.amount[0].amount
            }

            txPostToDB({
              txHash: _result.transactionHash,
              txType: CosmosTxType.SecretTokenTransaction,
              metadata: {
                contract: pendingTx.sentTokenInfo?.coinMinimalDenom,
              },
              feeQuantity,
              feeDenomination: 'uscrt',
            })
          }

          if (pendingTx.txType === 'cw20TokenTransfer') {
            txPostToDB({
              txHash: result.transactionHash,
              txType: 'CW20_TOKEN_TRANSACTION' as CosmosTxType,
              metadata: {
                contract: pendingTx.sentTokenInfo?.coinMinimalDenom,
              },
              feeQuantity: pendingTx.feeQuantity,
              feeDenomination: pendingTx.feeDenomination,
            })
          }

          setTimeout(() => {
            invalidateQueries()
            setPendingTx(null)
          }, 2000)
        })
        .catch(() => {
          setTimeout(() => {
            invalidateQueries()
            setPendingTx(null)
          }, 2000)
        })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Text
          size='sm'
          className='text-gray-100 dark:text-white-100 font-bold'
          data-testing-id='pending-tx-title-ele'
        >
          {txStatusStyles[txStatus].title}
        </Text>
      </div>
      <div
        className={classnames(
          'rounded-2xl overflow-hidden bg-white-100 dark:bg-gray-900 border',
          txStatusStyles[txStatus].border,
        )}
      >
        <ActivityCard
          showLoader={pendingTx.txStatus === 'loading'}
          content={pendingTx}
          isSuccessful={true}
        />
      </div>
    </div>
  )
}
