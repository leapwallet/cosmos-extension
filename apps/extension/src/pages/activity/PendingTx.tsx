import { isDeliverTxSuccess } from '@cosmjs/stargate'
import {
  CosmosTxType,
  formatTokenAmount,
  LeapWalletApi,
  sliceAddress,
  useActiveChain,
  useInvalidateActivity,
  useInvalidateDelegations,
  useInvalidateTokenBalances,
  usePendingTxState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { getMetaDataForSendTx } from '@leapwallet/cosmos-wallet-hooks/dist/send/get-metadata'
import { Buttons, GenericCard, Header } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { TxResponse } from 'secretjs'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { isCompassWallet } from 'utils/isCompassWallet'

export function PendingTx() {
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const navigate = useNavigate()
  const selectedNetwork = useSelectedNetwork()
  const [txHash, setTxHash] = useState('')

  const copyTxHashRef = useRef<HTMLButtonElement>(null)
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
          } else if (pendingTx.txType === 'cw20TokenTransfer') {
            setPendingTx({ ...pendingTx, txStatus: 'success' })
          } else if (pendingTx.txType === 'vote') {
            setPendingTx({ ...pendingTx, txStatus: 'success' })
          }

          if (pendingTx.txType === 'secretTokenTransfer') {
            setTxHash(result.transactionHash)

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
            })
          }

          if (pendingTx.txType === 'vote') {
            setTxHash(result.transactionHash)

            txPostToDB({
              txHash: result.transactionHash,
              txType: CosmosTxType.GovVote,
              metadata: {
                option: pendingTx.voteOption,
                proposalId: pendingTx.proposalId,
              },
              feeQuantity: pendingTx.feeQuantity,
              feeDenomination: pendingTx.feeDenomination,
            })
          }

          setTimeout(() => {
            invalidateQueries()
          }, 2000)
        })
        .catch(() => {
          if (pendingTx.txType === 'cw20TokenTransfer') {
            setPendingTx({ ...pendingTx, txStatus: 'failed' })
          }

          if (pendingTx.txType === 'vote') {
            setPendingTx({ ...pendingTx, txStatus: 'failed' })
          }

          setTimeout(() => {
            invalidateQueries()
          }, 2000)
        })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txPostToDB])

  const {
    txType,
    title1,
    subtitle1,
    sentTokenInfo,
    sentAmount,
    receivedAmount,
    sentUsdValue,
    receivedTokenInfo,
    txStatus,
    txHash: _txHash,
  } = pendingTx ?? {}

  useEffect(() => {
    if (_txHash) setTxHash(_txHash)
  }, [_txHash])

  const { formatHideBalance } = useHideAssets()

  const sentAmountInfo =
    sentAmount && sentTokenInfo ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom) : undefined
  const receivedAmountInfo =
    receivedAmount && receivedTokenInfo
      ? formatTokenAmount(receivedAmount, receivedTokenInfo.coinDenom)
      : undefined

  const balanceReduced = txType === 'delegate' || txType === 'send' || txType === 'liquidity/add'
  const balanceIncreased =
    txType === 'undelegate' || txType === 'receive' || txType === 'liquidity/remove'

  const txnUrl = useMemo(() => {
    if (!chainInfos[activeChain].txExplorer?.[selectedNetwork]?.txUrl || !txHash) return ''
    return `${chainInfos[activeChain].txExplorer?.[selectedNetwork]?.txUrl}/${txHash}`
  }, [chainInfos, activeChain, selectedNetwork, txHash])

  const txStatusStyles = {
    loading: {
      topColor: '#696969',
      title: 'Processing...',
    },
    success: {
      topColor: '#29A874',
      title: 'Success',
    },
    failed: {
      topColor: '#D10014',
      title: 'Failed',
    },
  }

  const handleCloseClick = () => {
    navigate('/home')
  }

  return (
    <PopupLayout>
      <Header
        topColor={txStatusStyles[txStatus ?? 'loading'].topColor}
        title={`Transaction ${txStatusStyles[txStatus ?? 'loading'].title}`}
      />
      <div className='flex flex-col h-[500px] items-center p-7'>
        <div className='bg-white-100 dark:bg-gray-900 rounded-2xl w-full flex flex-col items-center p-7'>
          {txStatus === 'loading' && <LoaderAnimation color='#29a874' className='w-16 h-16' />}
          {txStatus === 'success' && (
            <img src={Images.Activity.SendDetails} className='h-16 w-16 mb-3' />
          )}
          {txStatus === 'failed' && <img src={Images.Activity.Error} className='h-16 w-16 mb-3' />}

          <div className='text-xl font-bold text-black-100 dark:text-white-100 text-left mt-4'>
            {title1}
          </div>
          <div className='text-base text-gray-600 dark:text-gray-400 text-center break-all'>
            {subtitle1}
          </div>

          <div className='flex mt-2 space-x-2 text-sm items-center'>
            {txType === 'swap' ? (
              <>
                {receivedAmountInfo && (
                  <p className='text-right font-semibold text-green-600 dark:text-green-600'>
                    + {formatHideBalance(receivedAmountInfo)}
                  </p>
                )}
                {sentAmountInfo && (
                  <p className='text-right text-gray-600 dark:text-gray-400'>
                    - {formatHideBalance(sentAmountInfo)}
                  </p>
                )}
              </>
            ) : (
              <>
                {sentUsdValue && (
                  <p
                    className={classnames('text-right font-semibold', {
                      'text-black-100 dark:text-white-100': !balanceIncreased && !balanceReduced,
                      'text-red-600 dark:text-red-300': balanceReduced,
                      'text-green-600 dark:text-green-600': balanceIncreased,
                    })}
                  >
                    ({balanceReduced && '-'} ${formatHideBalance(Number(sentUsdValue).toFixed(2))})
                  </p>
                )}

                {sentAmountInfo && (
                  <p className={classnames('text-right text-gray-600 dark:text-gray-400')}>
                    {balanceReduced && '-'} {formatHideBalance(sentAmountInfo)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {txHash && (
          <div className='rounded-2xl overflow-hidden w-full m-4'>
            <GenericCard
              title='Transaction ID'
              img={<img className='mr-3' src={Images.Activity.TxHash} />}
              subtitle={sliceAddress(txHash)}
              onClick={() => {
                copyTxHashRef.current?.click()
                UserClipboard.copyText(txHash)
              }}
              size='md'
              icon={
                <Buttons.CopyWalletAddress
                  copyIcon={Images.Activity.Copy}
                  ref={copyTxHashRef}
                  color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                />
              }
            />
          </div>
        )}

        <div className='mt-auto flex gap-4 w-full'>
          <Buttons.Generic
            style={{ height: '48px', background: Colors.gray900, color: Colors.white100 }}
            onClick={handleCloseClick}
          >
            Close
          </Buttons.Generic>

          <Buttons.Generic
            disabled={!txnUrl}
            className='py-3'
            size='normal'
            onClick={() => window.open(txnUrl, '_blank')}
          >
            <div className={'flex justify-center text-black-100  items-center'}>
              <span className='mr-2 material-icons-round'>open_in_new</span>
              <span>Explorer</span>
            </div>
          </Buttons.Generic>
        </div>
      </div>
    </PopupLayout>
  )
}
