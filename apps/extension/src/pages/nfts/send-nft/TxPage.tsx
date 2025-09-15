import { DeliverTxResponse, isDeliverTxSuccess } from '@cosmjs/stargate'
import {
  CosmosTxType,
  getMetaDataForSendTx,
  LeapWalletApi,
  useActiveChain,
  useAddress,
  useChainId,
  useGetExplorerTxnUrl,
  usePendingTxState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { CaretRight } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { activityStore } from 'stores/activity-store'
import { rootBalanceStore } from 'stores/root-store'
import { formatTokenAmount, sliceWord } from 'utils/strings'

export enum TxType {
  SEND = 'Send',
  NFTSEND = 'NFTSend',
}

const TxPage = observer(
  ({
    isOpen,
    onClose,
    txType,
  }: {
    isOpen: boolean
    onClose: (clear?: boolean) => void
    txType: TxType
  }) => {
    const navigate = useNavigate()
    const [txHash, setTxHash] = useState('')
    const { pendingTx, setPendingTx } = usePendingTxState()
    const txPostToDB = LeapWalletApi.useOperateCosmosTx()

    const {
      txStatus,
      txHash: _txHash,
      sourceChain,
      sourceNetwork,
      toAddress,
      toChain,
      sentAmount,
      sentTokenInfo,
    } = pendingTx ?? {}

    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => sourceChain || _activeChain, [_activeChain, sourceChain])

    const _selectedNetwork = useSelectedNetwork()
    const selectedNetwork = useMemo(
      () => sourceNetwork || _selectedNetwork,
      [_selectedNetwork, sourceNetwork],
    )

    const activeChainId = useChainId(activeChain, selectedNetwork)
    const address = useAddress(activeChain)

    const invalidateBalances = useCallback(() => {
      rootBalanceStore.refetchBalances(activeChain, selectedNetwork)
      if (toAddress) {
        rootBalanceStore.refetchBalances(toChain ?? activeChain, selectedNetwork, {
          [toChain ?? activeChain]: toAddress,
        })
      }
    }, [activeChain, selectedNetwork, toAddress, toChain])

    const copies = useMemo(() => {
      switch (txType) {
        case TxType.SEND:
          return {
            title:
              txStatus === 'loading'
                ? 'Transaction in progress'
                : txStatus === 'success' || txStatus === 'submitted'
                ? 'Transfer successful!'
                : 'Transfer failed',
            subtite:
              txStatus === 'loading'
                ? 'Tokens will be deposited in recipient’s account once the transaction is complete'
                : txStatus === 'success' || txStatus === 'submitted'
                ? `You sent ${formatTokenAmount(
                    sentAmount ?? '',
                    sentTokenInfo?.coinDenom,
                  )} to ${sliceWord(toAddress ?? '', 7, 3)}`
                : '',
          }
        case TxType.NFTSEND:
          return {
            title:
              txStatus === 'loading'
                ? 'Transfer in progress'
                : txStatus === 'success' || txStatus === 'submitted'
                ? 'Transfer successful!'
                : 'Transfer failed',
            subtite:
              txStatus === 'loading'
                ? 'NFT will be deposited in recipient’s account once the transaction is complete'
                : txStatus === 'success' || txStatus === 'submitted'
                ? 'NFT has been deposited in recipient’s account'
                : '',
          }
      }
    }, [sentAmount, toAddress, txStatus, txType])

    useEffect(() => {
      const invalidateQueries = () => {
        invalidateBalances()
        activityStore.invalidateActivity(activeChain)
      }

      if (pendingTx && pendingTx.promise) {
        pendingTx.promise
          .then(async (result) => {
            if ('code' in result) {
              if (result && isDeliverTxSuccess(result as DeliverTxResponse)) {
                setPendingTx({ ...pendingTx, txStatus: 'success' })
              } else {
                setPendingTx({ ...pendingTx, txStatus: 'failed' })
              }
            } else if (pendingTx.txType === 'cw20TokenTransfer') {
              setPendingTx({ ...pendingTx, txStatus: 'success' })
            } else if ('status' in result) {
              setPendingTx({ ...pendingTx, txStatus: 'submitted' })
            } else if ('result' in result) {
              // solana
              if ((result as any)?.result?.value?.err) {
                setPendingTx({ ...pendingTx, txStatus: 'failed' })
              } else {
                setPendingTx({
                  ...pendingTx,
                  txHash: (result as any)?.signature,
                  txStatus: 'success',
                })
                const metadata = getMetaDataForSendTx(pendingTx?.toAddress ?? '', {
                  amount: new BigNumber(pendingTx.sentAmount ?? '')
                    .times(10 ** (pendingTx.sentTokenInfo?.coinDecimals ?? 9))
                    .toString(),
                  denom: pendingTx.sentTokenInfo?.coinMinimalDenom ?? '',
                })
                txPostToDB({
                  txHash: (result as any)?.signature,
                  txType: CosmosTxType.Send,
                  metadata: metadata,
                  feeQuantity: pendingTx.feeQuantity,
                  feeDenomination: pendingTx.feeDenomination,
                  amount: pendingTx.txnLogAmount,
                  forceChain: activeChain,
                  forceNetwork: selectedNetwork,
                  forceWalletAddress: address,
                  chainId: activeChainId,
                  isSolana: true,
                })
              }
            } else if ('suiResult' in result) {
              // sui
              if ((result?.suiResult as any)?.status === 'success') {
                setPendingTx({
                  ...pendingTx,
                  txHash: (result?.suiResult as any)?.txHash,
                  txStatus: 'success',
                })
              } else {
                setPendingTx({ ...pendingTx, txStatus: 'failed' })
              }
            } else if ('aptosResult' in result) {
              // aptos
              if ((result?.aptosResult as any)?.success === true) {
                setPendingTx({
                  ...pendingTx,
                  txHash: (result?.aptosResult as any)?.hash,
                  txStatus: 'success',
                })
              } else {
                setPendingTx({ ...pendingTx, txStatus: 'failed' })
              }
            }
            if (pendingTx.txType === 'cw20TokenTransfer') {
              setTxHash(result.transactionHash)

              txPostToDB({
                txHash: result.transactionHash,
                txType: CosmosTxType.Send,
                metadata: getMetaDataForSendTx(pendingTx?.toAddress ?? '', {
                  amount: new BigNumber(pendingTx.sentAmount ?? '')
                    .times(10 ** (pendingTx.sentTokenInfo?.coinDecimals ?? 6))
                    .toString(),
                  denom: pendingTx.sentTokenInfo?.coinMinimalDenom ?? '',
                }),
                feeQuantity: pendingTx.feeQuantity,
                feeDenomination: pendingTx.feeDenomination,
                amount: pendingTx.txnLogAmount,
                forceChain: activeChain,
                forceNetwork: selectedNetwork,
                forceWalletAddress: address,
                chainId: activeChainId,
              })
            }

            invalidateQueries()
          })
          .catch(() => {
            if (pendingTx.txType === 'cw20TokenTransfer') {
              setPendingTx({ ...pendingTx, txStatus: 'failed' })
            } else if (pendingTx.txType === 'send') {
              setPendingTx({ ...pendingTx, txStatus: 'failed' })
            }

            invalidateQueries()
          })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChain, address, selectedNetwork, activeChainId])

    useEffect(() => {
      if (_txHash) setTxHash(_txHash)
    }, [_txHash])

    const { explorerTxnUrl: _txnUrl } = useGetExplorerTxnUrl({
      forceTxHash: txHash,
      forceChain: activeChain,
      forceNetwork: selectedNetwork,
    })

    const txnUrl = useMemo(() => {
      if (txHash) {
        return _txnUrl
      }
      return undefined
    }, [_txnUrl, txHash])

    return (
      <BottomModal
        title={''}
        fullScreen={true}
        onClose={onClose}
        isOpen={isOpen}
        containerClassName='h-full'
        headerClassName='dark:bg-gray-950 bg-white-100'
        className='dark:bg-gray-950 bg-white-100 !p-0 min-h-[calc(100%-65px)]'
      >
        <div className='flex flex-col gap-y-8 justify-center items-center px-10 mt-[75px]'>
          <div className='h-[100px] w-[100px]'>
            {txStatus === 'loading' && (
              <div className='h-[100px] w-[100px] p-8 rounded-full bg-secondary-200 animate-spin'>
                <img src={Images.Swap.Rotate} />
              </div>
            )}
            {(txStatus === 'success' || txStatus === 'submitted') && (
              <div className='h-[100px] w-[100px] p-8 rounded-full bg-green-400'>
                <img src={Images.Swap.CheckGreen} />
              </div>
            )}
            {txStatus === 'failed' && (
              <div className='h-[100px] w-[100px] p-8 rounded-full bg-red-600 dark:bg-red-400'>
                <img src={Images.Swap.FailedRed} />
              </div>
            )}
          </div>
          <div className='flex flex-col items-center gap-y-6'>
            <div className='flex flex-col items-center gap-y-3'>
              <Text size='xl' color='text-monochrome' className='font-bold'>
                {copies.title}
              </Text>
              {copies.subtite ? (
                <Text size='sm' color='text-secondary-800' className='font-normal text-center'>
                  {copies.subtite}
                </Text>
              ) : null}
            </div>

            {txnUrl ? (
              <a
                target='_blank'
                rel='noreferrer'
                href={txnUrl}
                className='flex font-medium items-center gap-1 text-sm text-accent-green hover:text-accent-green-200 transition-colors'
              >
                View transaction
                <CaretRight size={12} />
              </a>
            ) : null}
          </div>
        </div>
        <div className=' flex flex-row items-center justify-between gap-4 absolute bottom-0 left-0 right-0 p-6 max-[350px]:!px-4 !z-[1000]'>
          <Button
            className='flex-1'
            variant='mono'
            style={{ boxShadow: 'none' }}
            onClick={() => {
              navigate('/home')
            }}
          >
            Home
          </Button>
          <Button
            className={classNames(`flex-1`, {
              'cursor-no-drop': txStatus !== 'success' && txStatus !== 'submitted',
            })}
            style={{ boxShadow: 'none' }}
            onClick={() => {
              onClose(txStatus !== 'failed')
            }}
            disabled={txStatus !== 'success' && txStatus !== 'submitted'}
          >
            {txStatus === 'failed' ? 'Try Again' : 'Transfer Again'}
          </Button>
        </div>
      </BottomModal>
    )
  },
)

export default TxPage
