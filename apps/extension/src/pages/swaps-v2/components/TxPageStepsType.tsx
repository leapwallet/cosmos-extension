import { sliceAddress } from '@leapwallet/cosmos-wallet-hooks'
import { PacketContent, TRANSFER_STATE } from '@leapwallet/elements-core'
import { useChains } from '@leapwallet/elements-hooks'
import classNames from 'classnames'
import React, { useCallback } from 'react'
import { SwapTxAction, TransferTxAction } from 'types/swap'

import { TxPageStepsTypeSwap, TxPageStepsTypeTransfer } from './index'

type TxPageStepsTypeProps = {
  action: SwapTxAction | TransferTxAction
  isFirst: boolean
  isLast: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: any
}

export function TxPageStepsType({ action, isFirst, isLast, response }: TxPageStepsTypeProps) {
  const { data: chains } = useChains()

  const handleViewInExplorer = useCallback(
    (chainId: string, txHash: string) => {
      const chain = chains?.find((chain) => chain.chainId === chainId)
      if (!chain) return
      window.open(`${chain.txExplorer.mainnet.txUrl}/${txHash}`, '_blank', 'noopener noreferrer')
    },
    [chains],
  )

  return (
    <div
      className={classNames(
        "before:content-[''] relative before:absolute before:w-[1px] before:h-[50px]",
        {
          'before:top-[16px]': isFirst,
          'before:bottom-[16px]': isLast,
          'z-10': !isFirst && !isLast,
          'before:bg-green-600': TRANSFER_STATE.TRANSFER_SUCCESS === response?.state,

          'before:bg-yellow-600': [
            TRANSFER_STATE.TRANSFER_PENDING,
            TRANSFER_STATE.TRANSFER_RECEIVED,
          ].includes(response?.state),

          'before:bg-red-300': TRANSFER_STATE.TRANSFER_FAILURE === response?.state,

          'before:bg-gray-200 before:dark:bg-gray-800': ![
            TRANSFER_STATE.TRANSFER_SUCCESS,
            TRANSFER_STATE.TRANSFER_PENDING,
            TRANSFER_STATE.TRANSFER_RECEIVED,
            TRANSFER_STATE.TRANSFER_FAILURE,
          ].includes(response?.state),
        },
      )}
    >
      <div className='ml-[16px]'>
        {action.type === 'SWAP' ? <TxPageStepsTypeSwap action={action} /> : null}
        {action.type === 'TRANSFER' || action.type === 'SEND' ? (
          <TxPageStepsTypeTransfer action={action} />
        ) : null}

        {response?.state === TRANSFER_STATE.TRANSFER_PENDING ? (
          <p className='text-yellow-600 text-xs flex items-center gap-1'>Pending...</p>
        ) : null}

        <p className='text-gray-300 text-xs flex items-center gap-1'>
          {response?.state === TRANSFER_STATE.TRANSFER_SUCCESS ? (
            <>
              {(function () {
                let txData: PacketContent

                if (isFirst) {
                  txData = response?.packet_txs.send_tx
                } else {
                  txData = response?.packet_txs.receive_tx
                }

                if (!txData) return null
                const { tx_hash: txHash, chain_id: chainId } = txData

                return (
                  <>
                    {`Success · #${sliceAddress(txHash)} · `}
                    <span className='cursor-pointer underline'>
                      <a onClick={() => handleViewInExplorer(chainId, txHash)}>View in Explorer</a>
                    </span>
                  </>
                )
              })()}
            </>
          ) : null}
        </p>
      </div>
    </div>
  )
}
