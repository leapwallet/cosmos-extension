import {
  formatTokenAmount,
  isERC20Token,
  sliceAddress,
  TxCallback,
  useformatCurrency,
  useGetChains,
  useIsSeiEvmChain,
} from '@leapwallet/cosmos-wallet-hooks'
import { LeapLedgerSignerEth, pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { EthWallet } from '@leapwallet/leap-keychain'
import { ArrowDown } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { Button } from 'components/ui/button'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send/context'
import React, { useCallback, useMemo } from 'react'
import { rootERC20DenomsStore } from 'stores/denoms-store-instance'

import { useExecuteSkipTx } from './executeSkipTx'

type ReviewTransactionSheetProps = {
  isOpen: boolean
  onClose: () => void
  setShowTxPage: (val: boolean) => void
}

export const ReviewTransferSheet = observer(
  ({ isOpen, onClose, setShowTxPage }: ReviewTransactionSheetProps) => {
    const [formatCurrency] = useformatCurrency()
    const defaultTokenLogo = useDefaultTokenLogo()
    const chains = useGetChains()
    const getWallet = Wallet.useGetWallet()
    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms
    const isSeiEvmChain = useIsSeiEvmChain()

    const {
      memo,
      selectedToken,
      selectedAddress,
      fee,
      showLedgerPopup,
      inputAmount,
      tokenFiatValue,
      isSending,
      txError,
      isIBCTransfer,
      sendDisabled,
      confirmSend,
      confirmSendEth,
      clearTxError,
      userPreferredGasPrice,
      userPreferredGasLimit,
      gasEstimate,
      transferData,
      isIbcUnwindingDisabled,
      fetchAccountDetailsData,
      associatedSeiAddress,
      sendActiveChain,
      associated0xAddress,
      setIsSending,
      isSeiEvmTransaction,
      hasToUsePointerLogic,
      pointerAddress,
    } = useSendContext()

    const { confirmSkipTx, txnProcessing, error, showLedgerPopupSkipTx, setError } =
      useExecuteSkipTx()
    const fiatValue = useMemo(
      () => formatCurrency(new BigNumber(inputAmount).multipliedBy(tokenFiatValue ?? 0)),
      [formatCurrency, inputAmount, tokenFiatValue],
    )

    const handleClose = useCallback(() => {
      setError('')
      onClose()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const modifiedCallback: TxCallback = useCallback(
      (status) => {
        setShowTxPage(true)
        onClose()
      },
      [onClose, setShowTxPage],
    )

    const handleSend = useCallback(async () => {
      clearTxError()
      if (!fee || !selectedAddress?.address || !selectedToken) {
        return
      }

      try {
        let toAddress = selectedAddress.address
        const _isERC20Token = isERC20Token(
          Object.keys(allERC20Denoms),
          selectedToken?.coinMinimalDenom,
        )

        if (
          (isSeiEvmChain || chains[sendActiveChain]?.evmOnlyChain) &&
          _isERC20Token &&
          toAddress.toLowerCase().startsWith(chains[sendActiveChain].addressPrefix) &&
          fetchAccountDetailsData?.pubKey.key
        ) {
          toAddress = pubKeyToEvmAddressToShow(fetchAccountDetailsData.pubKey.key)
        }

        if (selectedAddress.address.toLowerCase().startsWith('0x') && associatedSeiAddress) {
          toAddress = associatedSeiAddress
        }

        if (associated0xAddress) {
          toAddress = associated0xAddress
        }

        if (isSeiEvmTransaction || chains[sendActiveChain]?.evmOnlyChain) {
          const wallet = await getWallet(sendActiveChain, true)
          const nativeTokenKey = Object.keys(chains[sendActiveChain]?.nativeDenoms ?? {})?.[0]

          await confirmSendEth(
            toAddress,
            inputAmount,
            userPreferredGasLimit ?? gasEstimate,
            wallet as unknown as EthWallet,
            modifiedCallback,
            parseInt(userPreferredGasPrice?.amount?.toString() ?? ''),
            {
              isERC20Token: _isERC20Token || hasToUsePointerLogic,
              contractAddress: hasToUsePointerLogic
                ? pointerAddress
                : selectedToken.coinMinimalDenom,
              decimals: selectedToken.coinDecimals,
              nativeTokenKey,
            },
          )
        } else if (
          transferData?.isSkipTransfer &&
          !isIbcUnwindingDisabled &&
          (isIBCTransfer || selectedAddress?.address?.startsWith('init'))
        ) {
          // If skiptranfer is supported and ibc unwinding in not disabled and it is ibc transfer
          // we use Skip API for transfer or
          // else we use default Cosmos API

          const wallet = await getWallet(sendActiveChain, true)
          if (sendActiveChain === 'evmos' && wallet instanceof LeapLedgerSignerEth) {
            await confirmSend(
              {
                selectedToken: selectedToken,
                toAddress: associatedSeiAddress || selectedAddress?.address || '',
                amount: new BigNumber(inputAmount),
                memo: memo,
                fees: fee,
              },
              modifiedCallback,
            )
          } else {
            confirmSkipTx()
          }
        } else {
          await confirmSend(
            {
              selectedToken: selectedToken,
              toAddress: associatedSeiAddress || selectedAddress?.address || '',
              amount: new BigNumber(inputAmount),
              memo: memo,
              fees: fee,
            },
            modifiedCallback,
          )
        }
      } catch (err: unknown) {
        setIsSending(false)
        captureException(err)
      }
    }, [
      clearTxError,
      fee,
      selectedAddress?.address,
      selectedToken,
      allERC20Denoms,
      isSeiEvmChain,
      chains,
      sendActiveChain,
      fetchAccountDetailsData?.pubKey.key,
      associatedSeiAddress,
      associated0xAddress,
      isSeiEvmTransaction,
      transferData?.isSkipTransfer,
      isIbcUnwindingDisabled,
      isIBCTransfer,
      getWallet,
      confirmSendEth,
      inputAmount,
      userPreferredGasLimit,
      gasEstimate,
      modifiedCallback,
      userPreferredGasPrice?.amount,
      hasToUsePointerLogic,
      pointerAddress,
      confirmSend,
      memo,
      confirmSkipTx,
      setIsSending,
    ])

    useCaptureTxError(txError)
    if ((showLedgerPopup || showLedgerPopupSkipTx) && !txError) {
      return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup || showLedgerPopupSkipTx} />
    }

    return (
      <BottomModal
        isOpen={isOpen}
        onClose={handleClose}
        title='Review transfer'
        className='p-6 !pt-8'
      >
        <div className='flex flex-col items-center w-full gap-4 relative'>
          <div className='bg-secondary-100 p-6 rounded-xl flex w-full justify-between items-center'>
            <div className='flex flex-col gap-1'>
              <p
                className='text-lg text-monochrome font-bold !leading-[27px]'
                data-testing-id='send-review-sheet-inputAmount-ele'
              >
                {formatTokenAmount(inputAmount, selectedToken?.symbol ?? '')}
              </p>

              <p className='text-sm text-muted-foreground !leading-[18.9px]'>{fiatValue}</p>
            </div>
            <img src={selectedToken?.img ?? defaultTokenLogo} width={48} height={48} />
          </div>

          <ArrowDown
            size={40}
            className={classNames(
              'absolute top-[108px] rounded-full bg-accent-blue-200 flex items-center justify-center border-[5px] border-gray-50 dark:border-black-100 -mt-[18px] -mb-[18px] p-[5px]',
            )}
          />

          <div className='bg-secondary-200 p-6 rounded-xl flex w-full justify-between items-center'>
            <p
              className='text-lg text-monochrome font-bold !leading-[27px]'
              data-testing-id='send-review-sheet-to-ele'
            >
              {selectedAddress?.ethAddress
                ? sliceAddress(selectedAddress.ethAddress)
                : selectedAddress?.selectionType === 'currentWallet'
                ? selectedAddress?.name?.split('-')[0]
                : sliceAddress(selectedAddress?.address)}
            </p>
            <img src={Images.Misc.getWalletIconAtIndex(0)} width={48} height={48} />
          </div>

          {memo ? (
            <div className='w-full flex items-baseline gap-2.5 p-5 rounded-xl bg-secondary-100 border border-secondary mt-0.5'>
              <p className='text-sm text-muted-foreground font-medium'>Memo:</p>
              <p className='font-medium text-sm text-monochrome !leading-[22.4px] overflow-auto break-words'>
                {memo}
              </p>
            </div>
          ) : null}

          {txError || error ? <ErrorCard text={txError || error} /> : null}
          <Button
            className='w-full mt-4'
            onClick={handleSend}
            disabled={showLedgerPopup || isSending || sendDisabled || txnProcessing}
            data-testing-id='send-review-sheet-send-btn'
          >
            {isSending || txnProcessing ? 'Sending...' : 'Confirm transfer'}
          </Button>
        </div>
      </BottomModal>
    )
  },
)
