import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { Avatar, Buttons, Card, HeaderActionType, Memo } from '@leapwallet/leap-ui'
import React, { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import Badge from '~/components/badge'
import BottomSheet from '~/components/bottom-sheet'
import CardDivider from '~/components/card-divider'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { Token } from '~/types/bank'
import { sliceAddress } from '~/util/strings'

import { SelectedAddress } from '../types'

export type ReviewTransactionSheetProps = {
  memo: string
  setMemo: (s: string) => void
  feesText: string
  sendAmt: string
  isLoading: boolean
  selectedDenom: Pick<Token, 'symbol' | 'img' | 'ibcChainInfo'>
  valueInPreferredCurrency: string
  selectedAddress: SelectedAddress
  isVisible: boolean
  onSend: () => void
  onCloseHandler?: () => void
  showLedgerPopup?: boolean
  signingError?: string
}

export default function ReviewTransactionSheet({
  memo,
  setMemo,
  valueInPreferredCurrency,
  onSend,
  feesText,
  isVisible,
  selectedDenom,
  sendAmt,
  selectedAddress,
  onCloseHandler,
  showLedgerPopup,
}: ReviewTransactionSheetProps): ReactElement {
  const activeChain = useActiveChain()
  const navigate = useNavigate()

  const handleSend = () => {
    onSend()
    onCloseHandler()
    navigate('/')
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      headerTitle='Review Transaction'
      headerActionType={HeaderActionType.CANCEL}
    >
      <>
        <div className='flex flex-col items-center w-full gap-y-[16px] mt-[28px] mb-[40px]'>
          <div className=' dark:bg-gray-900 bg-white-100 rounded-[16px]  items-center'>
            <Text
              size='xs'
              className='pl-[16px] pr-[16px] pt-[16px] font-bold'
              color='text-gray-200'
            >
              Sending
            </Text>
            <div className='relative'>
              {selectedDenom.ibcChainInfo && (
                <div className='absolute flex top-[16px] left-[68px] items-center'>
                  <div className='mr-1 invisible font-bold'>
                    {sendAmt + ' ' + selectedDenom.symbol}{' '}
                  </div>
                  <Badge
                    image={selectedDenom.ibcChainInfo.icon}
                    text={`${selectedDenom.ibcChainInfo.pretty_name} / ${selectedDenom.ibcChainInfo.channelId}`}
                  />
                </div>
              )}
              <Card
                avatar={<Avatar avatarImage={selectedDenom.img} size='sm' />}
                isRounded
                size='md'
                subtitle={valueInPreferredCurrency}
                title={sendAmt + ' ' + selectedDenom.symbol}
              />
            </div>
            <CardDivider />
            <Card
              avatar={
                <Avatar
                  avatarImage={selectedAddress.avatarIcon}
                  emoji={selectedAddress.emoji}
                  chainIcon={selectedAddress.chainIcon}
                  size='sm'
                />
              }
              isRounded
              size='md'
              subtitle={
                <>
                  Chain: {selectedAddress.chainName} · {sliceAddress(selectedAddress.address)}
                </>
              }
              title={'To ' + selectedAddress.name}
            />
          </div>
          <Memo
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value)
            }}
          />

          <Text size='sm' color='text-gray-400 dark:text-gray-600' className='justify-center'>
            {feesText}
          </Text>

          <Buttons.Generic
            color={ChainInfos[activeChain].theme.primaryColor}
            size='normal'
            className='w-[344px]'
            title='Send'
            onClick={handleSend}
            disabled={showLedgerPopup}
          >
            Send
          </Buttons.Generic>
        </div>
      </>
    </BottomSheet>
  )
}
