import {
  sliceAddress,
  Token,
  useActiveChain,
  useformatCurrency,
  useGasAdjustmentForChain,
} from '@leapwallet/cosmos-wallet-hooks'
import { Avatar, Buttons, Card, CardDivider, Memo } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import Badge from 'components/badge/Badge'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import { calculateFeeAmount } from 'components/gas-price-options'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { FIXED_FEE_CHAINS } from 'config/constants'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useMemo } from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'

import { FixedFee } from '../fees-view/FixedFee'
import { IBCBanner } from '../ibc-banner'

type ReviewTransactionSheetProps = {
  isOpen: boolean
  onClose: () => void
  themeColor: string
}

export const ReviewTransferSheet: React.FC<ReviewTransactionSheetProps> = ({
  isOpen,
  onClose,
  themeColor,
}) => {
  const [formatCurrency] = useformatCurrency()
  const defaultTokenLogo = useDefaultTokenLogo()
  const activeChain = useActiveChain()

  const {
    memo,
    setMemo,
    selectedToken,
    selectedAddress,
    fee,
    showLedgerPopup,
    inputAmount,
    tokenFiatValue,
    isSending,
    txError,
    feeDenom,
    isIBCTransfer,
    sendDisabled,
    confirmSend,
    clearTxError,
    userPreferredGasPrice,
    userPreferredGasLimit,
    gasEstimate,
    feeTokenFiatValue,
    customIbcChannelId,
  } = useSendContext()

  const gasAdjustment = useGasAdjustmentForChain()

  const fiatValue = useMemo(
    () => formatCurrency(new BigNumber(inputAmount).multipliedBy(tokenFiatValue ?? 0)),
    [formatCurrency, inputAmount, tokenFiatValue],
  )

  const displayFee = useMemo(() => {
    if (!userPreferredGasPrice) {
      return {
        value: 0,
        formattedAmount: '',
        fiatValue: '',
      }
    }
    const { amount, formattedAmount } = calculateFeeAmount({
      gasPrice: userPreferredGasPrice.amount.toFloatApproximation(),
      gasLimit: userPreferredGasLimit ?? gasEstimate,
      feeDenom,
      gasAdjustment,
    })

    return {
      value: amount.toNumber(),
      formattedAmount: formattedAmount,
      fiatValue: feeTokenFiatValue ? formatCurrency(amount.multipliedBy(feeTokenFiatValue)) : '',
    }
  }, [
    feeDenom,
    feeTokenFiatValue,
    formatCurrency,
    gasAdjustment,
    gasEstimate,
    userPreferredGasLimit,
    userPreferredGasPrice,
  ])

  const handleSend = useCallback(async () => {
    clearTxError()
    if (!fee || !selectedAddress?.address) {
      return
    }
    try {
      await confirmSend({
        selectedToken: selectedToken as Token,
        toAddress: selectedAddress.address,
        amount: new BigNumber(inputAmount),
        memo: memo,
        fees: fee,
      })
    } catch (err: unknown) {
      //
    }
  }, [clearTxError, confirmSend, fee, inputAmount, memo, selectedAddress, selectedToken])

  useCaptureTxError(txError)

  if (showLedgerPopup && !txError) {
    return <LedgerConfirmationPopup showLedgerPopup />
  }

  return (
    <BottomModal
      isOpen={isOpen}
      closeOnBackdropClick={true}
      onClose={onClose}
      title='Review Transaction'
      className='p-0'
    >
      <>
        {isIBCTransfer && selectedAddress ? <IBCBanner channelId={customIbcChannelId} /> : null}
        <div className='flex flex-col items-center w-full gap-y-4 my-7'>
          <div className='rounded-2xl dark:bg-gray-900 bg-white-100 rounded-4 items-center'>
            <Text size='xs' className='pl-4 pr-4 pt-4 font-bold' color='text-gray-200'>
              Sending
            </Text>
            <div className='relative'>
              {selectedToken?.ibcChainInfo && (
                <div className='absolute flex top-4 left-[68px] items-center'>
                  <p className='mr-1 invisible font-bold'>
                    {`${inputAmount} ${selectedToken.symbol}`}
                  </p>
                  <Badge
                    text={`${selectedToken.ibcChainInfo.pretty_name} / ${selectedToken.ibcChainInfo.channelId}`}
                  />
                </div>
              )}
              <Card
                avatar={
                  <Avatar
                    avatarImage={selectedToken?.img ?? defaultTokenLogo}
                    size='sm'
                    avatarOnError={imgOnError(defaultTokenLogo)}
                  />
                }
                isRounded
                size='md'
                subtitle={<p>{fiatValue}</p>}
                title={
                  <p data-testing-id='send-review-sheet-inputAmount-ele'>
                    {inputAmount}
                    {selectedToken?.symbol ? ` ${selectedToken.symbol}` : ''}
                  </p>
                }
              />
            </div>
            <CardDivider />
            <Card
              avatar={
                <Avatar
                  avatarImage={selectedAddress?.avatarIcon}
                  emoji={selectedAddress?.emoji}
                  chainIcon={selectedAddress?.chainIcon}
                  size='sm'
                />
              }
              isRounded
              size='md'
              subtitle={
                <>
                  {sliceAddress(selectedAddress?.address)}
                  {selectedAddress?.information?.nameService ? (
                    <> &middot; {selectedAddress.information.nameService}</>
                  ) : null}
                </>
              }
              title={
                <p data-testing-id='send-review-sheet-to-ele'>
                  {'To ' +
                    (selectedAddress?.ethAddress
                      ? sliceAddress(selectedAddress.ethAddress)
                      : selectedAddress?.name)}
                </p>
              }
            />
          </div>
          <Memo
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value)
            }}
          />

          {FIXED_FEE_CHAINS.includes(activeChain) ? (
            <FixedFee />
          ) : (
            <div className='flex items-center justify-center text-gray-600 dark:text-gray-200'>
              <p className='font-semibold text-center text-sm'>Transaction fee: </p>
              <p className='font-semibold text-center text-sm ml-1'>
                <strong data-testing-id='send-review-sheet-fee-ele'>
                  {displayFee.formattedAmount} {feeDenom.coinDenom}
                </strong>{' '}
                {displayFee.fiatValue ? `(${displayFee.fiatValue})` : null}
              </p>
            </div>
          )}

          <Buttons.Generic
            color={themeColor}
            size='normal'
            className='w-[344px]'
            title='Send'
            onClick={handleSend}
            disabled={showLedgerPopup || isSending || sendDisabled}
            data-testing-id='send-review-sheet-send-btn'
          >
            {isSending ? <LoaderAnimation color={Colors.white100} /> : 'Send'}
          </Buttons.Generic>
          {txError ? <ErrorCard text={txError} /> : null}
        </div>
      </>
    </BottomModal>
  )
}
