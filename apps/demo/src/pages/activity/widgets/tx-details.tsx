import { ActivityCardContent } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { ParsedTx } from '@leapwallet/cosmos-wallet-sdk/dist/types/activity'
import { Avatar, Buttons, Card, GenericCard, Header, HeaderActionType } from '@leapwallet/leap-ui'
import dayjs from 'dayjs'
import { Images } from 'images'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import PopupLayout from '~/components/popup-layout'
import { useActivityImage } from '~/hooks/activity/use-activity-image'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useCurrentNetwork } from '~/hooks/settings/use-current-network'
import { useAddress } from '~/hooks/wallet/use-address'
import { Colors } from '~/theme/colors'
import { AddressBook } from '~/util/addressbook'
import { formatTokenAmount, sliceAddress } from '~/util/strings'

import { ActivityIcon } from './activity-icon'

export type TxDetailsProps = {
  parsedTx: ParsedTx
  content: ActivityCardContent
  onBack: () => void
}

const txDataMap = {
  send: { icon: Images.Activity.SendDetails, title: 'Sent' },
  receive: { icon: Images.Activity.ReceiveDetails, title: 'Received' },
  pending: { icon: Images.Activity.PendingDetails, title: 'Pending' },
  delegate: { icon: Images.Activity.DelegateDetails, title: 'Delegated' },
  undelegate: { icon: Images.Activity.UndelegateDetails, title: 'Undelegated' },
  'ibc/transfer': { icon: Images.Activity.SwapDetails, title: 'IBC Transfer' },
  vote: { icon: Images.Activity.TxHash, title: 'Voted' },
  swap: { icon: Images.Logos.JunoSwap, title: 'Swap' },
  fallback: { icon: Images.Activity.SendDetails, title: 'Success' },
}

function TxDetails({ parsedTx, content, onBack }: TxDetailsProps) {
  const activeChain = useActiveChain()
  const selectedNetwork = useCurrentNetwork()
  const copyAddressRef = useRef(null)
  const copyTxHashRef = useRef(null)

  const [contact, setContact] = useState<{ name: string; emoji: number }>({ name: '', emoji: 0 })

  const getTxnUrl = useCallback(
    (txhash: string) => {
      return `${ChainInfos[activeChain].txExplorer[selectedNetwork]?.txUrl}/${txhash}`
    },
    [activeChain, selectedNetwork],
  )

  const { sentAmount, sentTokenInfo, sentUsdValue, txType, secondaryImg } = content

  const img = useActivityImage({ txType, content })

  const data = txDataMap[txType]

  const date = dayjs(parsedTx.timestamp).format('D MMMM YYYY h:mm A')
  const amountInfo =
    sentAmount && sentTokenInfo?.coinDenom
      ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom)
      : undefined
  const address = useAddress()

  useEffect(() => {
    const contact = AddressBook.getEntry(
      content.txType === 'send'
        ? parsedTx.toAddress
        : content.txType === 'receive'
        ? parsedTx.fromAddress
        : '',
    )
    if (contact) setContact({ name: contact?.name, emoji: contact.emoji })
  }, [parsedTx, content, setContact])

  return (
    <PopupLayout>
      <Header
        action={{
          onClick: function noRefCheck() {
            onBack()
          },
          type: HeaderActionType.BACK,
        }}
        title={'Transaction Details'}
      />
      <div className='flex flex-col justify-start items-center p-7 h-[calc(100% - 60px)]'>
        <div className='bg-white-100 dark:bg-gray-900 rounded-2xl w-full flex flex-col items-center p-7'>
          {content.txType === 'vote' ? (
            <ActivityIcon
              img={img}
              voteOption={content.title1}
              secondaryImg={secondaryImg}
              type={txType}
              size='lg'
            />
          ) : (
            <img src={data.icon} className='h-16 w-16 mb-3' />
          )}
          <div className='font-black text-2xl text-black-100 dark:text-white-100'>
            {content.txType === 'vote' ? content.title1 : data.title}
          </div>
          {content.txType === 'vote' && (
            <div className='text-base text-gray-600 font-bold'>{content.subtitle1}</div>
          )}
          {
            <div className='flex my-2 items-center'>
              {amountInfo && (
                <>
                  <img src={img} className='h-4 w-4 mr-1' />
                  <div className='text-base text-gray-600 font-bold'>{amountInfo}</div>
                </>
              )}
              {sentUsdValue && (
                <div className='text-base text-gray-600 font-bold'>
                  &nbsp; (~ ${Number(sentUsdValue).toFixed(3)})
                </div>
              )}
            </div>
          }
          <div className='text-xs text-gray-400'>{date}</div>
        </div>
        <div className='tx-details-container rounded-2xl overflow-hidden w-full m-4'>
          {content.txType === 'send' ? (
            <GenericCard
              title={'Sent to ' + contact.name}
              img={<Avatar emoji={contact.emoji} size='sm' className='mr-3' />}
              subtitle={sliceAddress(parsedTx.toAddress)}
              onClick={async () => {
                copyAddressRef.current?.click()
                await navigator.clipboard.writeText(parsedTx.toAddress)
              }}
              size='md'
              icon={
                <Buttons.CopyWalletAddress
                  copyIcon={Images.Activity.Copy}
                  ref={copyAddressRef}
                  color={Colors.green600}
                />
              }
            />
          ) : content.txType === 'receive' ? (
            <GenericCard
              title={'Received from ' + contact.name}
              img={<Avatar emoji={contact.emoji} size='sm' className='mr-3' />}
              subtitle={sliceAddress(parsedTx.fromAddress)}
              onClick={async () => {
                copyAddressRef.current?.click()
                await navigator.clipboard.writeText(parsedTx.fromAddress)
              }}
              size='md'
              icon={
                <Buttons.CopyWalletAddress
                  copyIcon={Images.Activity.Copy}
                  ref={copyAddressRef}
                  color={Colors.green600}
                />
              }
            />
          ) : (
            content.txType === 'ibc/transfer' && (
              <GenericCard
                title={
                  parsedTx.fromAddress === address
                    ? 'Sent to ' + contact.name
                    : 'Received from ' + contact.name
                }
                img={<Avatar emoji={contact.emoji} size='sm' className='mr-3' />}
                subtitle={
                  parsedTx.fromAddress === address
                    ? sliceAddress(parsedTx.toAddress)
                    : sliceAddress(parsedTx.fromAddress)
                }
                onClick={async () => {
                  copyAddressRef.current?.click()
                  await navigator.clipboard.writeText(
                    parsedTx.fromAddress === address ? parsedTx.toAddress : parsedTx.fromAddress,
                  )
                }}
                size='md'
                icon={
                  <Buttons.CopyWalletAddress
                    copyIcon={Images.Activity.Copy}
                    ref={copyAddressRef}
                    color={Colors.green600}
                  />
                }
              />
            )
          )}
        </div>
        <div className='tx-details-container rounded-2xl overflow-hidden w-full m-4'>
          <GenericCard
            title='Transaction ID'
            img={<img className='mr-3' src={Images.Activity.TxHash} />}
            subtitle={sliceAddress(parsedTx.txhash)}
            onClick={async () => {
              copyTxHashRef.current?.click()
              await navigator.clipboard.writeText(parsedTx.txhash)
            }}
            size='md'
            icon={
              <Buttons.CopyWalletAddress
                copyIcon={Images.Activity.Copy}
                ref={copyTxHashRef}
                color={Colors.green600}
              />
            }
          />
          {content.feeAmount && (
            <Card
              title='Transaction Fee'
              imgSrc={Images.Activity.TxFee}
              subtitle={content.feeAmount}
              size='md'
            />
          )}
        </div>
        <Buttons.Generic
          className='w-full py-3 mt-4'
          size='normal'
          onClick={() => window.open(getTxnUrl(parsedTx.txhash), '_blank')}
        >
          <div className={'flex justify-center text-black-100  items-center'}>
            <span className='mr-2 material-icons-round'>open_in_new</span>
            <span>View on {ChainInfos[activeChain].txExplorer[selectedNetwork]?.name}</span>
          </div>
        </Buttons.Generic>
      </div>
    </PopupLayout>
  )
}

export default TxDetails
