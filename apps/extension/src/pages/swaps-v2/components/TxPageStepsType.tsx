import { useGetExplorerTxnUrl } from '@leapwallet/cosmos-wallet-hooks'
import { PacketContent, TRANSFER_STATE } from '@leapwallet/elements-core'
import { Action, useChains, useDenomData } from '@leapwallet/elements-hooks'
import React, { useCallback, useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { TransferInfo } from 'types/swap'

import { TxStepsStatusIcon } from './TxStepsStatusIcon'

type TxPageStepsTypeProps = {
  action: Action
  isFirst: boolean
  isLast: boolean
  response?: TransferInfo
  prevAction: Action | undefined
  prevTransferSequenceIndex: number
  transferSequenceIndex: number
  actionIndex: number
}

export function TxPageStepsType({
  action,
  isLast,
  response,
  actionIndex,
  prevAction,
  prevTransferSequenceIndex,
  transferSequenceIndex,
}: TxPageStepsTypeProps) {
  const { srcChainId, destChainId, srcAsset, destAsset } = useMemo(() => {
    let srcChainId, destChainId, srcAsset, destAsset
    switch (action.type) {
      case 'SWAP': {
        srcChainId = action.chain
        destChainId = action.chain
        srcAsset = action.sourceAsset
        destAsset = action.destinationAsset
        break
      }
      case 'TRANSFER': {
        srcChainId = action.sourceChain
        destChainId = action.destinationChain
        srcAsset = action.asset
        destAsset = action.asset
        break
      }
      default: {
        srcChainId = action.sourceChain
        destChainId = action.sourceChain
        srcAsset = action.asset
        destAsset = action.asset
        break
      }
    }

    return {
      srcChainId,
      destChainId,
      srcAsset,
      destAsset,
    }
  }, [action])

  const { data: chains, isLoading: isChainsLoading } = useChains()
  const { data: srcDenomData, isLoading: isSrcDenomLoading } = useDenomData(srcAsset, srcChainId)
  const { data: destDenomData, isLoading: isDestDenomLoading } = useDenomData(
    destAsset,
    destChainId,
  )

  const sourceChain = useMemo(
    () => chains?.find((chain) => chain.chainId === srcChainId),
    [chains, srcChainId],
  )

  const destChain = useMemo(
    () => chains?.find((chain) => chain.chainId === destChainId),
    [chains, destChainId],
  )

  const { getExplorerTxnUrl } = useGetExplorerTxnUrl({})
  const handleViewInExplorer = useCallback(
    (chainId: string, txHash: string) => {
      const chain = chains?.find((chain) => chain.chainId === chainId)
      if (!chain) return

      const explorerTxnUrl = getExplorerTxnUrl(txHash, chain.txExplorer?.mainnet?.txUrl ?? '')
      window.open(explorerTxnUrl, '_blank', 'noopener noreferrer')
    },
    [chains, getExplorerTxnUrl],
  )

  const { status, txData } = useMemo(() => {
    const packetTxs = response?.packet_txs
    let _status
    let _txData

    if (!packetTxs) {
      _status =
        actionIndex === 0 || transferSequenceIndex !== prevTransferSequenceIndex
          ? response?.state
          : undefined

      return {
        status: _status,
        txData: _txData,
      }
    }

    if (packetTxs?.error) {
      _status = TRANSFER_STATE.TRANSFER_FAILURE

      if (transferSequenceIndex === prevTransferSequenceIndex) {
        _txData = packetTxs.receive_tx ?? packetTxs?.timeout_tx ?? packetTxs?.send_tx
      } else {
        if (prevAction !== undefined) {
          _txData = packetTxs.receive_tx ?? packetTxs?.timeout_tx ?? packetTxs?.send_tx
        } else {
          _txData = packetTxs?.timeout_tx ?? packetTxs?.send_tx
        }
      }

      return {
        status: _status,
        txData: _txData,
      }
    }

    if (transferSequenceIndex === prevTransferSequenceIndex) {
      if (packetTxs?.receive_tx) {
        _status = TRANSFER_STATE.TRANSFER_SUCCESS
        _txData = packetTxs?.receive_tx
      } else if (packetTxs?.send_tx) {
        _status = TRANSFER_STATE.TRANSFER_PENDING
      }
    } else {
      if (prevAction !== undefined && prevAction?.type !== action?.type) {
        if (packetTxs?.receive_tx) {
          _status = TRANSFER_STATE.TRANSFER_SUCCESS
          _txData = packetTxs?.receive_tx
        } else if (packetTxs?.send_tx) {
          _status = TRANSFER_STATE.TRANSFER_PENDING
        }
      } else {
        if (packetTxs?.send_tx) {
          _status = TRANSFER_STATE.TRANSFER_SUCCESS
          _txData = packetTxs?.send_tx
        } else {
          _status = TRANSFER_STATE.TRANSFER_PENDING
        }
      }
    }

    return { status: _status, txData: _txData }
  }, [
    action?.type,
    prevAction,
    actionIndex,
    prevTransferSequenceIndex,
    response?.packet_txs,
    response?.state,
    transferSequenceIndex,
  ])

  const { txHash, chainId } = useMemo(() => {
    if (!txData) return { txHash: undefined, chainId: undefined }

    return {
      txHash: (txData as PacketContent)?.tx_hash,
      chainId: (txData as PacketContent)?.chain_id,
    }
  }, [txData])

  return (
    <div className={'flex my-1 w-full flex-row justify-start items-start gap-[12px]'}>
      <div className='py-[2px] flex flex-col gap-2 justify-start items-center'>
        <TxStepsStatusIcon state={status} denomData={srcDenomData} />
        {!isLast && <div className='w-[2px] h-[11px] bg-gray-100 dark:bg-gray-850 rounded-sm' />}
      </div>
      <div className='flex w-full flex-col justify-start items-start gap-0'>
        <div className='flex-row flex w-full justify-between items-center'>
          <div className='dark:text-white-100 font-bold text-black-100 text-md !leading-[21.6px]'>
            {action.type === 'SWAP' ? 'Swap ' : 'Transfer '}
            {action.type === 'TRANSFER' || action.type === 'SEND' ? (
              isSrcDenomLoading ? (
                <Skeleton
                  width={40}
                  height={20}
                  containerClassName='inline-block !leading-none rounded-2xl'
                />
              ) : (
                srcDenomData?.coinDenom
              )
            ) : (
              <>
                <>
                  {isSrcDenomLoading ? (
                    <Skeleton
                      width={40}
                      height={20}
                      containerClassName='inline-block !leading-none rounded-2xl'
                    />
                  ) : (
                    srcDenomData?.coinDenom
                  )}
                </>
                <> to </>
                <>
                  {isDestDenomLoading ? (
                    <Skeleton
                      width={40}
                      height={20}
                      containerClassName='inline-block !leading-none rounded-2xl'
                    />
                  ) : (
                    destDenomData?.coinDenom
                  )}
                </>
              </>
            )}
          </div>
          <>
            {txHash && chainId && (
              <button
                onClick={() => handleViewInExplorer(chainId, txHash)}
                className='material-icons-round text-gray-400 dark:text-gray-600 !leading-4 !text-md'
              >
                open_in_new
              </button>
            )}
          </>
        </div>
        <div>
          <div className='text-gray-400 font-medium dark:text-gray-600 text-sm !leading-[18.9px]'>
            {action.type === 'TRANSFER' || action.type === 'SEND' ? (
              <>
                from{' '}
                {isChainsLoading ? (
                  <Skeleton
                    width={40}
                    height={20}
                    containerClassName='inline-block !leading-none rounded-2xl'
                  />
                ) : (
                  sourceChain?.chainName ?? 'Unknown'
                )}{' '}
                to{' '}
                {isChainsLoading ? (
                  <Skeleton
                    width={40}
                    height={20}
                    containerClassName='inline-block !leading-none rounded-2xl'
                  />
                ) : (
                  destChain?.chainName
                )}
              </>
            ) : (
              <>
                on{' '}
                {isChainsLoading ? (
                  <Skeleton
                    width={40}
                    height={20}
                    containerClassName='inline-block !leading-none rounded-2xl'
                  />
                ) : (
                  sourceChain?.chainName ?? 'Unknown'
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
