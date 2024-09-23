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
  useAddress,
  useChainId,
  useGetExplorerTxnUrl,
  useInvalidateActivity,
  useMobileAppBanner,
  usePendingTxState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { RootBalanceStore, RootStakeStore } from '@leapwallet/cosmos-wallet-store'
import { Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { ArrowSquareOut, CopySimple, UserCircle } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { Images } from 'images'
import { Cross } from 'images/misc'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { TxResponse } from 'secretjs'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { isCompassWallet } from 'utils/isCompassWallet'

const PENDING_TX_MOBILE_QR_CODE_BANNER = 'pending-tx-mobile-qr-code-banner'

const txStatusStyles = {
  loading: {
    title: 'In Progress...',
  },
  success: {
    title: 'Complete',
  },
  failed: {
    title: 'Failed',
  },
}

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

type PendingTxProps = {
  rootBalanceStore: RootBalanceStore
  rootStakeStore: RootStakeStore
}

const PendingTx = observer(({ rootBalanceStore, rootStakeStore }: PendingTxProps) => {
  const navigate = useNavigate()
  const [txHash, setTxHash] = useState('')
  const [showMobileQrCode, setShowMobileQrCode] = useState(
    sessionStorage.getItem(PENDING_TX_MOBILE_QR_CODE_BANNER) ? false : true,
  )
  const { theme } = useTheme()
  const copyTxHashRef = useRef<HTMLButtonElement>(null)
  const { pendingTx, setPendingTx } = usePendingTxState()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()

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
    sourceChain,
    sourceNetwork,
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
  }, [activeChain, rootBalanceStore, selectedNetwork])

  const invalidateDelegations = useCallback(() => {
    rootStakeStore.updateStake(activeChain, selectedNetwork, true)
  }, [activeChain, rootStakeStore, selectedNetwork])

  const invalidateActivity = useInvalidateActivity()

  useEffect(() => {
    const invalidateQueries = () => {
      invalidateBalances()
      invalidateDelegations()
      invalidateActivity(activeChain)
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
              forceChain: activeChain,
              forceNetwork: selectedNetwork,
              forceWalletAddress: address,
              chainId: activeChainId,
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
          }

          invalidateQueries()
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain, address, selectedNetwork, activeChainId])

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

  const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({
    forceTxHash: txHash,
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  })

  const isSendTxn = txType
    ? ['ibc/transfer', 'send', 'secretTokenTransfer', 'cw20TokenTransfer'].includes(txType)
    : false

  return (
    <PopupLayout>
      <Header title={`Transaction ${txStatusStyles[txStatus ?? 'loading'].title}`} />
      <div className='flex h-[calc(100%-72px)] p-6 flex-col items-center overflow-y-auto'>
        <div className='bg-white-100 dark:bg-gray-950 rounded-2xl w-full flex flex-col items-center p-4 mb-4'>
          {txStatus === 'loading' && (
            <LoaderAnimation color={Colors.green600} className='w-20 h-20' />
          )}
          {txStatus === 'success' && (
            <img src={Images.Activity.SendDetails} className='w-20 h-20' />
          )}
          {txStatus === 'failed' && <img src={Images.Activity.Error} className='w-20 h-20' />}

          <div className='text-xl font-bold text-black-100 dark:text-white-100 text-left mt-1 break-all'>
            {title1}
          </div>
          {isSendTxn ? (
            <div className='text-sm font-medium text-black-100 dark:text-white-100 mt-1'>
              {txStatus === 'success'
                ? 'sent successfully to'
                : txStatus === 'failed'
                ? 'failed sending to'
                : 'sending to'}
            </div>
          ) : null}
          {isSendTxn ? (
            <div className='flex rounded-full gap-[6px] py-[6px] pl-2 pr-3 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-black-100 dark:text-white-100 mt-2 items-center'>
              <UserCircle size={18} className='text-gray-200 dark:text-gray-800' />
              {subtitle1}
            </div>
          ) : (
            <div className='text-base text-gray-600 dark:text-gray-400 text-center break-all mt-1'>
              {subtitle1}
            </div>
          )}

          {!isSendTxn ? (
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
          ) : null}
        </div>

        {txHash && (
          <div
            className='rounded-2xl w-full mb-4 px-6 py-4 bg-white-100 dark:bg-gray-950 cursor-pointer flex items-center'
            onClick={() => {
              copyTxHashRef.current?.click()
              UserClipboard.copyText(txHash)
              setIsCopiedClick(true)
              setTimeout(() => setIsCopiedClick(false), 2000)
            }}
          >
            <div className='flex-1'>
              <div className='text-sm font-bold text-black-100 dark:text-white-100 mb-1'>
                Transaction ID
              </div>
              <div className='text-md font-medium text-gray-600 dark:text-gray-400'>
                {sliceAddress(txHash)}
              </div>
            </div>
            <Buttons.CopyWalletAddress
              copyIcon={Images.Activity.Copy}
              ref={copyTxHashRef}
              color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
              className={!isCopiedClick ? 'hidden' : ''}
            />

            {!isCopiedClick && (
              <span
                className='text-black-100 dark:text-white-100 bg-gray-50 dark:bg-gray-900 rounded-full p-2 ml-2'
                onClick={() => {
                  copyTxHashRef.current?.click()
                  UserClipboard.copyText(txHash)
                  setIsCopiedClick(true)
                  setTimeout(() => setIsCopiedClick(false), 2000)
                }}
              >
                <CopySimple size={20} />
              </span>
            )}

            {txnUrl && !isCopiedClick ? (
              <span
                className='text-black-100 dark:text-white-100 bg-gray-50 dark:bg-gray-900 rounded-full p-2 ml-2'
                onClick={(event) => {
                  event.stopPropagation()
                  window.open(txnUrl, '_blank')
                }}
              >
                <ArrowSquareOut size={20} className='text-black-100 dark:text-white-100' />
              </span>
            ) : null}
          </div>
        )}

        {!isCompassWallet() && showMobileQrCode && status === 'success' && data && data.visible ? (
          <MobileQrCode setShowMobileQrCode={setShowMobileQrCode} data={data} />
        ) : null}

        <div className='w-full flex gap-4 mt-auto'>
          <Buttons.Generic
            color={theme === ThemeName.DARK ? Colors.gray900 : Colors.gray300}
            size='normal'
            className='w-full'
            onClick={() => navigate('/home')}
          >
            <p className='!text-black-100 dark:!text-white-100'>Home</p>
          </Buttons.Generic>
          {isSendTxn && !title1?.toLowerCase()?.includes('nft') ? (
            <Buttons.Generic
              color={Colors.green600}
              size='normal'
              className='w-full'
              onClick={() =>
                navigate(
                  `/send?assetCoinDenom=${
                    sentTokenInfo?.ibcDenom || sentTokenInfo?.coinMinimalDenom
                  }`,
                  { replace: true },
                )
              }
              disabled={txStatus !== 'success'}
            >
              Send Again
            </Buttons.Generic>
          ) : null}
        </div>
      </div>
    </PopupLayout>
  )
})

export default PendingTx
