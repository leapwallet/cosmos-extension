import { useGetExplorerTxnUrl } from '@leapwallet/cosmos-wallet-hooks'
import { TransferState } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/skip-core'
import { TRANSFER_STATE } from '@leapwallet/elements-core'
import { Action } from '@leapwallet/elements-hooks'
import { ArrowSquareOut } from '@phosphor-icons/react'
import React, { useCallback, useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { TransferSequence } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'

import { useDenomData, useGetChainsToShow } from '../hooks'
import { sanitizeChainIdForCompass } from '../utils'
import { TxStepsStatusIcon } from './TxStepsStatusIcon'

type TxPageStepsTypeProps = {
  action: Action
  isFirst: boolean
  isLast: boolean
  response?: TransferSequence
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

    if (isCompassWallet()) {
      srcChainId = sanitizeChainIdForCompass(srcChainId)
      destChainId = sanitizeChainIdForCompass(destChainId)
    }

    return {
      srcChainId,
      destChainId,
      srcAsset,
      destAsset,
    }
  }, [action])

  const { chainsToShow: chains, chainsToShowLoading: isChainsLoading } = useGetChainsToShow()
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
      if (isCompassWallet()) {
        const explorerLink =
          response?.packetTxs?.sendTx?.explorerLink ?? response?.packetTxs?.receiveTx?.explorerLink
        if (explorerLink) {
          window.open(explorerLink, '_blank', 'noopener noreferrer')
          return
        }
        chainId = sanitizeChainIdForCompass(chainId)
      }
      const chain = chains?.find((chain) => chain.chainId === chainId)
      if (!chain) return

      const explorerTxnUrl = getExplorerTxnUrl(txHash, chain.txExplorer?.mainnet?.txUrl ?? '')
      window.open(explorerTxnUrl, '_blank', 'noopener noreferrer')
    },
    [
      chains,
      getExplorerTxnUrl,
      response?.packetTxs?.receiveTx?.explorerLink,
      response?.packetTxs?.sendTx?.explorerLink,
    ],
  )

  const { status, txData } = useMemo(() => {
    const packetTxs = response?.packetTxs
    const error = response?.error
    let _status: TransferState | undefined
    let _txData

    if (!packetTxs) {
      _status =
        actionIndex === 0 || transferSequenceIndex !== prevTransferSequenceIndex
          ? response?.state
          : undefined

      if (actionIndex === 0 && !_status) {
        _status = TRANSFER_STATE.TRANSFER_PENDING
      }

      return {
        status: _status,
        txData: _txData,
      }
    }

    if (error) {
      _status = TRANSFER_STATE.TRANSFER_FAILURE
      _txData = packetTxs.receiveTx
      if (transferSequenceIndex !== prevTransferSequenceIndex && prevAction === undefined) {
        _txData = undefined
      }
      if (!_txData && 'timeoutTx' in packetTxs) {
        _txData = packetTxs?.timeoutTx
      }
      if (!_txData) {
        _txData = packetTxs?.sendTx
      }

      return {
        status: _status,
        txData: _txData,
      }
    }

    if (
      transferSequenceIndex === prevTransferSequenceIndex ||
      (prevAction !== undefined && prevAction?.type !== action?.type)
    ) {
      if (packetTxs?.receiveTx) {
        _status = TRANSFER_STATE.TRANSFER_SUCCESS
        _txData = packetTxs?.receiveTx
      } else if (packetTxs?.sendTx) {
        _status = TRANSFER_STATE.TRANSFER_PENDING
      }
    } else {
      if (packetTxs?.sendTx) {
        _status = TRANSFER_STATE.TRANSFER_SUCCESS
        _txData = packetTxs?.sendTx
      } else {
        _status = TRANSFER_STATE.TRANSFER_PENDING
      }
    }

    return { status: _status, txData: _txData }
  }, [
    action?.type,
    prevAction,
    actionIndex,
    prevTransferSequenceIndex,
    response?.error,
    response?.packetTxs,
    response?.state,
    transferSequenceIndex,
  ])

  const { txHash, chainId } = useMemo(() => {
    if (!txData) return { txHash: undefined, chainId: undefined }
    if ('txHash' in txData) {
      return {
        txHash: txData?.txHash,
        chainId: txData?.chainID,
      }
    }
    // TODO: fix this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return { txHash: (txData as unknown)?.tx_hash, chainId: (txData as unknown)?.chain_id }
  }, [txData])

  return (
    <div className={'flex my-1 w-full flex-row justify-start items-start gap-[12px]'}>
      <div className='py-[2px] flex flex-col gap-2 justify-start items-center'>
        <TxStepsStatusIcon state={status} denomData={srcDenomData} />
        {!isLast && <div className='w-[2px] h-[11px] bg-gray-100 dark:bg-gray-850 rounded-sm' />}
      </div>
      <div className='flex w-full flex-col justify-start items-start gap-0'>
        <div className='flex-row flex w-full justify-between items-center'>
          <div className='dark:text-white-100 font-bold text-black-100 text-md max-[350px]:!text-sm !leading-[21.6px] max-[350px]:!leading-[19.6px]'>
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
                className='text-gray-400 dark:text-gray-600'
              >
                <ArrowSquareOut size={16} className='!leading-4 !text-md' />
              </button>
            )}
          </>
        </div>
        <div>
          <div className='text-gray-400 font-medium dark:text-gray-600 text-sm max-[350px]:!text-xs !leading-[18.9px]'>
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
