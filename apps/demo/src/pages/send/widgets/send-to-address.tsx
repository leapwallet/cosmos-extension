import { getBlockChainFromAddress } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar, Buttons, Card, SendInput } from '@leapwallet/leap-ui'
import { Images } from 'images'
import React, { ReactElement, useState } from 'react'
import { Colors } from 'theme/colors'

import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useFormatCurrency } from '~/hooks/settings/use-currency'
import useSend from '~/hooks/wallet/use-send'
import { AddressBook } from '~/util/addressbook'
import { sliceAddress } from '~/util/strings'

import { SelectedAddress } from '../types'
import ChooseTokenSheet from './choose-token-sheet'
import ReviewTransactionSheet from './review-transaction-sheet'
import WalletDetailsSheet from './wallet-details-sheet'

export type SelectedDenom = {
  denom: string
  img: string
  amount: string
}

export type SendToAddressProps = {
  selectedAddress: SelectedAddress
  onBack?: () => void
}

export default function SendToAddress({
  selectedAddress,
  onBack,
}: SendToAddressProps): ReactElement {
  const [showReviewTransactionSheet, setReviewTransactionSheet] = useState<boolean>(false)
  const [showContactDetailsSheet, setShowContactDetailsSheet] = useState<boolean>(false)
  const contact = AddressBook.useGetContact(selectedAddress.address)
  const formatCurrency = useFormatCurrency()
  const activeChain = useActiveChain()
  const [showChooseTokenSheet, setChooseTokenSheet] = useState<boolean>(false)

  const {
    address,
    selectedDenom,
    setSelectedDenom,
    inputAmount,
    setInputAmount,
    inputPreferredCurrencyValue,
    balances,
    currentDenomBalance,
    fee,
    feePreferredCurrencyValue,
    memo,
    setMemo,
    send,
  } = useSend(selectedAddress.address)

  const isIBC =
    getBlockChainFromAddress(selectedAddress.address) !== getBlockChainFromAddress(address)

  const onMaxClick = () => {
    setInputAmount(currentDenomBalance.toString())
  }

  const v = Number(inputAmount.trim())
  const disableReview = !inputAmount.trim() || v > 49.25

  const displayFeeText =
    inputAmount.trim().length === 0
      ? 'Enter amount to see the transaction fee'
      : `Transaction fee: ${fee} ATOM (${formatCurrency(feePreferredCurrencyValue)})`

  return (
    <>
      <div className='flex flex-col mb-[32px] p-[28px] gap-y-[16px] justify-center items-center overflow-scroll'>
        <Card
          avatar={
            <Avatar
              avatarImage={selectedAddress.avatarIcon}
              emoji={contact?.emoji}
              chainIcon={selectedAddress.chainIcon}
              size='sm'
            />
          }
          isRounded
          iconSrc={selectedAddress.selectionType === 'saved' ? Images.Misc.Menu : undefined}
          onClick={() => {
            if (selectedAddress.selectionType === 'saved') setShowContactDetailsSheet(true)
          }}
          size='md'
          subtitle={
            <>
              Chain: {selectedAddress.chainName} ·{' '}
              {selectedAddress.selectionType === 'notSaved' ? (
                <span className='text-orange-300'>{'Not in contacts'}</span>
              ) : (
                sliceAddress(selectedAddress.address)
              )}
            </>
          }
          title={'To ' + (contact?.name ?? selectedAddress.name)}
        />
        <SendInput
          setAmount={setInputAmount}
          amount={inputAmount}
          balance={currentDenomBalance.toString()}
          icon={selectedDenom.img}
          name={selectedDenom.symbol.toUpperCase()}
          onMaxClick={onMaxClick}
          usdValue={inputPreferredCurrencyValue}
          onTokenClick={() => setChooseTokenSheet(true)}
        />
        {isIBC && (
          <div className='dark:bg-gray-900 p-[16px] pr-[21px] w-[344px] h-[86px] bg-white-100 rounded-2xl justify-center flex'>
            <img className='mr-[16px]' src={Images.Misc.Warning} />
            <div className='flex flex-col gap-y-[2px]'>
              <Text size='sm' className='tex font-black'>
                Transfer a small amount
              </Text>
              <Text size='xs' color='text-gray-400'>
                We recommend only transferring small amounts since IBC is a new technology
              </Text>
            </div>
          </div>
        )}

        <Buttons.Generic
          color={Colors.getChainColor(activeChain)}
          size='normal'
          className='w-[344px] '
          title='Review'
          disabled={disableReview}
          onClick={() => {
            if (!disableReview) setReviewTransactionSheet(true)
          }}
        >
          Review
        </Buttons.Generic>
        <Text size='sm' color='text-gray-400 dark:text-gray-600' className='justify-center'>
          {displayFeeText}
        </Text>
      </div>
      {showReviewTransactionSheet && (
        <ReviewTransactionSheet
          isVisible={showReviewTransactionSheet}
          isLoading={false}
          sendAmt={inputAmount}
          valueInPreferredCurrency={inputPreferredCurrencyValue}
          onSend={() => send(selectedDenom, inputAmount)}
          feesText={displayFeeText}
          selectedAddress={selectedAddress}
          memo={memo}
          selectedDenom={selectedDenom}
          setMemo={setMemo}
          onCloseHandler={() => {
            setReviewTransactionSheet(false)
          }}
          showLedgerPopup={false}
        />
      )}
      {showChooseTokenSheet && selectedDenom && (
        <ChooseTokenSheet
          balances={balances}
          isVisible={showChooseTokenSheet}
          selectedToken={selectedDenom}
          onSelectToken={setSelectedDenom}
          onCloseHandler={() => {
            setChooseTokenSheet(false)
          }}
        />
      )}
      {showContactDetailsSheet && (
        <WalletDetailsSheet
          isVisible={showContactDetailsSheet}
          selectedAddress={selectedAddress}
          onDelete={() => {
            onBack && onBack()
          }}
          onCloseHandler={() => {
            setShowContactDetailsSheet(false)
          }}
        />
      )}
    </>
  )
}
