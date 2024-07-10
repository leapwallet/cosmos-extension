import {
  sliceAddress,
  useformatCurrency,
  useGetChains,
  useIsERC20Token,
  useIsSeiEvmChain,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfos,
  getSeiEvmAddressToShow,
  isEthAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { EthWallet } from '@leapwallet/leap-keychain'
import { Avatar, Buttons } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useMemo } from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'

import { useExecuteSkipTx } from './executeSkipTx'

type ReviewTransactionSheetProps = {
  isOpen: boolean
  onClose: () => void
}

export const ReviewTransferSheet: React.FC<ReviewTransactionSheetProps> = ({ isOpen, onClose }) => {
  const [formatCurrency] = useformatCurrency()
  const defaultTokenLogo = useDefaultTokenLogo()
  const chains = useGetChains()
  const getWallet = Wallet.useGetWallet()
  const isERC20Token = useIsERC20Token()
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

  const handleSend = useCallback(async () => {
    clearTxError()
    if (!fee || !selectedAddress?.address || !selectedToken) {
      return
    }

    try {
      let toAddress = selectedAddress.address
      const _isERC20Token = isERC20Token(selectedToken)

      if (
        isSeiEvmChain &&
        _isERC20Token &&
        toAddress.toLowerCase().startsWith(chains[sendActiveChain].addressPrefix) &&
        fetchAccountDetailsData?.pubKey.key
      ) {
        toAddress = getSeiEvmAddressToShow(fetchAccountDetailsData.pubKey.key)
      }

      if (selectedAddress.address.toLowerCase().startsWith('0x') && associatedSeiAddress) {
        toAddress = associatedSeiAddress
      }

      if (isSeiEvmChain && isEthAddress(toAddress)) {
        const wallet = await getWallet(sendActiveChain, true)
        await confirmSendEth(
          toAddress,
          inputAmount,
          userPreferredGasLimit ?? gasEstimate,
          wallet as unknown as EthWallet,
          parseInt(String(Number(userPreferredGasPrice?.amount.toString()) * 10 ** 18)),
          {
            isERC20Token: _isERC20Token,
            contractAddress: selectedToken.coinMinimalDenom,
            decimals: selectedToken.coinDecimals,
          },
        )
      } else if (transferData?.isSkipTransfer && !isIbcUnwindingDisabled && isIBCTransfer) {
        // If skiptranfer is supported and ibc unwinding in not disabled and it is ibc transfer
        // we use Skip API for transfer or
        // else we use default Cosmos API

        confirmSkipTx()
      } else {
        await confirmSend({
          selectedToken: selectedToken,
          toAddress: associatedSeiAddress || selectedAddress?.address || '',
          amount: new BigNumber(inputAmount),
          memo: memo,
          fees: fee,
        })
      }
    } catch (err: unknown) {
      captureException(err)
    }
  }, [
    clearTxError,
    fee,
    selectedAddress?.address,
    selectedToken,
    isERC20Token,
    isSeiEvmChain,
    chains,
    sendActiveChain,
    associatedSeiAddress,
    fetchAccountDetailsData?.pubKey.key,
    transferData?.isSkipTransfer,
    isIbcUnwindingDisabled,
    isIBCTransfer,
    getWallet,
    confirmSendEth,
    inputAmount,
    userPreferredGasLimit,
    gasEstimate,
    userPreferredGasPrice?.amount,
    confirmSkipTx,
    confirmSend,
    memo,
  ])

  useCaptureTxError(txError)
  if ((showLedgerPopup || showLedgerPopupSkipTx) && !txError) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup || showLedgerPopupSkipTx} />
  }

  return (
    <BottomModal
      isOpen={isOpen}
      closeOnBackdropClick={true}
      onClose={handleClose}
      title='Review Transaction'
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
    >
      <div className='flex flex-col items-center w-full gap-y-4'>
        <div className='w-full flex items-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900'>
          <div className='flex flex-col flex-1 items-center'>
            <Avatar
              avatarImage={selectedToken?.img ?? defaultTokenLogo}
              chainIcon={chains?.[sendActiveChain]?.chainSymbolImageUrl}
              size='sm'
              avatarOnError={imgOnError(defaultTokenLogo)}
              className='mb-4 bg-gray-100 dark:bg-gray-850 rounded-full p-2 !h-11 !w-11'
            />

            <p
              className='text-sm text-black-100 dark:text-white-100 font-bold mb-1'
              data-testing-id='send-review-sheet-inputAmount-ele'
            >
              {inputAmount} {selectedToken?.symbol ? ` ${selectedToken.symbol}` : ''}
            </p>

            <p className='text-xs text-gray-800 dark:text-gray-200 font-medium'>
              {fiatValue} &middot; on {chains?.[sendActiveChain]?.chainName}
            </p>
          </div>

          <div className='material-icons-round !text-md text-black-100 dark:text-white-100 bg-gray-100 dark:bg-gray-850 rounded-full p-[6px]'>
            arrow_forward
          </div>
          <div className='flex flex-col flex-1 items-center'>
            <Avatar
              avatarImage={selectedAddress?.avatarIcon}
              emoji={selectedAddress?.emoji}
              chainIcon={selectedAddress?.chainIcon}
              size='sm'
              avatarOnError={imgOnError(defaultTokenLogo)}
              className='mb-4 bg-gray-100 dark:bg-gray-850 rounded-full p-2 !h-11 !w-11'
            />

            <p
              className='text-sm text-black-100 dark:text-white-100 font-bold mb-1'
              data-testing-id='send-review-sheet-to-ele'
            >
              {selectedAddress?.ethAddress && selectedAddress?.chainName !== 'injective'
                ? sliceAddress(selectedAddress.ethAddress)
                : selectedAddress?.selectionType === 'currentWallet'
                ? selectedAddress?.name?.split('-')[0]
                : selectedAddress?.name}
            </p>

            <p className='text-xs text-gray-800 dark:text-gray-200 font-medium'>
              on {ChainInfos?.[selectedAddress?.chainName as SupportedChain]?.chainName} <br />
            </p>
          </div>
        </div>

        {memo ? (
          <div className='w-full flex items-baseline gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900'>
            <p className='text-sm text-gray-800 dark:text-gray-200 font-bold'>Memo</p>
            <p className='font-medium text-md text-black-100 dark:text-white-100'>{memo}</p>
          </div>
        ) : null}

        <Buttons.Generic
          color={Colors.green600}
          size='normal'
          title='Send'
          className='w-full mt-2'
          onClick={handleSend}
          disabled={showLedgerPopup || isSending || sendDisabled || txnProcessing}
          data-testing-id='send-review-sheet-send-btn'
        >
          {isSending || txnProcessing ? 'Sending...' : 'Confirm Send'}
        </Buttons.Generic>
        {txError || error ? <ErrorCard text={txError || error} /> : null}
      </div>
    </BottomModal>
  )
}
