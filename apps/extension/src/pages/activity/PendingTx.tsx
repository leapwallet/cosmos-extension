import { isDeliverTxSuccess } from '@cosmjs/stargate'
import {
  CosmosTxType,
  formatTokenAmount,
  getMetaDataForSecretTokenTransfer,
  getMetaDataForSendTx,
  LeapWalletApi,
  MobileAppBanner,
  sliceAddress,
  useActiveChain,
  useGetExplorerTxnUrl,
  useInvalidateActivity,
  useInvalidateDelegations,
  useInvalidateTokenBalances,
  useMobileAppBanner,
  usePendingTxState,
} from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, GenericCard, Header } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import { InfoCard } from 'components/info-card'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { Images } from 'images'
import { Cross } from 'images/misc'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { TxResponse } from 'secretjs'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { isCompassWallet } from 'utils/isCompassWallet'

const PENDING_TX_MOBILE_QR_CODE_BANNER = 'pending-tx-mobile-qr-code-banner'

function MobileQrCode({
  setShowMobileQrCode,
  data,
}: {
  setShowMobileQrCode: React.Dispatch<React.SetStateAction<boolean>>
  data: MobileAppBanner
}) {
  const handleClose = () => {
    setShowMobileQrCode(false)
    sessionStorage.setItem(PENDING_TX_MOBILE_QR_CODE_BANNER, 'true')
  }

  return (
    <div className='mb-4 relative'>
      <img src={data.img_src} />
      <button className='absolute top-[20px] right-[20px] w-[8px]' onClick={handleClose}>
        <img src={Cross} />
      </button>
    </div>
  )
}

export default function PendingTx() {
  const activeChain = useActiveChain()
  const navigate = useNavigate()
  const [txHash, setTxHash] = useState('')
  const [showMobileQrCode, setShowMobileQrCode] = useState(
    sessionStorage.getItem(PENDING_TX_MOBILE_QR_CODE_BANNER) ? false : true,
  )

  const copyTxHashRef = useRef<HTMLButtonElement>(null)
  const { pendingTx, setPendingTx } = usePendingTxState()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const invalidateBalances = useInvalidateTokenBalances()
  const invalidateDelegations = useInvalidateDelegations()
  const invalidateActivity = useInvalidateActivity()

  useEffect(() => {
    const invalidateQueries = () => {
      invalidateBalances(activeChain)
      invalidateDelegations()
      invalidateActivity()
    }

    if (pendingTx && pendingTx.promise) {
      pendingTx.promise
        .then(async (result) => {
          if ('code' in result) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (result && isDeliverTxSuccess(result)) {
              setPendingTx({ ...pendingTx, txStatus: 'success' })
            } else {
              setPendingTx({ ...pendingTx, txStatus: 'failed' })
            }
          } else if (pendingTx.txType === 'cw20TokenTransfer') {
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
              metadata: getMetaDataForSecretTokenTransfer(
                pendingTx.sentTokenInfo?.coinMinimalDenom ?? '',
              ),
              feeQuantity,
              feeDenomination: 'uscrt',
              amount: pendingTx.txnLogAmount,
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
              amount: pendingTx.txnLogAmount,
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
    isEvmTx,
  } = pendingTx ?? {}

  useEffect(() => {
    if (_txHash) setTxHash(_txHash)
  }, [_txHash])

  const { formatHideBalance } = useHideAssets()
  const { status, data } = useMobileAppBanner()
  const [isCopiedClick, setIsCopiedClick] = useState(false)

  const sentAmountInfo =
    sentAmount && sentTokenInfo ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom) : undefined
  const receivedAmountInfo =
    receivedAmount && receivedTokenInfo
      ? formatTokenAmount(receivedAmount, receivedTokenInfo.coinDenom)
      : undefined

  const balanceReduced = txType === 'delegate' || txType === 'send' || txType === 'liquidity/add'
  const balanceIncreased =
    txType === 'undelegate' || txType === 'receive' || txType === 'liquidity/remove'

  const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({ forceTxHash: txHash })
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
      <div className='flex h-[528px] p-7'>
        <div
          className={classnames({
            'overflow-y-auto': showMobileQrCode,
            'flex flex-col items-center': !showMobileQrCode,
          })}
        >
          <div className='bg-white-100 dark:bg-gray-900 rounded-2xl w-full flex flex-col items-center p-3 mb-4'>
            {txStatus === 'loading' && <LoaderAnimation color='#29a874' className='w-16 h-16' />}
            {txStatus === 'success' && (
              <img src={Images.Activity.SendDetails} className='h-16 w-16' />
            )}
            {txStatus === 'failed' && <img src={Images.Activity.Error} className='h-16 w-16' />}

            <div className='text-xl font-bold text-black-100 dark:text-white-100 text-left mt-4 break-all'>
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
                      ({balanceReduced && '-'} ${formatHideBalance(Number(sentUsdValue).toFixed(2))}
                      )
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
            <div className='rounded-2xl overflow-hidden w-full mb-4'>
              <GenericCard
                title='Transaction ID'
                img={<img className='mr-3' src={Images.Activity.TxHash} />}
                subtitle={sliceAddress(txHash)}
                onClick={() => {
                  copyTxHashRef.current?.click()
                  UserClipboard.copyText(txHash)
                  setIsCopiedClick(true)
                  setTimeout(() => setIsCopiedClick(false), 2000)
                }}
                size='md'
                icon={
                  <>
                    <Buttons.CopyWalletAddress
                      copyIcon={Images.Activity.Copy}
                      ref={copyTxHashRef}
                      color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                    />

                    {txnUrl && !isCopiedClick ? (
                      <span
                        className='material-icons-round text-[#9E9E9E]'
                        onClick={(event) => {
                          event.stopPropagation()
                          window.open(txnUrl, '_blank')
                        }}
                      >
                        open_in_new
                      </span>
                    ) : null}
                  </>
                }
              />
            </div>
          )}

          {!isCompassWallet() &&
          showMobileQrCode &&
          status === 'success' &&
          data &&
          data.visible ? (
            <MobileQrCode setShowMobileQrCode={setShowMobileQrCode} data={data} />
          ) : null}

          {isCompassWallet() &&
          title1?.toLowerCase().includes('sent nft') &&
          isEvmTx &&
          txStatus === 'success' ? (
            <InfoCard
              className='mb-4'
              message='Add your NFTs via Manage Collection in the other wallet for it to show up'
            />
          ) : null}

          <Buttons.Generic size='normal' onClick={handleCloseClick} className='mt-auto w-full'>
            Done
          </Buttons.Generic>
        </div>
      </div>
    </PopupLayout>
  )
}
